<%*
// 拾光影像 → content/glimpses/（勿用于 memos dump）
const DEST = "content/glimpses";
let name = tp.file.title;
if (!name || /^Untitled(\s+\d+)?$/i.test(name)) {
  const input = await tp.system.prompt("拾光标题 / 文件名");
  name = (input && input.trim()) || tp.date.now("YYYY-MM-DD-HHmm");
}
const rel = tp.file.path(true);
if (!rel.startsWith(DEST + "/") || name !== tp.file.title) {
  await tp.file.move(`${DEST}/${name}`);
}
-%>
---
date: <% tp.date.now("YYYY-MM-DD HH:mm") %>
caption: <% tp.file.title %>
images:
  - 
published: true
---

<% tp.file.cursor() %>

![]()
