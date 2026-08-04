import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"
import remarkSmartypants from "remark-smartypants"
import remarkRehype from "remark-rehype"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeExternalLinks from "rehype-external-links"
import rehypeHighlight from "rehype-highlight"
import rehypeStringify from "rehype-stringify"
import { visit, SKIP } from "unist-util-visit"
import { toString } from "hast-util-to-string"
import type { Root, Element, ElementContent, Properties } from "hast"
import type { Link as MdastLink, Root as MdastRoot, Text as MdastText } from "mdast"
import type { Node as UnistNode, Parent as UnistParent } from "unist"
import { startTimer } from "@/lib/perf"
import { matchWikilinks, parseWikilinkTarget } from "./wikilink"

export type MarkdownHeading = {
  id: string
  text: string
  depth: number
}

function headingFragment(value: string): string {
  const heading: Element = {
    type: "element",
    tagName: "h2",
    properties: {},
    children: [{ type: "text", value }],
  }
  const tree: Root = { type: "root", children: [heading] }
  rehypeSlug()(tree)
  return typeof heading.properties.id === "string" ? heading.properties.id : ""
}

function wikilinkHref(rawTarget: string): string | null {
  const target = parseWikilinkTarget(rawTarget)
  if (!target) return null
  if (
    target.slug?.split("/").some((segment) => segment === "." || segment === "..")
  ) {
    return null
  }

  const base = target.slug ? `/posts/${target.slug}` : ""
  const fragment = target.heading ? headingFragment(target.heading) : ""
  if (!base && !fragment) return null
  return fragment ? `${base}#${fragment}` : base
}

function splitWikilinkText(node: MdastText): UnistNode[] {
  const matches = [...matchWikilinks(node.value)]
  if (matches.length === 0) return [node]

  const out: Array<MdastText | MdastLink> = []
  let cursor = 0
  for (const match of matches) {
    const start = match.index ?? 0
    if (start > cursor) {
      out.push({ type: "text", value: node.value.slice(cursor, start) })
    }

    const href = wikilinkHref(match[1])
    const label = match[2]?.trim() || match[1].trim()
    if (href) {
      out.push({
        type: "link",
        url: href,
        children: [{ type: "text", value: label }],
      })
    } else {
      out.push({ type: "text", value: match[0] })
    }
    cursor = start + match[0].length
  }

  if (cursor < node.value.length) {
    out.push({ type: "text", value: node.value.slice(cursor) })
  }
  return out
}

function isUnistParent(node: UnistNode): node is UnistParent {
  return "children" in node && Array.isArray(node.children)
}

function transformWikilinks(parent: UnistParent, insideLink = false): void {
  const children: UnistNode[] = []
  for (const child of parent.children) {
    if (child.type === "text" && !insideLink) {
      children.push(...splitWikilinkText(child as MdastText))
      continue
    }

    const childInsideLink =
      insideLink || child.type === "link" || child.type === "linkReference"
    if (isUnistParent(child)) transformWikilinks(child, childInsideLink)
    children.push(child)
  }
  parent.children = children
}

function remarkWikilinks() {
  return (tree: MdastRoot) => transformWikilinks(tree)
}

function asClassList(value: Properties[string] | undefined): string[] {
  if (Array.isArray(value)) return value.map(String)
  if (typeof value === "string") return value.split(/\s+/).filter(Boolean)
  return []
}

function textOf(node: ElementContent): string {
  if (node.type === "text") return node.value
  if (node.type === "element") return node.children.map(textOf).join("")
  return ""
}

function extractHeadings() {
  return (tree: Root, file: { data: Record<string, unknown> }) => {
    const headings: MarkdownHeading[] = []
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "h2" && node.tagName !== "h3") return
      const classes = asClassList(node.properties?.className)
      if (classes.includes("sr-only")) return
      const id =
        typeof node.properties?.id === "string" ? node.properties.id : ""
      if (id === "footnote-label" || id.startsWith("user-content-fn-")) return

      const text = node.children
        .filter((child) => {
          if (child.type !== "element") return true
          return !asClassList(child.properties?.className).includes(
            "heading-anchor",
          )
        })
        .map(textOf)
        .join("")
        .trim()
      if (!text) return
      headings.push({
        id,
        text,
        depth: node.tagName === "h2" ? 2 : 3,
      })
    })
    file.data.headings = headings
  }
}

