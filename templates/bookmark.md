<%*
// 书签 → content/bookmarks/
const DEST = "content/bookmarks";
let name = tp.file.title;
if (!name || /^Untitled(\s+\d+)?$/i.test(name)) {
  const input = await tp.system.prompt("书签名称 / 文件名");
  name = (input && input.trim()) || "bookmark";
}
const rel = tp.file.path(true);
if (!rel.startsWith(DEST + "/") || name !== tp.file.title) {
  await tp.file.move(`${DEST}/${name}`);
}
-%>
---
title: <% tp.file.title %>
url: https://
category:
type: Link
description:
order: 10
published: true
---
