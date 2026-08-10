"use client"

import { useEffect, useState } from "react"
import { WiseElephantCheckboxMark } from "@/components/ui/WiseElephantCheckboxMark"
import type { TodoItem } from "@/lib/content/types"

const STORAGE_KEY = "zlog-todos-v1"
const LEGACY_STORAGE_KEY = "zlog-home-todos-v1"

function defaultTodoState(todos: TodoItem[]) {
  return Object.fromEntries(
    todos.map((todo) => [todo.id, Boolean(todo.completed)]),
  )
}

function readStoredTodoState(raw: string | null, todos: TodoItem[]) {
  if (!raw) return null
  try {
    const stored = JSON.parse(raw) as Record<string, unknown>
    return Object.fromEntries(
      todos.map((todo) => [
        todo.id,
        typeof stored[todo.id] === "boolean"
          ? stored[todo.id]
          : Boolean(todo.completed),
      ]),
    ) as Record<string, boolean>
  } catch {
    return null
  }
}

function getPersistedTodoState(todos: TodoItem[]) {
  try {
    return readStoredTodoState(
      window.localStorage.getItem(STORAGE_KEY) ??
        window.localStorage.getItem(LEGACY_STORAGE_KEY),
      todos,
    )
  } catch {
    return null
  }
}

export function UpdateTodoList({ todos }: { todos: TodoItem[] }) {
  const [completed, setCompleted] = useState<Record<string, boolean>>(() =>
    defaultTodoState(todos),
  )

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const stored = getPersistedTodoState(todos)
      setCompleted(stored ?? defaultTodoState(todos))
    })

    const syncAcrossTabs = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return
      setCompleted(
        readStoredTodoState(event.newValue, todos) ?? defaultTodoState(todos),
      )
    }
    window.addEventListener("storage", syncAcrossTabs)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener("storage", syncAcrossTabs)
    }
  }, [todos])

  if (todos.length === 0) return null

  const updateTodo = (todoId: string, checked: boolean) => {
    setCompleted((current) => {
      const next = { ...current, [todoId]: checked }
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Storage may be unavailable under private browsing policies.
      }
      return next
    })
  }

  return (
    <section className="updates-todo-card" aria-label="待办清单">
      <ul className="updates-todo-list">
        {todos.map((todo) => {
          const isCompleted = completed[todo.id] ?? Boolean(todo.completed)
          const inputId = `updates-todo-${todo.id}`

          return (
            <li key={todo.id}>
              <label
                className="wise-checkbox-label updates-todo-item"
                htmlFor={inputId}
                data-completed={isCompleted ? "true" : "false"}
              >
                <input
                  id={inputId}
                  className="wise-checkbox-input"
                  type="checkbox"
                  checked={isCompleted}
                  onChange={(event) =>
                    updateTodo(todo.id, event.target.checked)
                  }
                />
                <WiseElephantCheckboxMark />
                <span className="updates-todo-text">{todo.text}</span>
              </label>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
