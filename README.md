# 鸡娃 - 教育养成游戏

一个网页游戏，玩家可以领养和培养孩子，从中学开始一路卷到名校 offer、研究生/博士、再到顶尖公司 offer。

## 技术栈

- **Frontend**: Next.js 14 + React + TypeScript
- **State Management**: Zustand
- **Storage**: LocalStorage (通过 Zustand persist)
- **Styling**: Tailwind CSS
- **Data**: JSON 数据文件（可热更新）

## 项目结构

```
offer/
├── app/                    # Next.js App Router 页面
│   ├── page.tsx           # 首页
│   ├── adopt/             # 领养中心
│   └── child/[id]/        # 孩子详情页
├── lib/                    # 核心游戏引擎
│   ├── engine.ts          # 回合推进、事件触发、升级成本计算
│   ├── gacha.ts           # 抽奖系统
│   ├── admissions.ts      # 申请系统（大学/研究生）
│   ├── career.ts          # 求职系统
│   └── economy.ts         # 经济系统
├── store/                  # 状态管理
│   └── gameStore.ts       # Zustand store
├── types/                  # TypeScript 类型定义
│   └── index.ts
└── data/                   # JSON 数据文件
    ├── mbti.json
    ├── races.json
    ├── nationalities.json
    ├── personality_tags.json
    ├── majors.json
    ├── universities.json
    └── companies.json
```

## 核心功能

### 已完成（Milestone 1 部分）

- ✅ 数据模型定义（Child/Item/University/Company/Event）
- ✅ MBTI/国籍/种族/个性数据文件（JSON）
- ✅ 领养系统 + 孩子详情页
- ✅ 基础游戏引擎（Engine、Gacha、Admissions、Career、Economy）
- ✅ 状态管理（Zustand）+ 本地存储
- ✅ 基础页面结构（首页、领养中心、孩子详情页）

### 待完成

- [ ] 回合推进系统
- [ ] 基础道具（10个）+ 商店页面
- [ ] 大学申请简化版：投递 5 所→出结果
- [ ] 完整的申请中心页面
- [ ] 求职中心页面
- [ ] 抽奖页面
- [ ] 商店页面

## 安装和运行

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 生产模式
npm start
```

## 游戏玩法

1. **领养孩子**: 在领养中心花费 1000 金币领养一个孩子
2. **培养属性**: 通过升级提升孩子的智商、情商、颜值等属性
3. **申请大学**: 准备申请材料，投递大学申请
4. **申请研究生**: 本科毕业后申请研究生/博士
5. **求职**: 毕业后申请顶尖公司的工作

## 数据驱动

所有游戏数据都存储在 `data/*.json` 文件中，可以随时修改和更新，无需修改代码。

## 合规说明

- ⚠️ 本游戏仅为娱乐模拟，不代表真实录取/招聘结果
- 种族/国籍仅为游戏设定，允许玩家自定义标签
- 不宣称"真实录取率/真实招聘概率"

## 开发计划

详见 `task.md` 文件中的里程碑规划。
