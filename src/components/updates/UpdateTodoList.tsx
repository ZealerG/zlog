"use client"

import { useState } from "react"
import { WiseElephantCheckboxMark } from "@/components/ui/WiseElephantCheckboxMark"
import type { TodoItem } from "@/lib/content/types"

function defaultTodoState(todos: TodoItem[]) {
  return Object.fromEntries(
    todos.map((todo) => [todo.id, Boolean(todo.completed)]),
  )
}

export function UpdateTodoList({ todos }: { todos: TodoItem[] }) {
  const [completed, setCompleted] = useState<Record<string, boolean>>(() =>
    defaultTodoState(todos),
  )

  if (todos.length === 0) return null

  const updateTodo = (todoId: string, checked: boolean) => {
    setCompleted((current) => ({ ...current, [todoId]: checked }))
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
