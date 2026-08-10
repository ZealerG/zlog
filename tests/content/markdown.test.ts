import { describe, it, expect } from "vitest"
import {
  clearMarkdownHtmlCache,
  markdownToHtml,
  markdownToHtmlLite,
} from "@/lib/content/markdown"
import { plainTextSnippet } from "@/lib/content/plain-text"
import { WISE_ELEPHANT_CHECK_PATH } from "@/lib/ui/wise-elephant"

describe("markdownToHtml", () => {
  it("renders gfm, code shell, headings and anchors", async () => {
    const { html, headings } = await markdownToHtml(
      "## Hi\n\nHello **world**\n\n```ts\nconst a = 1\n```",
    )
    expect(html).toContain("<strong>world</strong>")
    expect(html.replace(/<[^>]+>/g, "")).toContain("const a")
    expect(headings.some((h) => h.text === "Hi" && h.depth === 2)).toBe(true)
    expect(html).toContain("code-block-shell")
    expect(html).toContain("code-copy-btn")
    expect(html).toContain("data-code-b64")
    expect(html).toContain('data-language="ts"')
    expect(html).toContain("heading-anchor")
  })

  it("renders nested unordered lists with plain li tags", async () => {
    const md = `- item a
- item b
  - nested b1
  - nested b2
- item c
`
    const { html } = await markdownToHtml(md)
    expect(html).toContain("<ul>")
    expect(html).toContain("<li>item a</li>")
    expect(html).toContain("<li>nested b1</li>")
    // nested ul inside parent li
    expect(html).toMatch(/<li>item b\s*<ul>/)
  })

  it("renders GFM tables, task lists and callouts", async () => {
    const md = `
| a | b |
| - | - |
| 1 | 2 |

- normal bullet
- [x] done
- [ ] todo
  - [ ] nested

> [!NOTE]
> hello callout
`
    const { html } = await markdownToHtml(md)
    expect(html).toContain("table-wrap")
    expect(html).toContain("<table>")
    expect(html).toContain("<li>normal bullet</li>")
    expect(html).toContain('type="checkbox"')
    expect(html).toContain("task-list-item")
    expect(html).toContain("task-list-content")
    expect(html).toContain("wise-checkbox-input")
    expect(html).toContain("wise-checkbox-box")
    expect(html).toContain("wise-checkbox-fill")
    expect(html).toContain("wise-checkbox-checkmark")
    expect(html).toContain("wise-checkbox-ripple")
    expect(html).toContain(WISE_ELEPHANT_CHECK_PATH)
    expect(html).toMatch(
      /wise-checkbox-input[^>]*>\s*<span[^>]*wise-checkbox-box[\s\S]*task-list-content/,
    )
    expect(html).toContain("nested")
    expect(html).toContain("content-callout")
    expect(html).toContain("content-callout-note")
    expect(html).toContain("content-callout-title")
  })

  it("adds external link safety attrs", async () => {
    const { html } = await markdownToHtml("[site](https://example.com)")
    expect(html).toContain('target="_blank"')
    expect(html).toContain("noopener")
  })

  it("renders Wiki links as internal article and heading links", async () => {
    const markdown = [
      "[[Folder/My Note.md|Read target]]",
      "[[CaseSensitive.mdx#Deep Heading]]",
      "[[#Local Heading]]",
      "`[[inline-code]]`",
      "```md",
      "[[fenced-code]]",
      "```",
      "![[embed.png]]",
    ].join("\n\n")
    const { html } = await markdownToHtml(markdown)

    expect(html).toContain('<a href="/posts/Folder/My-Note">Read target</a>')
    expect(html).toContain(
      '<a href="/posts/CaseSensitive#deep-heading">CaseSensitive</a>',
    )
    expect(html).toContain('<a href="#local-heading">#Local Heading</a>')
    expect(html).not.toContain("/posts/inline-code")
    expect(html).not.toContain("/posts/fenced-code")
    expect(html).not.toContain("/posts/embed.png")
  })

  it("labels Wiki links by alias, resolved title, then slug", async () => {
    const { html } = await markdownToHtml(
      [
        "[[agent-learning|显式名称]]",
        "[[agent-learning]]",
        "[[missing-note.md]]",
      ].join("\n\n"),
      {
        resolveWikilinkTitle: (slug) =>
          slug === "agent-learning" ? "Agent 学习" : undefined,
      },
    )

    expect(html).toContain('<a href="/posts/agent-learning">显式名称</a>')
    expect(html).toContain('<a href="/posts/agent-learning">Agent 学习</a>')
    expect(html).toContain('<a href="/posts/missing-note">missing-note</a>')
  })

  it("does not reuse cached labels after a linked title changes", async () => {
    clearMarkdownHtmlCache()
    const markdown = "[[cache-title-target]]"
    const first = await markdownToHtml(markdown, {
      resolveWikilinkTitle: () => "First title",
    })
    const second = await markdownToHtml(markdown, {
      resolveWikilinkTitle: () => "Second title",
    })

    expect(first.html).toContain(">First title</a>")
    expect(second.html).toContain(">Second title</a>")
  })

  it("preserves soft line breaks as <br> (Obsidian-like, incl. blockquotes)", async () => {
    const { html } = await markdownToHtml(
      "> line one\n> line two\n> line three\n",
    )
    expect(html).toContain("<blockquote>")
    expect(html).toContain("<br>")
    expect(html).toMatch(/line one\s*<br>\s*line two\s*<br>\s*line three/)
  })

  it("excludes footnote headings from toc data", async () => {
    const { headings, html } = await markdownToHtml("Hi[^1]\n\n[^1]: note")
    expect(html).toContain("footnotes")
    expect(headings.some((h) => h.text === "脚注")).toBe(false)
  })

  it("wraps consecutive images into a content gallery", async () => {
    const { html } = await markdownToHtml(
      "note\n\n![a](https://example.com/1.jpg)![b](https://example.com/2.jpg)![c](https://example.com/3.jpg)\n",
    )
    expect(html).toContain("data-photo-gallery")
    expect(html).toContain("content-gallery")
    expect(html).toContain("content-gallery--navigable")
    expect(html).toContain("content-gallery__track")
    expect(html).toContain('data-count="3"')
    expect((html.match(/data-gallery-item/g) ?? []).length).toBe(3)
  })

  it("dedupes identical image srcs inside a gallery run", async () => {
    const { html } = await markdownToHtml(
      "![a](https://example.com/same.jpg)![b](https://example.com/same.jpg)![c](https://example.com/same.jpg)\n",
    )
    expect(html).toContain('data-count="1"')
    expect((html.match(/data-gallery-item/g) ?? []).length).toBe(1)
    expect(html).not.toContain("content-gallery--navigable")
  })

  it("splits mixed paragraph text + images into gallery", async () => {
    const { html } = await markdownToHtml(
      "嵛山岛等我！\n![a](https://example.com/1.jpg)![b](https://example.com/2.jpg)",
    )
    expect(html).toContain("嵛山岛等我")
    expect(html).toContain("content-gallery--navigable")
    expect(html).toContain('data-count="2"')
  })

  it("wraps a single image as a single gallery card", async () => {
    const { html } = await markdownToHtml("![solo](https://example.com/1.jpg)")
    expect(html).toContain("content-gallery")
    expect(html).not.toContain("content-gallery--navigable")
    expect(html).toContain('data-count="1"')
  })
})

