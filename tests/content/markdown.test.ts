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
})
