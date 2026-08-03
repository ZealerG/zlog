---
title: Hello Agents 笔记
date: 2026-01-28 11:20
description:
draft: false
categories: 笔记
tags:
  - 学习
  - agents
---
>  [Hello-Agents](https://datawhalechina.github.io/hello-agents/#/./chapter1/%E7%AC%AC%E4%B8%80%E7%AB%A0%20%E5%88%9D%E8%AF%86%E6%99%BA%E8%83%BD%E4%BD%93)
>  如何让 AI 从一个“有问必答”的工具，转变为一个能够自主规划、调用工具、解决复杂问题的“行动者”？—— 答案在于智能体（Agents）。
>  对我而言，之前对 Agent 缺乏系统性的了解，而如今各种 Agent 框架和应用层出不穷，令人眼花缭乱，难以全面跟进。因此，我更需要一份能够引导我循序渐进地学习、帮助我看透框架本质的文章或教程。其实，这份《Hello Agents》资料我已经囤很久了一直没看，正好可以在实习之余摸鱼时看一看、学一学、动手做一做。😄
# 第一部分 智能体与语言模型基础

## 第一章 初识智能体
### 1.1 什么是智能体
- **核心定义**：智能体（Agent）是一种通过**传感器（Sensors）**感知**环境（Environment）**，并通过**执行器（Actuators）**自主采取**行动（Action）**以达成目标的实体。
- **基本要素**：
    - 环境：外部世界，提供感知和行动空间。
    - 传感器：获取环境信息（如摄像头、API 接口）。
    - 执行器：改变环境状态（如发送邮件、执行代码）。
    - 自主性（Autonomy）：独立决策能力，不依赖外部实时控制。
![智能体与环境的基本交互循环](https://pub-f0ec440a5c1b4b63a1d2c9eaaf0c6b3a.r2.dev/2026/01/6b7b267addd2d48b16aa3ceee475d92d.png)
#### 1.1.1 传统视角下的智能体
- **演进路线**：从简单反射到复杂学习，逐步增加记忆、规划和适应能力。
- **主要类型**（按复杂程度排序）：
    - **反射智能体（Simple Reflex Agent）**：基于固定“条件-动作”规则，无记忆或预测。比如：自动恒温器（室温 > 设定值 → 启动制冷）。
    - **基于模型的反射智能体（Model-Based Reflex Agent）**：维护内部**世界模型（World Model）**（现在似乎也是目前 AGI 的热点），追踪不可直接感知的状态。比如：自动驾驶汽车预测前方车辆位置。
    - **基于目标的智能体（Goal-Based Agent）**：主动规划导向目标的行动，涉及搜索算法（如 A* 算法）。示例：GPS 导航规划最优路径。
    - **基于效用的智能体（Utility-Based Agent）**：为状态赋予**效用值（Utility）**，最大化整体满意度，处理多目标冲突。
    - **学习型智能体（Learning Agent）**：通过 **强化学习（RL）** 自我改进。比如：AlphaGo Zero 通过自我对弈学习策略。
#### 1.1.2 大语言模型驱动的新范式
- **LLM 智能体特点**：以大语言模型（LLM，如 GPT）为核心，涌现出规划、工具调用等能力。
- **示例**：智能旅行助手处理“规划一次厦门之旅”：
    - 任务分解：确认偏好 → 查询天气/交通 → 制定行程。
    - 工具调用：天气 API、地图服务。
    - 动态调整：基于用户反馈修正计划。
#### 1.1.3 智能体的类型
- **基于内部决策架构**：反应式、模型式、目标式、效用式、学习式（参考[《Artificial Intelligence: A Modern Approach》](https://aima.cs.berkeley.edu/)）。
- **基于时间与反应性**：
    - **反应式（Reactive）**：即时响应，速度快但缺乏远见。示例：汽车安全气囊。
    - **规划式（Deliberative）**：预先规划，战略性强但计算密集。示例：企业战略制定。
    - **混合式（Hybrid）**：结合两者，如 LLM 的“思考-行动”循环。（即ReAct）
        - **规划(Reasoning)** ：在“思考”阶段，LLM 分析当前状况，规划出下一步的合理行动。这是一个审议过程。
        - **反应(Acting & Observing)** ：在“行动”和“观察”阶段，智能体与外部工具或环境交互，并立即获得反馈。这是一个反应过程。
![智能体决策时间与质量关系图](https://pub-f0ec440a5c1b4b63a1d2c9eaaf0c6b3a.r2.dev/2026/01/5ea11a1edbd44c10ca46be6f2dbcea0e.png)

- **基于知识表示**：
    - **符号主义 AI（Symbolic AI）**：逻辑规则，透明但知识瓶颈大。
    - **亚符号主义 AI（Sub-symbolic AI）**：神经网络，鲁棒但黑箱（如幻觉问题）。
    - **神经符号主义 AI（Neuro-Symbolic AI）**：融合两者，LLM 体现 Kahneman 双系统理论（系统1：直觉；系统2：推理）。
![image.png](https://pub-f0ec440a5c1b4b63a1d2c9eaaf0c6b3a.r2.dev/2026/01/513d3f29c8db8fe375dd56f6601f10de.png)
### 1.2 智能体的构成与运行原理
#### 1.2.1 任务环境定义
- **PEAS 模型**：**P**erformance（性能度量，如准确率）、**E**nvironment（环境）、**A**ctuators（执行器）、**S**ensors（传感器）。
- **示例**：智能旅行助手的 PEAS：

|     要素      |      描述       |
| :---------: | :-----------: |
| Performance |  用户满意度、形成完整性  |
| Environment | 数字世界（API、数据库） |
|  Actuators  |  API 调用、消息发送  |
|   Sensors   | 用户输入、API 返回数据 |


- **环境特性**：部分可观察、随机、多智能体、序贯、动态。
#### 1.2.2 智能体的运行机制
- **智能体循环（Agent Loop）**：感知 → 思考 → 行动 → 观察的闭环。
![智能体与环境交互的基本循环](https://pub-f0ec440a5c1b4b63a1d2c9eaaf0c6b3a.r2.dev/2026/01/149b3d71e4039fed5d22c163b2f9016d.png)
- **核心阶段**：
    1. **感知（Perception）**：接收观察（Observation，即用户初始指令或者上一步的反馈）。
    2. **思考（Thought）**：规划（Planning，基于当前观察和记忆，更新对任务和环境的理解，制定或调整计划） + 工具选择（Tool Selection）。
    3. **行动（Action）**：执行（调用某个工具）影响环境，导致新观察。
#### 1.2.3 智能体的感知与行动
- **交互协议（Interacton Protocol）：** 输出格式为 Thought（思考） + Action（行动，如函数调用），明确展示其内部的推理过程与最终决策。
- 如：

```bash 
Thought: 用户想知道北京的天气。我需要调用天气查询工具。
Action: get_weather("北京")
```

- **感知处理：** 环境返回（如 JSON）转换为自然语言 Observation

```bash
Observation: 北京当前天气为晴，气温25摄氏度，微风。
```

这段`Observation`文本会被反馈给智能体，作为下一轮循环的主要输入信息，供其进行新一轮的`Thought`和`Action`。
### 1.3 动手体验
#### 1.3.1 准备工作
- **安装依赖**：`pip install requests tavily-python openai`。
- **系统提示模板（AGENT_SYSTEM_PROMPT）**：定义角色、可用工具、输出格式（Thought-Action-Finish）。
- **工具定义**：
    - `get_weather(city: str)`：查询 wttr.in API，返回天气描述（代码：GET 请求 + JSON 解析）。
    - `get_attraction(city: str, weather: str)`：Tavily API 搜索景点（代码：客户端初始化 + 查询构造）。
- **工具字典**：`{"get_weather": get_weather, "get_attraction": get_attraction}`。
#### 1.3.2 接入 LLM
- **OpenAICompatibleClient 类**：兼容 OpenAI API，生成响应（代码：初始化 + 消息生成）。
#### 1.3.3 执行行动循环
- **主循环**：构建 Prompt → 调用 LLM → 解析 Action → 执行工具 → 记录 Observation（最大 5 轮）。
- **终止条件**：Action 为 "Finish"，输出最终答案。
#### 1.3.4 运行
- **示例交互**：用户问“北京天气如何？推荐景点。” → 3 轮循环：查询天气 → 搜索景点 → 合成推荐 → Finish。

```python fold
import requests;
import os
from tavily import TavilyClient
from openai import OpenAI
import re

AGENT_SYSTEM_PROMPT = """
你是一个智能旅行助手。你的任务是分析用户的请求，并使用可用工具一步步地解决问题。

# 可用工具:
- `get_weather(city: str)`: 查询指定城市的实时天气。
- `get_attraction(city: str, weather: str)`: 根据城市和天气搜索推荐的旅游景点。

# 输出格式要求:
你的每次回复必须严格遵循以下格式，包含一对Thought和Action：

Thought: [你的思考过程和下一步计划]
Action: [你要执行的具体行动]

Action的格式必须是以下之一：
1. 调用工具：function_name(arg_name="arg_value")
2. 结束任务：Finish[最终答案]

# 重要提示:
- 每次只输出一对Thought-Action
- Action必须在同一行，不要换行
- 当收集到足够信息可以回答用户问题时，必须使用 Action: Finish[最终答案] 格式结束

请开始吧！
"""
# 定义查询天气的函数
def get_weather(city: str) -> str:
    """
    通过调用 wttr.in API 查询真实的天气信息。
    """
    # API端点，我们请求JSON格式的数据
    url = f"https://wttr.in/{city}?format=j1"
    
    try:
        # 发起网络请求
        response = requests.get(url)
        # 检查响应状态码是否为200 (成功)
        response.raise_for_status() 
        # 解析返回的JSON数据
        data = response.json()
        
        # 提取当前天气状况
        current_condition = data['current_condition'][0]
        weather_desc = current_condition['weatherDesc'][0]['value']
        temp_c = current_condition['temp_C']
        
        # 格式化成自然语言返回
        return f"{city}当前天气:{weather_desc}，气温{temp_c}摄氏度"
        
    except requests.exceptions.RequestException as e:
        # 处理网络错误
        return f"错误:查询天气时遇到网络问题 - {e}"
    except (KeyError, IndexError) as e:
        # 处理数据解析错误
        return f"错误:解析天气数据失败，可能是城市名称无效 - {e}"

# 定义查询景点的函数
def get_attraction(city: str, weather: str) -> str:
    """
    根据城市和天气，使用Tavily Search API搜索并返回优化后的景点推荐。
    """
    # 1. 从环境变量中读取API密钥
    api_key = os.environ.get("TAVILY_API_KEY")
    if not api_key:
        return "错误:未配置TAVILY_API_KEY环境变量。"

    # 2. 初始化Tavily客户端
    tavily = TavilyClient(api_key=api_key)
    
    # 3. 构造一个精确的查询
    query = f"'{city}' 在'{weather}'天气下最值得去的旅游景点推荐及理由"
    
    try:
        # 4. 调用API，include_answer=True会返回一个综合性的回答
        response = tavily.search(query=query, search_depth="basic", include_answer=True)
        
        # 5. Tavily返回的结果已经非常干净，可以直接使用
        # response['answer'] 是一个基于所有搜索结果的总结性回答
        if response.get("answer"):
            return response["answer"]
        
        # 如果没有综合性回答，则格式化原始结果
        formatted_results = []
        for result in response.get("results", []):
            formatted_results.append(f"- {result['title']}: {result['content']}")
        
        if not formatted_results:
             return "抱歉，没有找到相关的旅游景点推荐。"

        return "根据搜索，为您找到以下信息:\n" + "\n".join(formatted_results)

    except Exception as e:
        return f"错误:执行Tavily搜索时出现问题 - {e}"

# 将所有工具函数放入一个字典，方便后续调用
available_tools = {
    "get_weather": get_weather,
    "get_attraction": get_attraction,
}

# 定义用于调用任何兼容OpenAI接口的LLM服务的类
class OpenAICompatibleClient:
    """
    一个用于调用任何兼容OpenAI接口的LLM服务的客户端。
    """
    def __init__(self, model: str, api_key: str, base_url: str):
        self.model = model
        self.client = OpenAI(api_key=api_key, base_url=base_url)

    def generate(self, prompt: str, system_prompt: str) -> str:
        """调用LLM API来生成回应。"""
        print("正在调用大语言模型...")
        try:
            messages = [
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': prompt}
            ]
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                stream=False
            )
            answer = response.choices[0].message.content
            print("大语言模型响应成功。")
            return answer
        except Exception as e:
            print(f"调用LLM API时发生错误: {e}")
            return "错误:调用语言模型服务时出错。"
        
# --- 1. 配置LLM客户端 ---
# 请根据您使用的服务，将这里替换成对应的凭证和地址
API_KEY = "sk-xxx"
BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1"
MODEL_ID = "qwen-plus"
TAVILY_API_KEY="tvly-dev-xxx"
os.environ['TAVILY_API_KEY'] = "tvly-dev-xxx"

llm = OpenAICompatibleClient(
    model=MODEL_ID,
    api_key=API_KEY,
    base_url=BASE_URL
)

# --- 2. 初始化 ---
user_prompt = "你好，请帮我查询一下今天北京的天气，然后根据天气推荐一个合适的旅游景点。"
prompt_history = [f"用户请求: {user_prompt}"]

print(f"用户输入: {user_prompt}\n" + "="*40)

# --- 3. 运行主循环 ---
for i in range(5): # 设置最大循环次数
    print(f"--- 循环 {i+1} ---\n")
    
    # 3.1. 构建Prompt
    full_prompt = "\n".join(prompt_history)
    
    # 3.2. 调用LLM进行思考
    llm_output = llm.generate(full_prompt, system_prompt=AGENT_SYSTEM_PROMPT)
    # 模型可能会输出多余的Thought-Action，需要截断
    match = re.search(r'(Thought:.*?Action:.*?)(?=\n\s*(?:Thought:|Action:|Observation:)|\Z)', llm_output, re.DOTALL)
    if match:
        truncated = match.group(1).strip()
        if truncated != llm_output.strip():
            llm_output = truncated
            print("已截断多余的 Thought-Action 对")
    print(f"模型输出:\n{llm_output}\n")
    prompt_history.append(llm_output)
    
    # 3.3. 解析并执行行动
    action_match = re.search(r"Action: (.*)", llm_output, re.DOTALL)
    if not action_match:
        observation = "错误: 未能解析到 Action 字段。请确保你的回复严格遵循 'Thought: ... Action: ...' 的格式。"
        observation_str = f"Observation: {observation}"
        print(f"{observation_str}\n" + "="*40)
        prompt_history.append(observation_str)
        continue
    action_str = action_match.group(1).strip()

    if action_str.startswith("Finish"):
        final_answer = re.match(r"Finish\[(.*)\]", action_str).group(1)
        print(f"任务完成，最终答案: {final_answer}")
        break
    
    tool_name = re.search(r"(\w+)\(", action_str).group(1)
    args_str = re.search(r"\((.*)\)", action_str).group(1)
    kwargs = dict(re.findall(r'(\w+)="([^"]*)"', args_str))

    if tool_name in available_tools:
        observation = available_tools[tool_name](**kwargs)
    else:
        observation = f"错误:未定义的工具 '{tool_name}'"

    # 3.4. 记录观察结果
    observation_str = f"Observation: {observation}"
    print(f"{observation_str}\n" + "="*40)
    prompt_history.append(observation_str)
```

- **结果：**

```bash title:output 
用户输入: 你好，请帮我查询一下今天北京的天气，然后根据天气推荐一个合适的旅游景点。
========================================
--- 循环 1 ---

正在调用大语言模型...
大语言模型响应成功。
模型输出:
Thought: 用户需要查询北京今天的天气，并根据天气推荐一个合适的旅游景点。我将首先调用get_weather工具查询北京的天气。
Action: get_weather(city="北京")

Observation: 错误:查询天气时遇到网络问题 - HTTPSConnectionPool(host='wttr.in', port=443): Max retries exceeded with url: /%E5%8C%97%E4%BA%AC?format=j1 (Caused by SSLError(SSLEOFError(8, '[SSL: UNEXPECTED_EOF_WHILE_READING] EOF occurred in violation of protocol (_ssl.c:1010)')))
========================================
--- 循环 2 ---

正在调用大语言模型...
大语言模型响应成功。
模型输出:
Thought: 天气查询因网络问题失败，我需要重试一次以确保不是临时故障。
Action: get_weather(city="北京")

Observation: 北京当前天气:Sunny，气温-3摄氏度
========================================
--- 循环 3 ---

正在调用大语言模型...
大语言模型响应成功。
模型输出:
Thought: 已成功获取北京当前天气为晴天，气温-3摄氏度。接下来我将根据该天气情况调用get_attraction工具推荐适合的旅游景点。
Action: get_attraction(city="北京", weather="Sunny")

Observation: 根据搜索，为您找到以下信息:
- 北京景點總整理－Top25自由行推薦：世界遺產、皇家園林、必去景點: 景山公園, 山頂是看紫禁城最佳位置 ; 天壇公園, 古代皇帝祭祀的場所 ; 天安門廣場, 世界上最大的城市廣場之一 ; 鐘鼓樓, 北京中軸線最北邊建築，元朝時期建築.
- 16大必去北京景點推薦：吃喝玩樂全攻略！自由行懶人包 - KKday: 若您鍾情於中國古典園林山水建築，絕對應將頤和園納入您的北京旅遊行程！頤和園前身為清漪園，是清朝最具代表性的皇家園林，亦是中國現存規模最大、保存最完整
- 【北京攻略】去北京必打卡的10大景点和好去处！ - Klook客路博客: 奢华秀美的皇家园林、历经战争的断垣残壁、市井小民的传统街道，到北京总要体验一个『老』字，回味百年前的热闹盛世。 此篇「 北京必去景点」特辑，要来
- 北京自由行必看懶人包——2026北京旅遊景點清單教你5日4夜行程規劃: 香港 - 北京|4月10日 週五|香港快運航空（HK Express）. 香港 - 北京|3月12日 週四|香港快運航空（HK Express）. 8.7*/10*1329 評價. 8.8*/10*5815 評價. | ****Day 1：皇城中軸，穿越時空的宏偉**** | ****上午**** | 故宮博物院 (紫禁城) | 四季民福烤鴨店 (故宮店) | 北京中關村皇冠假日酒店 |. | ****Day 2：皇家園林，歷史的印記**** | ****上午**** | 頤和園 | 南門涮肉 (頤和園店) | 北京頤和安縵酒店 |. | ****Day 3：不到長城非好漢**** | ****全日**** | 慕田峪長城 | 小園餐廳 (The Schoolhouse at Mutianyu) | 北京慕田峪長城酒店 |. | ****Day 4：漫步京城，感受古都韻味**** | ****上午**** | 天壇公園 | 錦芳小吃 (磁器口店) | 北京後海鼓樓四合院漫心府 |. ## 北京行程規劃5日4夜 ****| Day 1：皇城中軸，穿越時空的宏偉****. ### 第1日 | 晚上住宿****：********北京中關村皇冠假日酒店****. ## 北京行程規劃5日4夜 ****| Day 2：皇家園林，歷史的印記****. ### 第2日 | 上午****：頤和園****. ### 第2日 | 下午****：圓明園遺址公園****. * ****營業時間****：07:00-19:00 (根據季節微調)。. ## 北京行程規劃5日4夜 ****| Day 3：不到長城非好漢****. ### 第3日 | 全日****：****慕田峪長城. * ****門票價格****：40 RMB (纜車/索道/滑道需另購)。. * ****推薦停留時間****：4-5 小時 (不含交通時間)。. ### 第3日 | 晚上住宿：****北京慕田峪長城酒店****. ## 北京行程規劃5日4夜 ****| Day 4：漫步京城，感受古都韻味****. ### 第4日 | 上午****：****天壇公園. ### 第4日 | 下午****：恭王府 & 後海胡同****. * ****推薦停留時間****：4-5 小時 (含後海地區)。. ## 北京行程規劃5日4夜 ****|**** Day 5：現代藝術與告別之旅. ### ****第5日 | 上午：798藝術區****. ### ****第5日 | 下午：整理行裝，前往機場****. Trip.com 為您全面解析北京地圖，涵蓋北京地鐵線路圖、交通攻略、必玩景點地圖以及美食餐廳地圖，為您提供一站式北京旅遊資訊，助您輕鬆遊遍北京。. 北京行程規劃5日4夜 | Day 1：皇城中軸，穿越時空的宏偉. 北京行程規劃5日4夜 | Day 2：皇家園林，歷史的印記. 北京行程規劃5日4夜 | Day 4：漫步京城，感受古都韻味.
- 北京行程規劃5日4夜深度遊懶人包2026！故宮/長城/頤和園經典路線: 8.7*/10*1332 評價. 8.8*/10*5839 評價. | ****Day 2：皇家園林，歷史的印記**** | ****上午**** | 頤和園 | 南門涮肉 (頤和園店) | 北京頤和安縵酒店 |. | ****Day 3：不到長城非好漢**** | ****全日**** | 慕田峪長城 | 小園餐廳 (The Schoolhouse at Mutianyu) | 北京慕田峪長城酒店 |. ## 北京行程規劃5日4夜 ****| Day 1：皇城中軸，穿越時空的宏偉****. ### 第1日 | 晚上住宿****：********北京中關村皇冠假日酒店****. ## 北京行程規劃5日4夜 ****| Day 2：皇家園林，歷史的印記****. ### 第2日 | 上午****：頤和園****. * ****營業時間****：07:00-19:00 (根據季節微調)。. From the private gateway linking the royal gardens, to the cloud-patterned birthday decor in the room; from the dragon-view dining seat in the restaurant, to the butler’s gentle reminder for my private cinema moment—it felt like walking through Beijing’s royal artery, where every dragon motif and embroidered pillow spoke of China’s profound art of hospitality. ## 北京行程規劃5日4夜 ****| Day 3：不到長城非好漢****. ### 第3日 | 全日****：****慕田峪長城. ## 北京行程規劃5日4夜 ****| Day 4：漫步京城，感受古都韻味****. ### 第4日 | 上午****：****天壇公園. ### 第4日 | 下午****：恭王府 & 後海胡同****. ## 北京行程規劃5日4夜 ****|**** Day 5：現代藝術與告別之旅. 北京行程規劃5日4夜 | Day 1：皇城中軸，穿越時空的宏偉. 北京行程規劃5日4夜 | Day 2：皇家園林，歷史的印記. 北京行程規劃5日4夜 | Day 4：漫步京城，感受古都韻味.
========================================
--- 循环 4 ---

正在调用大语言模型...
大语言模型响应成功。
模型输出:
Thought: 已获取北京当前天气为晴天（Sunny），气温-3°C；并获得多个适合晴天游览的景点推荐，如颐和园、天坛公园、景山公园、故宫博物院、慕田峪长城等。其中颐和园作为经典皇家园林，在晴朗寒冷天气下既可欣赏雪景/冬日园林风貌，又具备室内展馆与避风廊道，体验舒适且富有文化深度，是最契合当前天气的推荐景点。
Action: Finish[今天北京天气晴朗，气温-3°C，适合户外活动。推荐您前往【颐和园】游览——这是中国现存规模最大、保存最完整的皇家园林，冬日晴空下，昆明湖冰面如镜，万寿山层叠错落，长廊彩绘清晰可见，还可参观佛香阁、德和园大戏楼等室内景点，保暖又富有文化韵味。]

任务完成，最终答案: 今天北京天气晴朗，气温-3°C，适合户外活动。推荐您前往【颐和园】游览——这是中国现存规模最大、保存最完整的皇家园林，冬日晴空下，昆明湖冰面如镜，万寿山层叠错落，长廊彩绘清晰可见，还可参观佛香阁、德和园大戏楼等室内景点，保暖又富有文化韵味。
```

### 1.4 智能体应用的协作模式
### 1.4.1 作为开发者工具的智能体
- **示例**：GitHub Copilot（代码补全）、Claude Code（终端编码）、Trae（优化）、Cursor（AI 编辑器）。
### 1.4.2 作为自主协作者的智能体
- **范式**：
    - 单智能体：自主循环（如 AgentGPT）。
    - 多智能体：角色扮演（如 CAMEL）、组织化（如 MetaGPT）。
    - 高级控制：状态图（如 LangGraph）。
### 1.4.3 Workflow 和 Agent 的差异
- **Workflow**：预定义固定流程，高效但缺乏灵活性。示例：报销审批。
- **Agent**：目标导向、动态推理，适应不确定性。示例：旅行助手根据天气调整。
![image.png](https://pub-f0ec440a5c1b4b63a1d2c9eaaf0c6b3a.r2.dev/2026/01/4b7b24104eba70772041646957f8a07b.png)
### 1.5 习题
1. 请分析以下四个 `case` 中的**主体**是否属于智能体，如果是，那么属于哪种类型的智能体（可以从多个分类维度进行分析），并说明理由：
    `case A`：**一台符合冯·诺依曼结构的超级计算机**，拥有高达每秒 2EFlop 的峰值算力
    - <u>一个智能体的核心定义是通过传感器感知环境，并通过执行器自主采取行动来影响环境以达成目标的实体</u>，对于一台冯诺依曼结构的超级计算机，其并不具备自主目标，也不具备主动感知环境（被动等待输入），说明其不是智能体，或者说只能是智能体的载体
    `case B`：**特斯拉自动驾驶系统**在高速公路上行驶时，突然检测到前方有障碍物，需要在毫秒级做出刹车或变道决策
    - 是智能体，符合感知→决策→行动的自主闭环。混合式智能体，既不是即时反应（毫秒级？）又不是预先规划，而是有 `思考→行动` 的反应过程
    - 底层偏反应式（毫秒级避障），而高层偏规划式（路径规划预测）
    `case C`：**AlphaGo**在与人类棋手对弈时，需要评估当前局面并规划未来数十步的最优策略
    - 是智能体，很明显的规划式智能体
    `case D`：**ChatGPT 扮演的智能客服**在处理用户投诉时，需要查询订单信息、分析问题原因、提供解决方案并安抚用户情绪
    - 是智能体，混合式智能体
2. 假设你需要为一个"智能健身教练"设计任务环境。这个智能体能够：
    - 通过可穿戴设备监测用户的心率、运动强度等生理数据
    - 根据用户的健身目标（减脂/增肌/提升耐力）动态调整训练计划
    - 在用户运动过程中提供实时语音指导和动作纠正
    - 评估训练效果并给出饮食建议
    请使用 PEAS 模型完整描述这个智能体的任务环境，并分析该环境具有哪些特性（如部分可观察、随机性、动态性等）。
    - **performance:** 用户满意度
    - **environment:** 可穿戴设备监测到的生理数据，用户健身目标
    - **actuators:** 可穿戴设备接口调用，语音指导，饮食建议，评估训练效果
    - **sensors:** 用户动作情况，可穿戴接口返回的生理数据
3. 某电商公司正在考虑两种方案来处理售后退款申请：（grok 做得真好，我做的简直一坨）
    方案 A（`Workflow`）：设计一套固定流程，例如：
    A.1 对于一般商品且在 7 天之内，金额 `< 100RMB` 自动通过；`100-500RMB` 由客服审核；`>500RMB` 需主管审批；而特殊商品（如定制品）一律拒绝退款
    A.2 对于超过 7 天的商品，无论金额，只能由客服审核或主管审批；
    方案 B（`Agent`）：搭建一个智能体系统，让它理解退款政策、分析用户历史行为、评估商品状况，并自主决策是否批准退款
    请分析：
    - 这两种方案各自的优缺点是什么？
		1. A 方案
			1. 优点
				- 边界清晰、规则透明、可审计：所有决策可追溯到具体条款，便于合规、财务审计和内部培训。
				- 高度可预测、一致性强：相同条件永远相同结果，避免主观偏差，易于测试和维护。
				- 实施成本低、速度快：基于if-then规则的系统（e.g. 用低代码平台或数据库触发器）开发周期短，上线稳定。
				- 欺诈控制强：在明确阈值（如金额、时效）下，恶意薅羊毛行为容易被硬性阻断。
			2. 缺点
				- 过于死板、缺乏灵活性：无法处理灰色地带（如“商品有轻微瑕疵但用户是高价值老客”“用户首次退货但理由合理”），容易机械拒绝导致用户不满，或机械通过导致损失。
				- 用户体验不佳：边界生硬（e.g. 99元自动通过、101元需人工等），可能引发投诉，增加客服压力。
				- 规则维护成本随业务增长而上升：政策频繁调整（如促销期延长退货期）需反复改代码/配置，容易出错。
				- 无法从历史数据中学习优化：退货原因分析仍需人工。
		2. B 方案
			1. 优点
				- 高度灵活、智能决策：能综合多维度信息（用户忠诚度、退货历史、商品真实状况、当前运营策略），实现“酌情处理”，在政策边界内最大化用户满意度和留存。
				- 全/半自动化，显著降低人工成本：80-90%常规退款可自主处理（行业案例：某些平台用AI处理退款后人工介入率降至10-20%）。
				- 个性化体验强：可生成自然语言解释（如“考虑到您是VIP用户且商品轻微使用痕迹，我们为您通过本次退款”），提升信任。
				- 持续学习与优化：通过反馈循环（RLHF或人工复核日志）不断改进，识别欺诈模式、常见问题，辅助产品/供应链改进。
				- 欺诈检测更智能：结合行为模式、异常检测，而非仅靠硬规则。
			2. 缺点
				- 边界不够明确、存在不确定性：可能出现幻觉、过度宽松（批准不应批的）或过度严格（拒绝合理请求），初期准确率需调优。
				- 潜在风险更高：错误决策可能导致财务损失（恶意刷单通过）、合规问题（歧视性决策），或品牌声誉损害。
				- 实施与维护成本高：需要高质量训练数据、工具集成（订单/物流/支付API）、持续监控、人工兜底机制。
				- 解释性与可审计性较差：决策路径复杂，难以像Workflow那样一目了然解释给监管或用户。
				- 延迟与成本波动：复杂case可能多轮推理，token消耗高。
    - 在什么情况下 `Workflow` 更合适？什么情况下 `Agent` 更有优势？如果你是该电商公司的负责人，你更倾向于采用哪种方案？
		1. 规模较小，退货量不高，财务审计控制要求高，资源有限适合 workflow
		2. 退货量大场景复杂，注重用户体验和留存率，历史数据足够训练微调 agent 更有优势
		3. 我会更倾向于使用方案 B，混合带兜底的 agent，低金额/简单case全自动，高金额/高风险/低置信度case强制转人工审核，实现“扬长避短”。
    - 是否存在一个方案 C，能够结合两种方案，达到扬长避短的效果？
	    - **低风险/高置信case** → Agent自主决策并执行（e.g. <100元、用户历史良好、理由匹配政策 → 自动通过并即时退款）。
		- **中等风险/中等置信case** → Agent给出推荐+详细解释 → 转客服一键确认（极大降低人工认知负担）。
		- **高风险/低置信case** → 强制转人工（e.g. >500元、用户高频退货、欺诈信号、置信度<85%）。
		- **Workflow兜底**：所有case都先跑**固定规则过滤**（如定制品直接拒、超7天需人工），再进入**Agent判断**。
		- **反馈闭环**：人工复核结果回流训练Agent，不断缩小“需人工”比例（目标：从初期30%人工 → 长期<10%）。
## 第二章 智能体发展史
### 2.1 基于符号与逻辑的早期智能体
人工智能早期深受数理逻辑和计算机科学影响，信念是人类的逻辑推理能力可被形式化符号体系捕捉 → 催生**符号主义（Symbolicism）**范式，也称逻辑AI或传统AI。 智能行为核心：基于规则操作符号，智能体视为**物理符号系统**，通过符号表示世界并逻辑推理。智慧来源于预编码知识和规则，非自主学习。
#### 2.1.1 物理符号系统假说

- 提出者：1976年艾伦·纽厄尔（Allen Newell）和赫伯特·西蒙（Herbert A. Simon）。
- **核心论断**：
    1. 充分性论断：任何一个物理符号系统，都具备产生通用智能行为的充分手段。
    2. 必要性论断：任何一个能够展现通用智能行为的系统，其本质必然是一个物理符号系统。
- 意义：将心智问题转化为工程问题，为符号主义注入信心。
#### 2.1.2 专家系统
- **定义**：模拟专家解决问题能力，通过编码知识给出专家级结论。
- **架构**：知识库（产生式规则 IF-THEN）、推理机（正向链/反向链）、用户界面。
![image.png](https://pub-f0ec440a5c1b4b63a1d2c9eaaf0c6b3a.r2.dev/2026/01/0e770c19cf19575fe0dc5bb42218fdee.png)

- **典型案例**：MYCIN系统（1970s，斯坦福大学）
    - 辅助诊断细菌性血液感染。
    - 使用反向链推理 + 置信因子（Certainty Factor, CF）处理不确定性。
    - 知识库约600条规则，性能超过非专业医生。
- 证明了物理符号系统假说的有效性。
#### 2.1.3 SHRDLU
- 提出者：1968-1970，特里·威诺格拉德（Terry Winograd）。
- **场景**：在“积木世界”中通过自然语言交互。
![image.png](https://pub-f0ec440a5c1b4b63a1d2c9eaaf0c6b3a.r2.dev/2026/01/c41394534876c64a13565676aa96e8e9.png)

- **能力**：语言解析、规划、记忆；处理指代、上下文、动作序列规划、记忆问答。
- **历史地位**：最早综合性智能典范，推动微观世界方法普及，但也引发乐观与反思。
#### 2.1.4 符号主义面临的根本性挑战
- 从80年代起暴露问题：
    - **知识获取瓶颈**（常识问题、内隐知识难编码）。
    - **框架问题**（动态世界中判断哪些事实不变困难）。
    - **系统脆弱性**（规则外变化导致完全失灵）。
### 2.2 构建基于规则的聊天机器人
通过复现ELIZA，感受规则系统的实际表现和局限。
#### 2.2.1 ELIZA 的设计思想
- 提出者：1966，约瑟夫·魏泽鲍姆（Joseph Weizenbaum）。
- **脚本**：“DOCTOR”模仿心理治疗师。
- **机制**：通过关键词转换规则生成提问，非真正理解。
- **效应**：简单技巧营造智能假象，用户产生情感依赖（ELIZA效应）。
#### 2.2.2 模式匹配与文本替换
- 算法流程：关键词识别与排序 → 分解规则（带通配符 *） → 重组规则 → 代词转换。
#### 2.2.3 核心逻辑的实现
- 提供Python代码实现迷你ELIZA（使用规则库、正则匹配、代词转换）。
- 示例对话展示
```python
import re
import random

# 定义规则库:模式(正则表达式) -> 响应模板列表
rules = {
    r'I need (.*)': [
        "Why do you need {0}?",
        "Would it really help you to get {0}?",
        "Are you sure you need {0}?"
    ],
    r'Why don\'t you (.*)\?': [
        "Do you really think I don't {0}?",
        "Perhaps eventually I will {0}.",
        "Do you really want me to {0}?"
    ],
    r'Why can\'t I (.*)\?': [
        "Do you think you should be able to {0}?",
        "If you could {0}, what would you do?",
        "I don't know -- why can't you {0}?"
    ],
    r'I am (.*)': [
        "Did you come to me because you are {0}?",
        "How long have you been {0}?",
        "How do you feel about being {0}?"
    ],
    r'.* mother .*': [
        "Tell me more about your mother.",
        "What was your relationship with your mother like?",
        "How do you feel about your mother?"
    ],
    r'.* father .*': [
        "Tell me more about your father.",
        "How did your father make you feel?",
        "What has your father taught you?"
    ],
    r'.*': [
        "Please tell me more.",
        "Let's change focus a bit... Tell me about your family.",
        "Can you elaborate on that?"
    ]
}

# 定义代词转换规则
pronoun_swap = {
    "i": "you", "you": "i", "me": "you", "my": "your",
    "am": "are", "are": "am", "was": "were", "i'd": "you would",
    "i've": "you have", "i'll": "you will", "yours": "mine",
    "mine": "yours"
}

def swap_pronouns(phrase):
    """
    对输入短语中的代词进行第一/第二人称转换
    """
    words = phrase.lower().split()
    swapped_words = [pronoun_swap.get(word, word) for word in words]
    return " ".join(swapped_words)

def respond(user_input):
    """
    根据规则库生成响应
    """
    for pattern, responses in rules.items():
        match = re.search(pattern, user_input, re.IGNORECASE)
        if match:
            # 捕获匹配到的部分
            captured_group = match.group(1) if match.groups() else ''
            # 进行代词转换
            swapped_group = swap_pronouns(captured_group)
            # 从模板中随机选择一个并格式化
            response = random.choice(responses).format(swapped_group)
            return response
    # 如果没有匹配任何特定规则，使用最后的通配符规则
    return random.choice(rules[r'.*'])

# 主聊天循环
if __name__ == '__main__':
    print("Therapist: Hello! How can I help you today?")
    while True:
        user_input = input("You: ")
        if user_input.lower() in ["quit", "exit", "bye"]:
            print("Therapist: Goodbye. It was nice talking to you.")
            break
        response = respond(user_input)
        print(f"Therapist: {response}")
        
>>>
Therapist: Hello! How can I help you today?
You: I am feeling sad today.
Therapist: How long have you been feeling sad today?
You: I need some help with my project.
Therapist: Are you sure you need some help with your project?
You: My mother is not happy with my work.
Therapist: Tell me more about your mother.
You: quit
Therapist: Goodbye. It was nice talking to you.
```
- **局限**：缺乏语义理解、无上下文记忆、规则扩展性差 → 揭示符号主义内在矛盾。