/** GitHub / Obsidian style callouts: > [!NOTE] title */
function enhanceCallouts() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "blockquote") return
      const paragraphs = node.children.filter(
        (c): c is Element => c.type === "element" && c.tagName === "p",
      )
      const first = paragraphs[0]
      if (!first) return

      const raw = toString(first).trim()
      const match = raw.match(
        /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION|INFO|TODO|SUCCESS|ERROR|QUESTION)\](?:\s+([\s\S]+))?$/i,
      )
      if (!match) return

      const kind = match[1].toLowerCase()
      const label = match[1].toUpperCase()
      const inlineBody = match[2]?.trim()
      const classes = asClassList(node.properties?.className)
      node.properties = {
        ...node.properties,
        className: [...classes, "content-callout", `content-callout-${kind}`],
        "data-callout": kind,
      }

      first.properties = {
        ...first.properties,
        className: [
          ...asClassList(first.properties?.className),
          "content-callout-title",
        ],
      }
      first.children = [{ type: "text", value: label }]

      if (inlineBody) {
        const bodyP: Element = {
          type: "element",
          tagName: "p",
          properties: {},
          children: [{ type: "text", value: inlineBody }],
        }
        const firstIndex = node.children.indexOf(first)
        node.children.splice(firstIndex + 1, 0, bodyP)
      }
    })
  }
}

function wrapTables() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (!parent || typeof index !== "number") return
      if (node.tagName !== "table") return
      if (
        parent.type === "element" &&
        asClassList(parent.properties?.className).includes("table-wrap")
      ) {
        return
      }
      parent.children[index] = {
        type: "element",
        tagName: "div",
        properties: { className: ["table-wrap"] },
        children: [node],
      }
      return SKIP
    })
  }
}

function enhanceImages() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "img") return
      node.properties = {
        ...node.properties,
        loading: "lazy",
        decoding: "async",
        // 标记用于 CSS 软加载占位(淡入,避免空白闪烁)
        "data-img-placeholder": "",
      }
      // prevent huge layout shift defaults where possible
      if (!node.properties.alt) node.properties.alt = ""
    })
  }
}

function isWhitespaceText(node: ElementContent): boolean {
  return node.type === "text" && /^\s*$/.test(node.value)
}

function isImgElement(node: ElementContent): boolean {
  return node.type === "element" && node.tagName === "img"
}

function isBreakElement(node: ElementContent): boolean {
  return node.type === "element" && node.tagName === "br"
}

/** Paragraph whose only meaningful children are <img> nodes. */
function isImageOnlyParagraph(node: ElementContent): boolean {
  if (node.type !== "element" || node.tagName !== "p") return false
  let hasImg = false
  for (const child of node.children) {
    if (isImgElement(child)) {
      hasImg = true
      continue
    }
    if (isBreakElement(child) || isWhitespaceText(child)) continue
    return false
  }
  return hasImg
}

function paragraphHasImages(node: ElementContent): boolean {
  if (node.type !== "element" || node.tagName !== "p") return false
  return node.children.some((c) => isImgElement(c))
}

function extractImages(node: ElementContent): Element[] {
  if (node.type !== "element") return []
  if (node.tagName === "img") return [node]
  if (node.tagName === "p" && isImageOnlyParagraph(node)) {
    const out: Element[] = []
    for (const child of node.children) {
      if (child.type === "element" && child.tagName === "img") out.push(child)
    }
    return out
  }
  return []
}

function isGalleryBlock(node: ElementContent): boolean {
  return isImgElement(node) || isImageOnlyParagraph(node)
}

/**
 * Split a mixed paragraph (text + images) into text <p>s and image galleries.
 * e.g. `note\n![]()![]()` → <p>note</p> + gallery
 */
