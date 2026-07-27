<%*
// 静态页 → content/pages/
const DEST = "content/pages";
let name = tp.file.title;
if (!name || /^Untitled(\s+\d+)?$/i.test(name)) {
  const input = await tp.system.prompt("页面名称 / 文件名（如 about）");
  name = (input && input.trim()) || "page";
}
const rel = tp.file.path(true);
if (!rel.startsWith(DEST + "/") || name !== tp.file.title) {
  await tp.file.move(`${DEST}/${name}`);
}
-%>
---
title: <% tp.file.title %>
order: 10
cover:
published: true
---

<% tp.file.cursor() %>
