<%*
// 项目 → content/projects/
const DEST = "content/projects";
let name = tp.file.title;
if (!name || /^Untitled(\s+\d+)?$/i.test(name)) {
  const input = await tp.system.prompt("项目名称 / 文件名");
  name = (input && input.trim()) || tp.date.now("YYYY-MM-DD-project");
}
const rel = tp.file.path(true);
if (!rel.startsWith(DEST + "/") || name !== tp.file.title) {
  await tp.file.move(`${DEST}/${name}`);
}
-%>
---
title: <% tp.file.title %>
url:
status: active
order: 10
tags:
  - 
description:
cover:
published: true
---

<% tp.file.cursor() %>