function splitMixedParagraph(p: Element): ElementContent[] {
  const out: ElementContent[] = []
  let textBuf: ElementContent[] = []
  let imgBuf: Element[] = []

  const flushText = () => {
    const meaningful = textBuf.some(
      (c) =>
        !(isWhitespaceText(c) || isBreakElement(c)) &&
        !(c.type === "text" && !c.value.trim()),
    )
    if (!meaningful) {
      textBuf = []
      return
    }
    // trim leading/trailing whitespace-only text nodes
    while (textBuf.length && isWhitespaceText(textBuf[0])) textBuf.shift()
    while (
      textBuf.length &&
      isWhitespaceText(textBuf[textBuf.length - 1])
    ) {
      textBuf.pop()
    }
    // drop trailing <br>
    while (
      textBuf.length &&
      isBreakElement(textBuf[textBuf.length - 1])
    ) {
      textBuf.pop()
    }
    if (textBuf.length) {
      out.push({
        type: "element",
        tagName: "p",
        properties: { ...(p.properties ?? {}) },
        children: textBuf,
      })
    }
    textBuf = []
  }

  const flushImgs = () => {
    if (imgBuf.length) {
      out.push(buildGallery(imgBuf))
      imgBuf = []
    }
  }

  for (const child of p.children) {
    if (isImgElement(child) && child.type === "element") {
      flushText()
      imgBuf.push(child)
      continue
    }
    // soft breaks between images stay with image run (ignored)
    if (imgBuf.length && (isWhitespaceText(child) || isBreakElement(child))) {
      continue
    }
    flushImgs()
    textBuf.push(child)
  }
  flushText()
  flushImgs()
  return out.length ? out : [p]
}

/** Collapse duplicate srcs in a gallery run (memo dumps sometimes paste 4× same URL). */
function uniqueImagesBySrc(imgs: Element[]): Element[] {
  const seen = new Set<string>()
  const out: Element[] = []
  for (const img of imgs) {
    const src = String(img.properties?.src ?? "")
    if (src) {
      if (seen.has(src)) continue
      seen.add(src)
    }
    out.push(img)
  }
  return out.length ? out : imgs
}

function buildGallery(imgs: Element[]): Element {
  // SSR shell matching xiami content-gallery; hydrated by MarkdownBody → ContentGallery
  const unique = uniqueImagesBySrc(imgs)
  const figures: Element[] = unique.map((img, index) => {
    const alt =
      typeof img.properties?.alt === "string" ? img.properties.alt : ""
    const galleryImg: Element = {
      ...img,
      properties: {
        ...img.properties,
        loading: "lazy",
        decoding: "async",
        alt: alt || `图册图片 ${index + 1}`,
        className: [
          ...asClassList(img.properties?.className).filter(
            (c) => c !== "photo-gallery__image",
          ),
          "md-zoomable",
        ],
        "data-gallery-index": String(index),
        draggable: "false",
      },
    }

    return {
      type: "element",
      tagName: "figure",
      properties: {
        className: ["content-gallery__item"],
        "data-gallery-item": String(index + 1),
      },
      children: [galleryImg],
    }
  })

  return {
    type: "element",
    tagName: "div",
    properties: {
      className: [
        "content-gallery",
        unique.length > 1 ? "content-gallery--navigable" : "",
      ].filter(Boolean),
      "data-type": "gallery",
      "data-gallery-root": "true",
      "data-photo-gallery": "",
      "data-count": String(unique.length),
      "aria-label": "图册",
    },
    children: [
      {
        type: "element",
        tagName: "div",
        properties: { className: ["content-gallery__track"] },
        children: figures,
      },
    ],
  }
}

function collapseGalleryChildren(children: ElementContent[]): ElementContent[] {
  // first expand mixed paragraphs (text + images in one <p>)
  const expanded: ElementContent[] = []
  for (const child of children) {
    if (
      child.type === "element" &&
      child.tagName === "p" &&
      paragraphHasImages(child) &&
      !isImageOnlyParagraph(child)
    ) {
      expanded.push(...splitMixedParagraph(child))
    } else {
      expanded.push(child)
    }
  }

  const next: ElementContent[] = []
  let i = 0
  while (i < expanded.length) {
    const cur = expanded[i]
    if (isWhitespaceText(cur)) {
      next.push(cur)
      i += 1
      continue
    }
    if (!isGalleryBlock(cur)) {
      next.push(cur)
      i += 1
      continue
    }

    const imgs: Element[] = []
    while (i < expanded.length) {
      const node = expanded[i]
      if (isWhitespaceText(node)) {
        i += 1
        continue
      }
      if (!isGalleryBlock(node)) break
      imgs.push(...extractImages(node))
      i += 1
    }
    if (imgs.length) next.push(buildGallery(imgs))
  }
  return next
}

/**
 * Collapse consecutive image-only blocks into a photo gallery.
 * Only processes container children once; skips already-built galleries.
 */
