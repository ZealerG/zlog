---
title: DSL与执行链路构建：Agent工作流编排项目
date: 2026-04-07 16:53
description:
draft: true
categories: 笔记
tags:
  - 笔记
  - 学习
---
# DSL 是什么
DSL（Domain Specific Language，领域专用语言）是在特定领域中，用来描述业务逻辑或流程的一种“专用语言”。在 Agent 编排项目中，DSL 通常用于描述任务流程、工具调用、条件分支等，使系统从“写死代码”变成“可配置执行”
简单来说就是一种“面向某个场景的配置语言”，它比通用编程语言更简单，但表达能力刚好够用
# PaiFlow 的 DSL
DSL（Domain Specific Language）是整个流程编排的核心数据结构
PaiFlow 的 DSL 是一个 JSON 对象，它完整地描述了一个工作流的“图”结构，包括所有的节点定义、它们之间的连接关系，以及节点之间的数据依赖关系。
启动前端后，我们可以通过拖拉拽的方式，编排一个工作流，比如下面这样，就是一个典型的 LLM + TTS 工具节点的流程：

```json
{
  "nodes": [
    {
      "id": "start-node-1",
      "type": "startNode",
      "position": { "x": 100, "y": 100 },
      "data": { "title": "开始" }
    },
    {
      "id": "llm-node-2",
      "type": "llmNode",
      "position": { "x": 300, "y": 100 },
      "data": {
        "title": "调用大模型",
        "model": "deepseek-v2",
        "prompt": "请帮我总结一下：{{input.text}}"
      }
    },
    {
      "id": "end-node-3",
      "type": "endNode",
      "position": { "x": 500, "y": 100 },
      "data": { "title": "结束" }
    }
  ],
  "edges": [
    {
      "id": "edge-1-2",
      "source": "start-node-1",
      "target": "llm-node-2",
      "sourceHandle": "output",
      "targetHandle": "input"
    },
    {
      "id": "edge-2-3",
      "source": "llm-node-2",
      "target": "end-node-3",
      "sourceHandle": "output",
      "targetHandle": "input"
    }
  ],
  "viewport": {
    "x": 0,
    "y": 0,
    "zoom": 1
  }
}
```