describe("markdownToHtmlLite", () => {
  it("renders paragraphs, links and galleries without code shells or anchors", async () => {
    const { html, headings } = await markdownToHtmlLite(
      "hello **world**\n\n[site](https://example.com)\n\n![a](https://example.com/1.jpg)![b](https://example.com/2.jpg)\n",
    )
    expect(html).toContain("<strong>world</strong>")
    expect(html).toContain('target="_blank"')
    expect(html).toContain("content-gallery--navigable")
    expect(html).not.toContain("code-block-shell")
    expect(html).not.toContain("heading-anchor")
    expect(html).not.toContain("hljs")
    expect(headings).toEqual([])
  })

  it("is faster path for short memo bodies (smoke)", async () => {
    const md = "short memo with a [link](https://example.com)\n"
    const a = await markdownToHtmlLite(md)
    const b = await markdownToHtmlLite(md)
    // cached second call returns same string identity path
    expect(a.html).toBe(b.html)
  })

  it("uses the same Wiki-link title priority as the full pipeline", async () => {
    const { html } = await markdownToHtmlLite(
      "[[agent-learning]] [[missing-note]] [[agent-learning|Explicit]]",
      {
        resolveWikilinkTitle: (slug) =>
          slug === "agent-learning" ? "Agent learning" : undefined,
      },
    )
    expect(html).toContain(
      '<a href="/posts/agent-learning">Agent learning</a>',
    )
    expect(html).toContain('<a href="/posts/missing-note">missing-note</a>')
    expect(html).toContain('<a href="/posts/agent-learning">Explicit</a>')
  })
})

describe("plainTextSnippet", () => {
  it("uses Wiki-link aliases without leaking Obsidian syntax", () => {
    expect(
      plainTextSnippet("Read [[Folder/My Note|the note]] next"),
    ).toBe("Read the note next")
  })
})