function wrapImageGalleries() {
  return (tree: Root) => {
    const walk = (node: Root | Element) => {
      if (!node.children?.length) return

      // collapse consecutive image blocks at this level
      const collapsed = collapseGalleryChildren(
        node.children as ElementContent[],
      )
      node.children = collapsed as typeof node.children

      for (const child of node.children) {
        if (child.type !== "element") continue
        // do not re-enter built galleries or leaf containers
        if (
          asClassList(child.properties?.className).includes("content-gallery") ||
          asClassList(child.properties?.className).includes("photo-gallery")
        ) {
          continue
        }
        if (
          child.tagName === "p" ||
          child.tagName === "figure" ||
          child.tagName === "a" ||
          child.tagName === "span" ||
          child.tagName === "pre" ||
          child.tagName === "code" ||
          child.tagName === "img"
        ) {
          continue
        }
        walk(child)
      }
    }

    walk(tree)
  }
}

/**
 * Task list polish:
 * wrap non-checkbox children so nested lists stack correctly under content.
 */
function enhanceTaskLists() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "ul" || node.tagName === "ol") {
        const classes = asClassList(node.properties?.className)
        if (classes.includes("contains-task-list")) {
          node.properties = {
            ...node.properties,
            className: [...new Set([...classes, "task-list"])],
          }
        }
      }

      if (node.tagName !== "li") return
      const liClasses = asClassList(node.properties?.className)
      if (!liClasses.includes("task-list-item")) return

      const checkbox = node.children.find(
        (c): c is Element =>
          c.type === "element" &&
          c.tagName === "input" &&
          String(c.properties?.type ?? "") === "checkbox",
      )
      if (!checkbox) return

      if (
        node.children.some(
          (c) =>
            c.type === "element" &&
            asClassList(c.properties?.className).includes("task-list-content"),
        )
      ) {
        return
      }

      const rest = node.children.filter((c) => c !== checkbox)
      const cleaned = rest.filter((c, i) => {
        if (i === 0 && c.type === "text" && /^\s+$/.test(c.value)) return false
        return true
      })

      node.children = [
        checkbox,
        {
          type: "element",
          tagName: "div",
          properties: { className: ["task-list-content"] },
          children: cleaned.length ? cleaned : [{ type: "text", value: "" }],
        },
      ]
    })
  }
}

/** Hide footnote label from visual chrome noise (keep for a11y). */
function polishFootnotes() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "section") return
      if (!asClassList(node.properties?.className).includes("footnotes")) return
      // ensure label heading is screen-reader only
      for (const child of node.children) {
        if (child.type === "element" && child.tagName === "h2") {
          child.properties = {
            ...child.properties,
            className: [
              ...asClassList(child.properties?.className),
              "sr-only",
            ],
          }
        }
      }
    })
  }
}

function wrapCodeBlocks() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (!parent || typeof index !== "number") return
      if (node.tagName !== "pre") return

      if (
        parent.type === "element" &&
        asClassList(parent.properties?.className).includes("code-block-shell")
      ) {
        return
      }

      const code = node.children.find(
        (c): c is Element => c.type === "element" && c.tagName === "code",
      )
      if (!code) return

      const classes = asClassList(code.properties?.className)
      const langClass = classes.find((c) => c.startsWith("language-"))
      const lang = langClass ? langClass.replace(/^language-/, "") : "text"
      const raw = toString(code)

      node.properties = {
        ...node.properties,
        className: [
          ...asClassList(node.properties?.className),
          "code-block-pre",
        ],
      }

      const shell: Element = {
        type: "element",
        tagName: "div",
        properties: {
          className: ["code-block-shell"],
          "data-language": lang,
        },
        children: [
          {
            type: "element",
            tagName: "div",
            properties: { className: ["code-block-toolbar"] },
            children: [
              {
                type: "element",
                tagName: "span",
                properties: { className: ["code-block-language"] },
                children: [
                  {
                    type: "element",
                    tagName: "span",
                    properties: {
                      className: ["code-block-language-dot"],
                      "aria-hidden": "true",
                    },
                    children: [],
                  },
                  { type: "text", value: lang },
                ],
              },
              {
                type: "element",
                tagName: "button",
                properties: {
                  type: "button",
                  className: ["code-copy-btn"],
                  // base64 avoids quote/newline attribute breakage
                  "data-code-b64": Buffer.from(raw, "utf8").toString("base64"),
                  "aria-label": "复制代码",
                },
                children: [{ type: "text", value: "Copy" }],
              },
            ],
          },
          node,
        ],
      }

      parent.children[index] = shell
      return SKIP
    })
  }
}

