---
title: π
date: 2026-08-03 14:02
updated:
category:
tags:
  - 
summary:
cover:
draft: false
---
# π的三层架构
> - Pi 分三层：pi-ai（管模型）→ pi-agent-core（管循环）→ pi-coding-agent（管业务）
> - 分层的核心规则是**依赖方向单向向上**，底层对上层一无所知
> - 类型从底层到顶层逐步扩展：`Tool` → `AgentTool` → `ToolDefinition`
> - 三层不是必须的，层数取决于你的复杂度；但依赖方向控制是必须的

| 场景                                            | 适合什么                      | 你自己做什么            |
| --------------------------------------------- | ------------------------- | ----------------- |
| 只用 pi-ai                                      | 只需要调 LLM、不需要 Agent 循环     | 自己管状态、自己写循环（如果需要） |
| pi-ai + pi-agent-core                         | 需要完整 Agent 能力、但有自己独特的业务场景 | 写自己的工具、自己的入口      |
| 全部三层（pi-ai + pi-agent-core + pi-coding-agent） | 做 Pi 同类的编程助手              | 直接用，或写扩展          |
## 可学习的地方
### 1. “依赖漏斗”分层
**是什么**：设计包结构的时候，画出依赖箭头。底层是“不知道外面世界的”，中间层是"知道底层但不知道业务"，顶层是“知道一切”
**怎么做**：
1. 找出代码里完全不依赖外部知识的部分放**底层**
2. 找出依赖底层但是不知道具体业务的部分放**中间层**
3. 找出知道用户要什么的部分放**顶层**
4. 检查：如果有任何高层的东西被下层 impor，分层有问题
**验证**：如果去掉上层，这一层还能不能跑？如果能跑，那么依赖方向正确，反之则有泄露，属于上层的部分泄露到了下层
### 2. “类型递进扩展”

**是什么**：底层定义最小的类型接口，上层通过联合类型或继承来扩展，而不是修改底层类型
**怎么做：**
1. 底层定义原子类型（如 `Tool = { name, description, parameters }`）
2. 中间层用继承扩展（如 `AgentTool extends Tool`，加上 `execute`）
3. 顶层叠加业务属性（如 `ToolDefination`）
4. 每一层只加自己关心的事
底层可以独立发布或者被复用，其余层可以引入底层而无需引入整个 agent 框架

# π的 Agent Loop
[[agent-learning#十一、Loop Engineering]] 
**Trace，一次完整的运行**
- 从用户发送消息按下↩︎到 Agent 停止输出的整个过程，而一次 Trace 里包含多个 Turn
**Turn，一个轮次**
- 一次模型调用，及这次调用所触发的所有工具执行
## 最简 Agent Loop（内核）
```typescript
// 最简 Agent Loop（伪代码）
async function simpleLoop(messages, model, tools) {
    while (true) {
        // ① 调模型
        const response = await callModel(model, messages, tools);
        messages.push(response);

        // ② 没有工具调用 → 结束
        if (response.stopReason !== "toolUse") {
            return messages;
        }

        // ③ 有工具调用 → 执行，把结果喂回去
        for (const toolCall of response.toolCalls) {
            const result = await executeTool(toolCall);
            messages.push(result);
        }
    }
}
```
而 pi coding agent 在极简内核的基础上，加上了“产品功能的按需选择”
- **steering 消息注入**：用户在 agent 工作时输入了新指令——这些消息不能等任务跑完，得在下一圈开头紧急注入，所以其内层循环条件就多了 `||pendingMessage.length > 0`
- **followUp 循环**：Agent 自然停止后，系统可能还想追加任务，外层循环让这些追加任务在同一个 Trace 内继续跑，不用重新走一个 loop

| 维度   | Steering             | FollowUp                |
| ---- | -------------------- | ----------------------- |
| 检查时机 | RunLoop 开始前，内层循环每圈结尾 | 内层循环全部结束后               |
| 语义   | 紧急插入，在工具执行间隙插入       | 排队等叫号——当前任务全部完成后        |
| 经典场景 | 用户在 agent 工作中输入了新指令  | 系统在 agent 完成后追加“顺便跑个测试” |
# π的分层模型调用
![](https://dg-ai-notes.pages.dev/assets/260702-ch04-provider-formats.svg)
怎么去抹平不同 provider 之间的差异
```
第一层 · 统一入口    →  "接收请求，查出该找谁处理"
第二层 · 事件协议    →  "约定输出格式——不管谁处理，交回来的都是这个样子"
第三层 · 翻译器      →  "真正干活的人——每个翻译器精通一种 Provider 的方言"
```
## 可学习的地方
### 1. “协议>实现”:
Pi 没有设计 `BaseProvider` 抽象类让所有翻译器继承，而是定义了一套事件协议和一个函数签名。至于为什么不用继承？——继承需要找共同代码，但每个 provider 在发消息这件事上连字段名都不一样。而协议只约定了“输入什么，输出什么”
# π的手脚