这串 JSON 就是工作流的 DSL，其基本组成包括：
- 节点 (Node)：执行某个具体动作的单元，如调用模型、发起请求、合成音频等等
- 边 (Edge)：连接节点与节点，表示数据的流向
主要约束有下：
- **根对象**必须包含 nodes 和 edges 两个核心数组，分别表示所有节点和所有边
- 每个节点 id 唯一
- 每条边引用的源节点和目标节点都必须存在于节点集合中
- 数据流一定是从起始节点出发，串联所有节点，最后到结束节点
工作流引擎在执行前会先做 DSL 校验，不符合约束的流程一律不执行
对于节点 (Node) 来说，有几个属性是必须的：
- Id：唯一表示，区分不同 node
- Name：给用户展示的节点名称
- Type：节点类型 (llm、plugin、start、end 等等)
- Inputs：输入参数
- Outputs：执行之后的输出结果
同时，不同类型的节点，在业务侧对其的要求也是不一样的，需要有不同维度的考虑，比如大模型节点指定调用哪个模型？温度参数是多少？等等
再比如说插件节点 (plugin node)，除了插件类型，还有插件唯一标识、插件的 Schema 等等
同时还有节点的异常处理策略，是否支持重试？走不走异常分支？要不要终止流程？
![image.png](https://pub-f0ec440a5c1b4b63a1d2c9eaaf0c6b3a.r2.dev/2026/04/91098f0427cd56187c439fc425c8c05d.png)
所有这些字段，都要在 Node 节点中有所体现
除了 Node 之外，整个工作流能不能跑通，还得靠节点之间的连接关系也就是 Edge (边)，而每一条边至少包含以下几个字段：
- **source：** 源节点 ID
- **target：** 目标节点 ID
- **type：** 边类型如普通边、异常边、条件边
- **condition：** 条件表达式 
# DSL 规则
整个 DSL 是一个 JSON 对象，顶层有 5 个字段：
- Id：工作流唯一标识
- Name：工作流名称
- Description：工作流描述
- Version：版本号
- Data：核心流程编排规则，包含 nodes 和 edges
每个节点都是流程中的一个可执行单元，id 格式为 node-type:: uuid，如
- 开始节点：node-start::d61b0f71-87ee-475e-93ba-f1607f0ce783
- 大模型节点：spark-llm::52dfad37-d36a-42d5-84a2-1f4e78309947
- 插件节点：plugin:: 6090377d-31eb-4845-bf1a-7343735b8647
这种做法有利有弊，利是可以在解析时快速通过 id 判断节点类型，但实现上需要正则拆:: 前缀，还得处理异常情况

## Inputs
Inputs 是节点输入参数列表，有两种传参方式：直接输入（常量）和引用参数（依赖于上游节点的输出），如
![image.png](https://pub-f0ec440a5c1b4b63a1d2c9eaaf0c6b3a.r2.dev/2026/04/c6336f2d3a6fca1febf3db5b10058094.png)

```json
[
    {
        "id": "239589ef-3815-46d8-b10b-a61eccaeaca3",
        "name": "vcn",
        "required": true,
        "schema": {
            "type": "string",
            "value": {
                "content": "x5_lingfeiyi_flow",
                "type": "literal"
            }
        }
    },
    {
        "fileType": "",
        "id": "9cbd5377-5a73-40b5-ac5b-f24ffe15271c",
        "name": "text",
        "required": true,
        "schema": {
            "type": "string",
            "value": {
                "content": {
                    "id": "3c63b9b8-749f-4d2a-ba39-3711a59ec780",
                    "nodeId": "spark-llm::52dfad37-d36a-42d5-84a2-1f4e78309947",
                    "name": "output"
                },
                "type": "ref"
            }
        }
    },
    {
        "id": "3d5018bc-9500-49ad-ba9e-513bf726cf33",
        "name": "speed",
        "required": true,
        "schema": {
            "type": "integer",
            "value": {
                "content": "50",
                "type": "literal"
            }
        }
    }
]
```

几个关键设计理念：
- 整个输入参数使用标准的 JSON Schema 格式描述，其中 name 字段定义当前节点接收的参数名，schema 描述该参数的取值规则和数据结构
- 参数类型依赖 schema.value.type 字段来判断
	- Ref 则不是直接赋值，而是引用其他节点的输出结果
		- 通过 `content.id` 精确匹配前面节点输出参数的 `output.id`
		- 通过 `content.nodeId` 和 `content.name` 组合找到指定节点中某个变量的输出结果，从而实现参数的动态绑定
	- Literal 则是用户输入的固定值
这种参数定义机制具备非常强的表达力，不仅有利于前端构建可视化表单，也**为后端工作流引擎在执行前的变量解析提供了标准化接口**。在 PaiFlow 中，我们也正是基于这套 schema 实现了节点编辑时的**字段推导、依赖分析和前置验证**等功能
## Outputs
输出基本规则与 inputs 相同
![image.png|82](https://pub-f0ec440a5c1b4b63a1d2c9eaaf0c6b3a.r2.dev/2026/04/1ca220511001759e58d7a0bb60a00df4.png)
DSL 输出定义：

```json
[
    {
        "id": "0e697836-103a-4331-9ea9-76eeb40cb576",
        "name": "code",
        "schema": {
            "type": "integer"
        }
    },
    {
        "id": "13a955a2-1c44-4258-ae67-ce60215e3638",
        "name": "message",
        "schema": {
            "type": "string"
        }
    },
    {
        "id": "6ee55d6b-3b44-4d9b-86ab-aa26a3d0d574",
        "name": "sid",
        "schema": {
            "type": "string"
        }
    },
    {
        "id": "3609adde-1473-4556-8f54-2de5f5516080",
        "name": "data",
        "schema": {
            "properties": {
                "voice_url": {
                    "type": "string"
                }
            },
            "type": "object"
        }
    }
]
```

一个节点的输出结果可以是简单的基本类型（如字符串、数字、布尔值），也可以是结构化的复杂对象（比如带有多个字段的 data 对象）
每个输出变量都包含 id、name、schema，id 用于唯一标识输出项，被其他节点作为引用来源使用。搭配输入参数中的 `schema.value.content.id` 字段，工作流引擎能够精确地从某个节点中提取出指定的输出结果，实现数据依赖绑定