type MarkdownHtmlResult = {
  html: string
  headings: MarkdownHeading[]
}

export type MarkdownPipeline = "full" | "lite"

/** Process-local cache keyed by pipeline + body hash. */
const markdownHtmlCache = new Map<string, MarkdownHtmlResult>()
const MARKDOWN_HTML_CACHE_MAX = 256

function cacheKey(pipeline: MarkdownPipeline, md: string): string {
  // FNV-1a 32-bit — fast, good enough for process-local keys
  let h = 0x811c9dc5
  for (let i = 0; i < md.length; i++) {
    h ^= md.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return `${pipeline}:${(h >>> 0).toString(16)}:${md.length}`
}

function cacheGet(key: string): MarkdownHtmlResult | undefined {
  return markdownHtmlCache.get(key)
}

function cacheSet(key: string, result: MarkdownHtmlResult) {
  if (markdownHtmlCache.size >= MARKDOWN_HTML_CACHE_MAX) {
    const oldest = markdownHtmlCache.keys().next().value
    if (oldest !== undefined) markdownHtmlCache.delete(oldest)
  }
  markdownHtmlCache.set(key, result)
}

export function clearMarkdownHtmlCache() {
  markdownHtmlCache.clear()
}

/**
 * Full pipeline for long-form posts / projects:
 * GFM, footnotes, heading anchors, highlight, callouts, galleries, code shells.
 */
export async function markdownToHtml(md: string): Promise<MarkdownHtmlResult> {
  const key = cacheKey("full", md)
  const cached = cacheGet(key)
  if (cached) return cached

  const timer = startTimer("markdownToHtml(full) miss")
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm, { singleTilde: false })
    .use(remarkWikilinks)
    // Obsidian-like: single newlines become <br> (esp. inside blockquotes)
    .use(remarkBreaks)
    .use(remarkSmartypants)
    .use(remarkRehype, { allowDangerousHtml: false, footnoteLabel: "脚注" })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: "append",
      properties: {
        className: ["heading-anchor"],
        ariaLabel: "链接到此标题",
      },
      content: {
        type: "text",
        value: "#",
      },
      test: (node) => {
        // skip footnote section headings
        if (node.type !== "element") return false
        const cls = asClassList(node.properties?.className)
        if (cls.includes("sr-only")) return false
        if (node.properties?.id === "footnote-label") return false
        return (
          node.tagName === "h1" ||
          node.tagName === "h2" ||
          node.tagName === "h3" ||
          node.tagName === "h4"
        )
      },
    })
    .use(rehypeExternalLinks, {
      target: "_blank",
      rel: ["noopener", "noreferrer"],
      protocols: ["http", "https", "mailto"],
    })
    .use(rehypeHighlight, { detect: true, ignoreMissing: true })
    .use(enhanceCallouts)
    .use(enhanceImages)
    .use(wrapImageGalleries)
    .use(enhanceTaskLists)
    .use(polishFootnotes)
    .use(wrapTables)
    .use(wrapCodeBlocks)
    .use(extractHeadings)
    .use(rehypeStringify)
    .process(md)

  const result: MarkdownHtmlResult = {
    html: String(file),
    headings: (file.data.headings as MarkdownHeading[] | undefined) ?? [],
  }
  timer.end()
  cacheSet(key, result)
  return result
}

/**
 * Lite pipeline for short updates / memos:
 * paragraphs, GFM lists/links, external links, image galleries.
 * Skips highlight, footnotes, heading anchors, code shells, TOC.
 */
export async function markdownToHtmlLite(
  md: string,
): Promise<MarkdownHtmlResult> {
  const key = cacheKey("lite", md)
  const cached = cacheGet(key)
  if (cached) return cached

  const timer = startTimer("markdownToHtmlLite(lite) miss")
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm, { singleTilde: false })
    .use(remarkWikilinks)
    .use(remarkBreaks)
    .use(remarkSmartypants)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeExternalLinks, {
      target: "_blank",
      rel: ["noopener", "noreferrer"],
      protocols: ["http", "https", "mailto"],
    })
    .use(enhanceImages)
    .use(wrapImageGalleries)
    .use(rehypeStringify)
    .process(md)

  const result: MarkdownHtmlResult = {
    html: String(file),
    headings: [],
  }
  timer.end()
  cacheSet(key, result)
  return result
}
