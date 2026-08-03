---
title: Spring Boot整合shiro-echcache缓存踩坑
date: 2026-01-27 11:22
description:
draft: false
categories: 技术
tags:
  - 开发
  - 笔记
---

> 最近和一个学长接了个洗车小程序的外包项目，确切来说是接锅，因为之前他们团队的几个人不干了，当时项目急着要上线临时找到我，那天从下午改到凌晨，终于火急火燎的部署上线了。然后在后续的开发过程中，遇到了一个因为整合shiro-ehcache缓存配置文件问题导致OOM，在此做一个记录以备将来遇到

# 报错时的内存分析（**Eclipse Memory Analyzer**）

![Untitled.png](https://pub-f0ec440a5c1b4b63a1d2c9eaaf0c6b3a.r2.dev/2026/04/f436e561d684bf4dc9da18948f3d042f.png)
![Untitled 1.png](https://pub-f0ec440a5c1b4b63a1d2c9eaaf0c6b3a.r2.dev/2026/04/57c21d6e8d136fe91f0c9492761c4a58.png)


# 调整

## 修改文件

src->main->resources->ehcache->ehcache-shiro.xml

## 修改的项

### 原配置

```xml
<cache name="shiro-activeSessionCache"
    maxElementsInMemory="10000" overflowToDisk="false" eternal="false"
    timeToLiveSeconds="0" timeToIdleSeconds="0" diskPersistent="true"
    diskExpiryThreadIntervalSeconds="600">
</cache>
```

### 修改后的配置

```xml
<cache name="shiro-activeSessionCache"
    maxElementsInMemory="10000" overflowToDisk="false" eternal="false"
    timeToLiveSeconds="300" timeToIdleSeconds="300" diskPersistent="false"
    diskExpiryThreadIntervalSeconds="600">
</cache>
```

### 配置修改的解释

- **调整失效时间：**
    - timeToLiveSeconds：设置缓存在失效前允许存活的时间，0为无限大；原配置为0，修改后为300
    - timeToIdleSeconds：设置缓存在失效前允许闲置的时间，0为无限大；原配置为0，修改后为300
- **设置磁盘持久化数据不加载到缓存中**
    - diskPersistent：重启时是否加载磁盘的持久化数据；原配置为true，修改后为false