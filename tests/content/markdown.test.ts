import { describe, it, expect } from "vitest"
import { markdownToHtml } from "@/lib/content/markdown"

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
