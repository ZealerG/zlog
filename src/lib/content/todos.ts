import type { TodoItem } from "./types"
import { plainTextSnippet } from "./plain-text"

const TASK_LINE = /^\s*[-*+]\s+\[([ xX])\]\s+(.+?)\s*$/

function hashTodoKey(value: string) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}

/** Parse GFM task-list items from the dedicated homepage todo page. */
export function parseTodoItems(markdown: string): TodoItem[] {
  const occurrences = new Map<string, number>()
  const todos: TodoItem[] = []

  for (const line of markdown.split(/\r?\n/)) {
    const match = TASK_LINE.exec(line)
    if (!match) continue

    const text = plainTextSnippet(match[2], 160)
      .replace(/(\*\*|__|~~)(.+?)\1/g, "$2")
      .replace(/([*_])(.+?)\1/g, "$2")
      .trim()
    if (!text) continue

    const normalized = text.normalize("NFKC").toLocaleLowerCase("zh-CN")
    const occurrence = occurrences.get(normalized) ?? 0
    occurrences.set(normalized, occurrence + 1)

    todos.push({
      id: `todo-${hashTodoKey(`${normalized}\u0000${occurrence}`)}`,
      text,
      completed: match[1].toLowerCase() === "x",
    })
  }

  return todos
}
