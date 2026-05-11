# Trace（AI 日记应用）— 静态展示站点

本仓库为**纯静态页面**：`index.html` 为可交互产品原型，`prd.html` 为作品集 / PRD / 设计说明与讲解视频。**发给面试官时请使用线上 `https://` 链接**；对方电脑无法打开你本机的 `file:///...` 路径。

---

## 页面入口

| 页面 | 说明 |
|------|------|
| [`index.html`](./index.html) | 手机壳内的完整产品演示（写日记、日历、AI 聊天等） |
| [`prd.html`](./prd.html) | 产品展示与 PRD；章节锚点示例：`prd.html#frontend-design`、`prd.html#prd-writing` |

演示页右下角有固定按钮 **「作品集与 PRD」**，可跳到 PRD；PRD 顶栏有 **「打开产品demo」** 回到演示。

---

## 本地预览（可选）

在项目根目录执行其一：

```bash
python3 -m http.server 8080
```

浏览器打开：<http://localhost:8080/index.html> 与 <http://localhost:8080/prd.html>。

---

## 部署后发给面试官（推荐）

任选一种免费静态托管，把整个项目文件夹（含 `assets/`、`styles.css`、`app.js`、`sun-canvas.js` 等）上传或推送。

### GitHub Pages

1. 在 GitHub 新建仓库，把本项目文件 push 上去。  
2. 仓库 **Settings → Pages**：Source 选 **Deploy from a branch**，Branch 选 **`main`**（或你的默认分支），文件夹 **`/ (root)`**。  
3. 等待几分钟后，站点地址一般为：  
   `https://<用户名>.github.io/<仓库名>/`  
4. 发给对方的链接示例：  
   - 演示：`https://<用户名>.github.io/<仓库名>/index.html`  
   - PRD（直达前端设计章节）：`https://<用户名>.github.io/<仓库名>/prd.html#frontend-design`

### Netlify

1. 登录 [Netlify](https://www.netlify.com/)，**Add new site → Deploy manually**，把项目文件夹拖入。  
2. 部署完成后使用分配的 `https://xxx.netlify.app` 域名即可。

### Cloudflare Pages / Vercel

同样选择「静态站点」，根目录为项目根，构建命令留空，输出目录为 `.`。

---

## 部署后建议自检

- [ ] 演示页 `index.html` 能打开，交互正常。  
- [ ] `prd.html` 能打开，视频与图片资源加载正常。  
- [ ] 点击「作品集与 PRD」「打开产品demo」跳转正确。  
- [ ] 用手机打开一次，布局无严重错位。

---

## 许可证与署名

页面内标注创作者：**易文迪 Wendi**。若 fork 或二次展示，请保留原作者说明。
