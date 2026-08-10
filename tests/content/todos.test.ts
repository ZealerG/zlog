import { describe, expect, it } from "vitest"
import { parseTodoItems } from "../../src/lib/content/todos"

describe("parseTodoItems", () => {
  it("reads checked and unchecked GFM task items in source order", () => {
    const todos = parseTodoItems(`
# Todo

- [ ] First task
- [x] Finished task
* [X] Also finished
- Ordinary list item
`)

    expect(todos.map(({ text, completed }) => ({ text, completed }))).toEqual([
      { text: "First task", completed: false },
      { text: "Finished task", completed: true },
      { text: "Also finished", completed: true },
    ])
  })

  it("uses readable inline Markdown text and stable IDs", () => {
    const markdown = "- [ ] 补全 **Wiki-link** 与 [关系图谱](/graph)"

    const first = parseTodoItems(markdown)
    const second = parseTodoItems(markdown)

    expect(first[0].text).toBe("补全 Wiki-link 与 关系图谱")
    expect(first[0].id).toBe(second[0].id)
  })

  it("gives duplicate task text distinct IDs", () => {
    const todos = parseTodoItems("- [ ] Repeat\n- [ ] Repeat")

    expect(todos).toHaveLength(2)
    expect(todos[0].id).not.toBe(todos[1].id)
  })
})
