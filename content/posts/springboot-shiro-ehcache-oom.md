
---
title: Spring Boot整合shiro-echcache缓存踩坑
date: 2026-01-27 10:48
description:
draft: false
categories: 笔记
tags:
  - 博客
  - 图床
---

类型: Post
状态: Published
日期: 2022/07/08
链接: springboot-shiro-ehcache
摘要: Spring Boot整合shiro-ehcache缓存踩坑
标签: 开发, 笔记
分类: 踩坑合集
Property: 2025年10月21日 23:52

<aside>
💡 最近和一个学长接了个洗车小程序的外包项目，确切来说是接锅，因为之前他们团队的几个人不干了，当时项目急着要上线临时找到我，那天从下午改到凌晨，终于火急火燎的部署上线了。然后在后续的开发过程中，遇到了一个因为整合shiro-ehcache缓存配置文件问题导致OOM，在此做一个记录以备将来遇到

</aside>

# 报错时的内存分析（**Eclipse Memory Analyzer**）

![Untitled](Spring%20Boot%E6%95%B4%E5%90%88shiro-echcache%E7%BC%93%E5%AD%98%E8%B8%A9%E5%9D%91/Untitled.png)

![Untitled](Spring%20Boot%E6%95%B4%E5%90%88shiro-echcache%E7%BC%93%E5%AD%98%E8%B8%A9%E5%9D%91/Untitled%201.png)

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