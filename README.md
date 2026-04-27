# 📂 TokenMall 前端交付文档

> **项目状态**: High-Fidelity Prototype (高保真交互原型)  
> **交付日期**: 2024-12-15

## 1. 🔗 核心资源

| 资源 | 说明 | 链接 |
| :--- | :--- | :--- |
| **在线演示 (Demo)** | 部署于 Google Cloud (us-west1) | [👉 点击预览](https://tokenmall-codevault-406627348562.us-west1.run.app/) |
| **代码仓库** | GitHub Private Repository | [👉 codevaulttest/token-mall](https://github.com/codevaulttest/token-mall) |

**注意**：代码仓库为私有权限。请开发负责人提供 GitHub 账号，以便添加协作者(Collaborator)权限。

## 2. 📱 功能概览

本项目已实现通证商城的核心业务闭环（纯前端逻辑 + Mock 数据）：

*   **🛒 商城首页**: 瀑布流布局、多条件筛选、FEC/SLC 混合支付展示。
*   **🛍️ 商品详情**: 底部弹窗交互、**混合支付比例调节器** (核心逻辑)。
*   **📦 库存管理**: 个人资产列表、**批量提货/转让**、单品操作。
*   **📍 地址管理**: 收货地址增删改查、省市区三级联动 (模拟)。
*   **📜 记录中心**: 兑换/提货/转让记录查询、状态过滤。

## 3. 🛠️ 技术交接与待办 (To-Do)

### 3.1 工程化迁移 (优先级：高)
当前项目为方便预览，采用了轻量级结构。正式开发请根据团队技术规范进行迁移：
- [ ] **框架与构建**: 迁移至团队标准的生产级脚手架/框架。
- [ ] **工程化配置**: 完善代码构建、打包优化及开发环境配置。
- [ ] **规范约束**: 配置类型检查 (TypeScript) 及代码风格校验。

### 3.2 接口对接
目前数据由 `StoreContext.tsx` 和 `constants.ts` 提供。需对接后端 API：
- [ ] **用户**: 余额查询 (`/api/balance`)、地址管理。
- [ ] **商品**: 分页列表 (`/api/products`)、详情查询。
- [ ] **交易**: 兑换下单 (`/api/order/create`)、库存流转 (`/api/inventory/*`)。

### 3.3 静态资源
- [ ] **图片 CDN**: 将 `constants.ts` 中的 Unsplash 临时链接替换为公司 OSS/CDN 正式链接。

## 4. 🌍 部署建议

当前预览环境位于 **美国西部 (us-west1)**，亚洲访问存在物理延迟。

**🚀 正式上线建议**：
请务必将服务器节点选在 **新加坡 (asia-southeast1)** 或 **香港 (asia-east2)**，以保证目标用户的极速体验。

## 5. 💻 本地运行

```bash
# 1. 克隆代码
git clone https://github.com/codevaulttest/token-mall.git

# 2. 启动服务 (由于暂无构建工具，可使用任意静态服务器)
# 方法 A: Python
python3 -m http.server 8000

# 方法 B: Node http-server
npx http-server .

# 3. 访问
http://localhost:8000
```