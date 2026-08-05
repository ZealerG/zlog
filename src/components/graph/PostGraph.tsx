"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Maximize2,
  Network,
  Search,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import {
  Component,
  type FormEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import type { ForceGraphMethods } from "react-force-graph-2d"
import type {
  PostGraphData,
  PostGraphLink,
  PostGraphNode,
} from "@/lib/content/post-graph"

const ForceGraph2D = dynamic(
  () => import("react-force-graph-2d").then((module) => module.default),
  {
    ssr: false,
    loading: () => <GraphLoading />,
  },
)

type PostGraphProps = {
  data: PostGraphData
  variant?: "full" | "compact"
}

type MutableGraphNode = PostGraphNode & {
  x?: number
  y?: number
  vx?: number
  vy?: number
  fx?: number
  fy?: number
}

type MutableGraphLink = Omit<PostGraphLink, "source" | "target"> & {
  source: string | number | MutableGraphNode
  target: string | number | MutableGraphNode
}

type GraphPalette = {
  background: string
  line: string
  muted: string
  primary: string
  primarySoft: string
  text: string
  fontFamily: string
}

const DEFAULT_PALETTE: GraphPalette = {
  background: "#09090b",
  line: "#3f3f46",
  muted: "#a1a1aa",
  primary: "rgb(56, 189, 248)",
  primarySoft: "rgba(56, 189, 248, 0.42)",
  text: "#ededed",
  fontFamily: "system-ui, sans-serif",
}

function GraphLoading() {
  return (
    <div className="grid h-full min-h-40 place-items-center bg-n-1/35" aria-live="polite">
      <div className="relative h-14 w-20" aria-hidden>
        <span className="absolute left-1 top-6 size-2 rounded-full bg-n-3" />
        <span className="absolute left-8 top-1 size-2.5 rounded-full bg-primary/55" />
        <span className="absolute right-1 top-7 size-2 rounded-full bg-n-4" />
        <span className="absolute bottom-1 left-10 size-2 rounded-full bg-n-3" />
      </div>
      <span className="sr-only">正在加载文章关系图谱</span>
    </div>
  )
}

class GraphErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="grid h-full min-h-40 place-items-center px-6 text-center" role="alert">
          <div>
            <Network className="mx-auto size-5 text-n-4" aria-hidden />
            <p className="mt-3 text-sm text-n-5">图谱暂时无法显示。</p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function useElementSize(ref: RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const update = (width: number, height: number) => {
      const next = {
        width: Math.max(0, Math.round(width)),
        height: Math.max(0, Math.round(height)),
      }
      setSize((current) =>
        current.width === next.width && current.height === next.height
          ? current
          : next,
      )
    }

    const observer = new ResizeObserver(([entry]) => {
      if (entry) update(entry.contentRect.width, entry.contentRect.height)
    })
    observer.observe(element)
    update(element.clientWidth, element.clientHeight)
    return () => observer.disconnect()
  }, [ref])

  return size
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])

  return reduced
}

function useGraphPalette() {
  const [palette, setPalette] = useState(DEFAULT_PALETTE)

  useEffect(() => {
    const root = document.documentElement
    const update = () => {
      const style = getComputedStyle(root)
      const primaryParts = style
        .getPropertyValue("--primary-rgb")
        .trim()
        .split(/\s+/)
      const primaryRgb =
        primaryParts.length === 3 ? primaryParts.join(", ") : "56, 189, 248"

      setPalette({
        background: style.getPropertyValue("--n-0").trim() || "#09090b",
        line: style.getPropertyValue("--n-3").trim() || "#3f3f46",
        muted: style.getPropertyValue("--n-5").trim() || "#a1a1aa",
        primary: `rgb(${primaryRgb})`,
        primarySoft: `rgba(${primaryRgb}, 0.42)`,
        text: style.getPropertyValue("--n-6").trim() || "#ededed",
        fontFamily: getComputedStyle(document.body).fontFamily,
      })
    }

    update()
    const observer = new MutationObserver(update)
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    })
    return () => observer.disconnect()
  }, [])

  return palette
}

function endpointId(endpoint: MutableGraphLink["source"]): string {
  return typeof endpoint === "object" ? endpoint.id : String(endpoint)
}

