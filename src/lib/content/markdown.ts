import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkGfm from "remark-gfm"
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

export type MarkdownHeading = {
  id: string
  text: string
  depth: number
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
      }
      // prevent huge layout shift defaults where possible
      if (!node.properties.alt) node.properties.alt = ""
    })
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

export async function markdownToHtml(md: string): Promise<{
  html: string
  headings: MarkdownHeading[]
}> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm, { singleTilde: false })
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
        return node.tagName === "h1" || node.tagName === "h2" || node.tagName === "h3" || node.tagName === "h4"
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
    .use(enhanceTaskLists)
    .use(polishFootnotes)
    .use(wrapTables)
    .use(wrapCodeBlocks)
    .use(extractHeadings)
    .use(rehypeStringify)
    .process(md)

  return {
    html: String(file),
    headings: (file.data.headings as MarkdownHeading[] | undefined) ?? [],
  }
}
