<%*
// 友链 → content/friends/
const DEST = "content/friends";
let name = tp.file.title;
if (!name || /^Untitled(\s+\d+)?$/i.test(name)) {
  const input = await tp.system.prompt("友链名称 / 文件名");
  name = (input && input.trim()) || "friend";
}
const rel = tp.file.path(true);
if (!rel.startsWith(DEST + "/") || name !== tp.file.title) {
  await tp.file.move(`${DEST}/${name}`);
}
-%>
---
title: <% tp.file.title %>
url: https://
avatar:
description:
order: 10
published: true
---
