---
title: 我的obsidian图床配置记录
date: 2026-01-27 10:48
description:
draft: false
categories: 笔记
tags:
  - 博客
  - 图床
---
>  参考https://linux.do/t/topic/1408512

# 环境及 API 准备
1. 到 CF 开通 [R2订阅](https://dash.cloudflare.com/b9d164df34357d0eb946cf30cf7d1fa7/r2/overview)
	- 点击 **Manage R2 Subscription**，此时需要绑定一张外币信用卡或者 Paypal (可以绑借记卡)
	- 选择 **Storage & databases - R2 object storage - Overview - Create bucket**，名字任意
	- 在 **bucket - Settings** 中找到 **Public Development URL** 点击 **Enable**，输入 `allow` 确认，复制 `https://xx.r2.dev` 做备用
2. 创建 API 调用 Token
	- 在 **Storage & databases - R2 object storage - Overview - Account Details** 中，点击 `API Tokens` 右侧的 `{} Manage`
	- 点击右侧的 **Create User API token** （图床使用似乎 User API 就够了）
		- **Token name：** 随意
		- **Permissions：** 选 **Object Read & Write**
		- **Specify bucket(s)：** 选刚刚创建的 **bucket**
		- **TTL：** 我设置的 forever（懒得后续再来延长时间了）
	- 点击创建后保存生成的
		- **Token value**
		- **Access Key ID**
		- **Secret Access Key**
		- **Endpoint for S3 clients** (格式通常为 `https://<账号ID>.r2.cloudflarestorage.com`)
# 配置 PicList
1. 安装 PicList ，`brew install piclist --cask
2. 打开 PicList，进入 **图床配置 - AWS S3**
3. 新建配置并填入以下参数
	- **配置名：** 随意
	- **设定AccessKeyId：** 上步记录的值
	- **设定SecretAccessKey：** 上步记录的值
	- **设定Bucket：** CF 创建的bucket 名称
	- **设定自定义节点：** 填入上步记录的 S3 clients Endpoint
	- **设定Region：** 填入 `auto`
	- **设定自定义域名：** 填入最开始得到的 `https://xx.r2.dev`
4. 保存并点击 **设为默认图床**
# 上传测试与验证
1. **上传图片：** 切换到 PicList 的 **上传区** ，拖入一张图片
2. **获取链接：** 上传成功后，PicList 会自动将链接复制到剪贴板
3. **检查链接格式：**
	- **正确格式：** `https://xx.r2.dev/sss.png`
![](https://pub-f0ec440a5c1b4b63a1d2c9eaaf0c6b3a.r2.dev/2026/01/fefe563172f92d8acb13259fc03eb129.JPG)
4. 测试成功后，开启 PicList 的 API 服务
![](https://pub-f0ec440a5c1b4b63a1d2c9eaaf0c6b3a.r2.dev/2026/01/4e22d4e6e1d0d6354057a7a423fdee76.png)
# 安装obsidian 插件 `image auto upload`
1. 安装好后，在 `image auto upload` 插件配置中填写对应的链接，PicList 需要在默认的链接上添加参数，`http://127.0.0.1:36677/upload?picbed=obsidian-graph-bed&configName=piclist`，<u>obsidian-graph-bed</u>就是 bucket 的名称
2. 配置完成后可以随便复制一个图片到文档里粘贴
![wallhaven-yxqzy7_2560x1440.png](https://pub-f0ec440a5c1b4b63a1d2c9eaaf0c6b3a.r2.dev/2026/01/64b6e6122d759c69956e1aab161b52f2.png)

![wallhaven-yxjy6l_2560x1440.png](https://pub-f0ec440a5c1b4b63a1d2c9eaaf0c6b3a.r2.dev/2026/01/9bcbd84ab9857ae49a91fbcaff946418.png)