function truncateLabel(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-n-5 transition hover:bg-primary/10 hover:text-primary active:scale-[0.98]"
    >
      {children}
    </button>
  )
}

export function PostGraph({ data, variant = "full" }: PostGraphProps) {
  const compact = variant === "compact"
  const router = useRouter()
  const canvasRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<ForceGraphMethods | undefined>(undefined)
  const fittedRef = useRef(false)
  const userInteractedRef = useRef(false)
  const pendingFocusRef = useRef<string | null>(null)
  const focusRetryFrameRef = useRef<number | null>(null)
  const size = useElementSize(canvasRef)
  const reducedMotion = usePrefersReducedMotion()
  const palette = useGraphPalette()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)

  const graphData = useMemo(
    () => ({
      nodes: data.nodes.map((node) => ({ ...node })) as MutableGraphNode[],
      links: data.links.map((link) => ({ ...link })) as MutableGraphLink[],
    }),
    [data],
  )
  const nodesById = useMemo(
    () => new Map(data.nodes.map((node) => [node.id, node])),
    [data.nodes],
  )
  const selectedNode = selectedId ? nodesById.get(selectedId) : undefined
  const activeId = hoveredId ?? selectedId
  const activeNodeIds = useMemo(() => {
    const ids = new Set<string>()
    if (!activeId) return ids
    ids.add(activeId)
    for (const link of data.links) {
      if (link.source === activeId) ids.add(link.target)
      if (link.target === activeId) ids.add(link.source)
    }
    return ids
  }, [activeId, data.links])
  const topNodes = useMemo(
    () =>
      [...data.nodes]
        .sort(
          (a, b) =>
            b.degree - a.degree ||
            (a.title < b.title ? -1 : a.title > b.title ? 1 : 0),
        )
        .slice(0, 6),
    [data.nodes],
  )
  const labelNodeIds = useMemo(
    () =>
      new Set(
        [...data.nodes]
          .sort(
            (a, b) =>
              b.degree - a.degree ||
              (a.title < b.title ? -1 : a.title > b.title ? 1 : 0),
          )
          .slice(0, compact ? 12 : 64)
          .map((node) => node.id),
      ),
    [compact, data.nodes],
  )
  const searchResults = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase()
    if (!normalized) return []
    return data.nodes
      .filter((node) =>
        [node.title, node.id, node.category ?? "", ...node.tags]
          .join(" ")
          .toLocaleLowerCase()
          .includes(normalized),
      )
      .slice(0, 6)
  }, [data.nodes, query])
  const outgoing = useMemo(
    () =>
      selectedId
        ? data.links
            .filter((link) => link.source === selectedId)
            .map((link) => nodesById.get(link.target))
            .filter((node): node is PostGraphNode => Boolean(node))
        : [],
    [data.links, nodesById, selectedId],
  )
  const incoming = useMemo(
    () =>
      selectedId
        ? data.links
            .filter((link) => link.target === selectedId)
            .map((link) => nodesById.get(link.source))
            .filter((node): node is PostGraphNode => Boolean(node))
        : [],
    [data.links, nodesById, selectedId],
  )

  useEffect(() => {
    fittedRef.current = false
    userInteractedRef.current = false
    pendingFocusRef.current = null
    if (focusRetryFrameRef.current !== null) {
      cancelAnimationFrame(focusRetryFrameRef.current)
      focusRetryFrameRef.current = null
    }

    return () => {
      if (focusRetryFrameRef.current !== null) {
        cancelAnimationFrame(focusRetryFrameRef.current)
        focusRetryFrameRef.current = null
      }
    }
  }, [graphData])

  const fitGraph = useCallback(() => {
    graphRef.current?.zoomToFit(reducedMotion ? 0 : 420, compact ? 18 : 44)
  }, [compact, reducedMotion])

  const markUserInteraction = useCallback(() => {
    userInteractedRef.current = true
    fittedRef.current = true
  }, [])

  const applyNodeFocus = useCallback(
    (id: string): boolean => {
      const node = graphData.nodes.find((candidate) => candidate.id === id)
      if (!node || typeof node.x !== "number" || typeof node.y !== "number") {
        return false
      }

      pendingFocusRef.current = null
      fittedRef.current = true
      const duration = reducedMotion ? 0 : 360
      graphRef.current?.centerAt(node.x, node.y, duration)
      graphRef.current?.zoom(compact ? 2.6 : 2.2, duration)
      return true
    },
    [compact, graphData.nodes, reducedMotion],
  )

  const focusNode = useCallback(
    (id: string) => {
      setSelectedId(id)
      setSearchOpen(false)
      pendingFocusRef.current = id
      markUserInteraction()
      applyNodeFocus(id)
    },
    [applyNodeFocus, markUserInteraction],
  )

  const handleEngineStop = useCallback(() => {
    const pendingId = pendingFocusRef.current
    if (pendingId) {
      const retryFocus = (attemptsLeft: number) => {
        if (pendingFocusRef.current !== pendingId || applyNodeFocus(pendingId)) {
          focusRetryFrameRef.current = null
          return
        }
        if (attemptsLeft <= 0) {
          focusRetryFrameRef.current = null
          return
        }
        focusRetryFrameRef.current = requestAnimationFrame(() => {
          retryFocus(attemptsLeft - 1)
        })
      }
      retryFocus(4)
      return
    }

    if (fittedRef.current || userInteractedRef.current) return
    fittedRef.current = true
    fitGraph()
  }, [applyNodeFocus, fitGraph])

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const first = searchResults[0]
    if (first) focusNode(first.id)
  }

  const canvas = (
    <div
      ref={canvasRef}
      className={
        compact
          ? "relative h-52 min-w-0 overflow-hidden bg-n-0"
          : "relative h-[30rem] min-w-0 overflow-hidden bg-n-0 md:h-[min(68dvh,42rem)]"
      }
      role="img"
      aria-label={`文章关系图，共 ${data.nodes.length} 篇文章和 ${data.links.length} 条链接`}
      onPointerDown={markUserInteraction}
      onWheel={markUserInteraction}
    >
      {size.width > 0 && size.height > 0 ? (
        <GraphErrorBoundary>
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            width={size.width}
            height={size.height}
            backgroundColor={palette.background}
            nodeId="id"
            nodeLabel={(rawNode) => {
              const node = rawNode as MutableGraphNode
              return `${node.title} (${node.degree})`
            }}
            nodeVal={(rawNode) => {
              const node = rawNode as MutableGraphNode
              return 2.2 + Math.min(5, node.degree * 0.9)
            }}
            nodeColor={(rawNode) => {
              const node = rawNode as MutableGraphNode
              if (node.id === activeId) return palette.primary
              if (activeId && activeNodeIds.has(node.id)) {
                return palette.primarySoft
              }
              if (activeId) return palette.line
              return node.degree > 0 ? palette.muted : palette.line
            }}
            nodeCanvasObjectMode={() => "after"}
            nodeCanvasObject={(rawNode, context, globalScale) => {
              const node = rawNode as MutableGraphNode
              const activeOrRelated =
                node.id === activeId ||
                Boolean(activeId && activeNodeIds.has(node.id))
              if (!activeOrRelated && !labelNodeIds.has(node.id)) {
                return
              }
              if (!activeOrRelated && globalScale < (compact ? 1.35 : 0.7)) {
                return
              }

              const label = truncateLabel(node.title, compact ? 12 : 22)
              const fontSize = (compact ? 10 : 11) / globalScale
              const x = (node.x ?? 0) + 6 / globalScale
              const y = node.y ?? 0
              context.save()
              context.font = `500 ${fontSize}px ${palette.fontFamily}`
              context.textBaseline = "middle"
              context.globalAlpha = activeId && !activeNodeIds.has(node.id) ? 0.32 : 0.9
              context.fillStyle = node.id === activeId ? palette.primary : palette.text
              context.fillText(label, x, y)
              context.restore()
            }}
            linkColor={(rawLink) => {
              const link = rawLink as MutableGraphLink
              const active =
                activeId &&
                (endpointId(link.source) === activeId ||
                  endpointId(link.target) === activeId)
              return active ? palette.primarySoft : palette.line
            }}
            linkWidth={(rawLink) => {
              const link = rawLink as MutableGraphLink
              return activeId &&
                (endpointId(link.source) === activeId ||
                  endpointId(link.target) === activeId)
                ? 1.8
                : 0.65
            }}
            linkDirectionalArrowLength={compact ? 0 : 2.8}
            linkDirectionalArrowRelPos={0.86}
            linkDirectionalArrowColor={(rawLink) => {
              const link = rawLink as MutableGraphLink
              return activeId &&
                (endpointId(link.source) === activeId ||
                  endpointId(link.target) === activeId)
                ? palette.primary
                : palette.line
            }}
            warmupTicks={reducedMotion ? 100 : 18}
            cooldownTicks={reducedMotion ? 0 : 120}
            d3AlphaDecay={0.04}
            d3VelocityDecay={0.32}
            minZoom={0.45}
            maxZoom={8}
            enableNodeDrag={!reducedMotion}
            onEngineStop={handleEngineStop}
            onNodeHover={(rawNode) =>
              setHoveredId(rawNode ? String(rawNode.id) : null)
            }
            onNodeClick={(rawNode) => {
              const id = String(rawNode.id)
              if (compact) router.push(`/posts/${id}`)
              else focusNode(id)
            }}
            onBackgroundClick={() => {
              if (!compact) {
                pendingFocusRef.current = null
                setSelectedId(null)
              }
            }}
            showPointerCursor={(object) => Boolean(object)}
          />
        </GraphErrorBoundary>
      ) : (
        <GraphLoading />
      )}
    </div>
  )

  if (data.nodes.length === 0) {
    return (
      <section className={compact ? "posts-sidebar-card" : "mt-8 border-y border-n-2 py-16"}>
        <Network className="mx-auto size-5 text-n-4" aria-hidden />
        <p className="mt-3 text-center text-sm text-n-5">暂无可展示的文章关系。</p>
      </section>
    )
  }

  if (compact) {
    return (
      <section className="posts-sidebar-card overflow-hidden" aria-labelledby="compact-post-graph-title">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="compact-post-graph-title" className="text-sm font-medium text-n-6">
              文章关系
            </h2>
            <p className="mt-1 text-xs text-n-4">
              {data.nodes.length} 篇 / {data.links.length} 条链接
            </p>
          </div>
          <Link
            href="/graph"
            aria-label="打开完整文章关系图谱"
            title="打开完整图谱"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-n-5 transition hover:bg-primary/10 hover:text-primary active:scale-[0.98]"
          >
            <Maximize2 className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="-mx-4 mt-3 border-y border-n-2">{canvas}</div>
        <Link
          href="/graph"
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-n-5 transition hover:text-primary"
        >
          查看完整图谱
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
        <ul className="sr-only" aria-label="图谱中的文章">
          {data.nodes.map((node) => (
            <li key={node.id}>
              <Link href={`/posts/${node.id}`}>{node.title}</Link>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  return (
    <section className="mt-8 overflow-hidden rounded-lg border border-n-2 bg-n-0/55" aria-label="文章关系图谱工具">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-n-2 px-3 py-3 sm:px-4">
        <form
          className="relative min-w-0 flex-1 sm:max-w-sm"
          onSubmit={handleSearch}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setSearchOpen(false)
            }
          }}
        >
          <label htmlFor="post-graph-search" className="sr-only">
            搜索文章节点
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-n-4" aria-hidden />
          <input
            id="post-graph-search"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setSearchOpen(true)
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder="搜索文章"
            className="h-9 w-full rounded-md border border-n-2 bg-n-0 pl-9 pr-3 text-sm text-n-6 outline-none transition placeholder:text-n-4 focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
          />
          {searchOpen && query.trim() ? (
            <div className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-20 overflow-hidden rounded-md border border-n-2 bg-n-0 p-1 shadow-lg">
              {searchResults.length > 0 ? (
                <ul>
                  {searchResults.map((node) => (
                    <li key={node.id}>
                      <button
                        type="button"
                        onClick={() => focusNode(node.id)}
                        className="block w-full rounded-sm px-2.5 py-2 text-left text-sm text-n-5 transition hover:bg-primary/8 hover:text-primary"
                      >
                        <span className="block truncate font-medium text-n-6">{node.title}</span>
                        <span className="mt-0.5 block truncate text-xs text-n-4">{node.id}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-2.5 py-3 text-sm text-n-4">没有匹配的文章。</p>
              )}
            </div>
          ) : null}
        </form>

        <div className="flex items-center gap-1" role="group" aria-label="图谱缩放控制">
          <IconButton
            label="缩小图谱"
            onClick={() => {
              markUserInteraction()
              const current = graphRef.current?.zoom() ?? 1
              graphRef.current?.zoom(Math.max(0.45, current / 1.35), reducedMotion ? 0 : 220)
            }}
          >
            <ZoomOut className="size-4" aria-hidden />
          </IconButton>
          <IconButton
            label="适应画布"
            onClick={() => {
              markUserInteraction()
              fitGraph()
            }}
          >
            <Maximize2 className="size-4" aria-hidden />
          </IconButton>
          <IconButton
            label="放大图谱"
            onClick={() => {
              markUserInteraction()
              const current = graphRef.current?.zoom() ?? 1
              graphRef.current?.zoom(Math.min(8, current * 1.35), reducedMotion ? 0 : 220)
            }}
          >
            <ZoomIn className="size-4" aria-hidden />
          </IconButton>
        </div>
      </div>

      <div className="grid min-w-0 lg:grid-cols-[minmax(0,1fr)_18rem]">
        {canvas}
        <aside className="min-w-0 border-t border-n-2 p-4 lg:border-l lg:border-t-0" aria-live="polite">
          {selectedNode ? (
            <div>
              <p className="text-xs text-n-4">
                {selectedNode.category ?? "未分类"} / {selectedNode.degree} 条连接
              </p>
              <h2 className="mt-2 text-base font-semibold leading-6 text-n-6">{selectedNode.title}</h2>
              {selectedNode.tags.length > 0 ? (
                <p className="mt-2 text-xs leading-5 text-n-4">
                  {selectedNode.tags.slice(0, 4).map((tag) => `#${tag}`).join("  ")}
                </p>
              ) : null}
              <Link
                href={`/posts/${selectedNode.id}`}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition hover:opacity-75"
              >
                阅读文章
                <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>

              {outgoing.length > 0 ? (
                <div className="mt-6">
                  <h3 className="text-xs font-medium text-n-4">链接至</h3>
                  <ul className="mt-2 space-y-1">
                    {outgoing.map((node) => (
                      <li key={node.id}>
                        <button
                          type="button"
                          onClick={() => focusNode(node.id)}
                          className="group flex w-full min-w-0 items-start gap-2 rounded-md px-2 py-1.5 text-left text-sm text-n-5 transition hover:bg-primary/8 hover:text-primary"
                        >
                          <ArrowUpRight className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                          <span className="min-w-0 truncate">{node.title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {incoming.length > 0 ? (
                <div className="mt-5">
                  <h3 className="text-xs font-medium text-n-4">被引用</h3>
                  <ul className="mt-2 space-y-1">
                    {incoming.map((node) => (
                      <li key={node.id}>
                        <button
                          type="button"
                          onClick={() => focusNode(node.id)}
                          className="group flex w-full min-w-0 items-start gap-2 rounded-md px-2 py-1.5 text-left text-sm text-n-5 transition hover:bg-primary/8 hover:text-primary"
                        >
                          <ArrowDownLeft className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                          <span className="min-w-0 truncate">{node.title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : (
            <div>
              <h2 className="text-sm font-medium text-n-6">连接最多</h2>
              <ol className="mt-3 space-y-1">
                {topNodes.map((node, index) => (
                  <li key={node.id}>
                    <button
                      type="button"
                      onClick={() => focusNode(node.id)}
                      className="grid w-full min-w-0 grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-2 rounded-md px-2 py-2 text-left transition hover:bg-primary/8"
                    >
                      <span className="text-xs tabular-nums text-n-4">{index + 1}</span>
                      <span className="truncate text-sm text-n-5">{node.title}</span>
                      <span className="text-xs tabular-nums text-n-4">{node.degree}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </aside>
      </div>

      <ul className="sr-only" aria-label="图谱中的全部文章">
        {data.nodes.map((node) => (
          <li key={node.id}>
            <Link href={`/posts/${node.id}`}>{node.title}</Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
