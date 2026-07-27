<%*
// 单条足迹 → content/updates/
const DEST = "content/updates";
let name = tp.file.title;
if (!name || /^Untitled(\s+\d+)?$/i.test(name)) {
  const input = await tp.system.prompt("足迹短标题 / 文件名（可空）");
  name = (input && input.trim()) || tp.date.now("YYYY-MM-DD-HHmm");
}
const rel = tp.file.path(true);
if (!rel.startsWith(DEST + "/") || name !== tp.file.title) {
  await tp.file.move(`${DEST}/${name}`);
}
-%>
---
date: <% tp.date.now("YYYY-MM-DDTHH:mm:ss") %>
published: true
---

<% tp.file.cursor() %>
