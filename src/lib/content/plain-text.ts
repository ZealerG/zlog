/** Strip markdown image/link syntax for list/preview titles. */
export function plainTextSnippet(input: string, max = 72): string {
  const text = input
    // markdown images ![alt](url)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    // obsidian embed images ![[file]]
    .replace(/!\[\[[^\]]*\]\]/g, " ")
    // markdown links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    // bare urls
    .replace(/https?:\/\/\S+/g, " ")
    // leftover image placeholders from normalizeMarkdownBody
    .replace(/\*\[本地附件未发布:[^\]]*\]\*/g, " ")
    // code fences / inline code noise (light)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    // hashtags keep text without #
    .replace(/#([\w\u4e00-\u9fff-]+)/g, "$1")
    .replace(/\s+/g, " ")
    .trim()

  if (!text) return ""
  if (text.length <= max) return text
  return `${text.slice(0, max).trimEnd()}…`
}
