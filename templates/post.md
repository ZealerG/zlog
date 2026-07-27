<%*
// 篇章 → content/posts/
const DEST = "content/posts";
let name = tp.file.title;
if (!name || /^Untitled(\s+\d+)?$/i.test(name)) {
  const input = await tp.system.prompt("篇章标题（同时用作文件名）");
  name = (input && input.trim()) || tp.date.now("YYYY-MM-DD-HHmm");
}
const rel = tp.file.path(true);
if (!rel.startsWith(DEST + "/") || name !== tp.file.title) {
  await tp.file.move(`${DEST}/${name}`);
}
-%>
---
title: <% tp.file.title %>
date: <% tp.file.creation_date("YYYY-MM-DD HH:mm") %>
updated:
category:
tags:
  - 
summary:
cover:
draft: true
---

<% tp.file.cursor() %>
