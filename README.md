# 尼罗河 · 3D 模型

非洲尼罗河交互式 3D 模型：真实地形 + 真实卫星影像 + 真实河道，支持缩放/平移/旋转、8 段切换、POI 信息卡、电影感风格化渲染。
交付形态为**网页链接 + 二维码**，嵌入 PPT 展示（二维码用 `scripts/gen-qr.mjs` 生成）。

## 技术栈

- **CesiumJS**（真实地球 / 地形 / 影像）+ **Vue 3** + **TypeScript** + **Vite**
- 底图：Esri World Imagery（免 token，国内可达）
- 地形：Cesium Ion 世界地形（可选注入 token；失败优雅回退平面）
- 数据：尼罗河真实河道（Natural Earth 10m，`scripts/fetch-nile.mjs` 生成）

## 开发

```bash
npm install
npm run dev        # 本地开发 http://localhost:5173
npm run build      # 生产构建 → dist/
npm run preview    # 预览构建产物
```

## 数据维护

| 文件 | 说明 |
|---|---|
| `scripts/fetch-nile.mjs` | 重新抓取尼罗河水系几何（OSM → Natural Earth 回退） |
| `public/data/segments.json` | 分段定义（视角矩形、类别、标题） |
| `public/data/pois.json` | POI 目录（坐标、类别、中英文介绍） |

## 真实地形（可选，推荐）

默认使用 Cesium Ion 默认 token（偶发限流会自动回退平面）。为稳定，注册免费 Ion 账号并注入自己的 token：

```bash
cp .env.example .env
# 编辑 .env，填入 VITE_CESIUM_TOKEN=你的token
```

## 部署

- **Vercel（推荐，国内可达优）**：导入仓库 → Framework Preset 选 Vite → Deploy。每次 `git push` 自动重新部署。
- **GitHub Pages**：仓库 Settings → Pages → Source 选 GitHub Actions。

## 生成二维码（放进 PPT）

```bash
node scripts/gen-qr.mjs https://你的线上地址 public/qr.png
```

## 操作说明

- 左键拖拽：旋转　右键拖拽：平移　滚轮：缩放
- 左侧导航栏：切换 8 个重点河段（相机自动飞行）
- 点击地图上的彩色标记：弹出该 POI 介绍卡
