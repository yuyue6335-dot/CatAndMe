# Agent Guide

## 项目是什么
这是一个 Next.js 15 + React 19 的离线优先回忆记录网页，主题是“猫与回忆”。它把照片、地点、评论、标签和日期放在同一条时间线上，并通过地图把回忆串起来。

## 你在改什么
- 前端入口：`app/page.tsx`
- 全局布局与 PWA：`app/layout.tsx`、`app/manifest.ts`
- 数据层：`lib/db.ts`、`lib/types.ts`、`lib/queries.ts`
- 导入导出：`lib/bundle.ts`、`components/export-import-panel.tsx`
- 录入与展示：`components/memory-form.tsx`、`components/memory-list.tsx`
- 地图：`components/map-view.tsx`
- UI 基础组件：`components/ui.tsx`

## 核心行为
- 数据保存在浏览器 IndexedDB，数据库名是 `cats-memory-lodge`
- 页面通过 `dexie-react-hooks` 的 `useLiveQuery` 实时读取数据
- 新建回忆时会同时写入 memory、place、tag、comment、photo 和关联表
- 照片支持从 EXIF 里读取 GPS
- 地图使用 MapLibre，点击地图可以回填坐标
- 导出时会把照片转成 base64，并可选加密
- 导入时会解密、反序列化，然后把照片 Blob 重新水合回来

## 数据结构
重点看 `lib/types.ts`：
- `Memory`：回忆主表
- `Place`：地点
- `Comment`：评论
- `Tag`：标签
- `MemoryTag`：回忆和标签的关联
- `Photo`：照片文件和元数据
- `DBSnapshot`：导入导出用的快照格式，当前版本是 `version: 1`

## 开发命令
```bash
npm run dev
npm test
npm run build
```

## 已知注意点
- 这个项目高度依赖浏览器能力，尤其是 IndexedDB、File、Blob、Web Crypto、MapLibre。
- `components/map-view.tsx` 里地图样式来自线上地址，离线时可能不可用。
- 导出/导入和加密逻辑已经有测试，测试文件在 `tests/bundle.test.ts`。
- 我在当前环境里跑 `npm test` 和 `npm run build` 时遇到了 Node 的路径权限错误：`EPERM: operation not permitted, lstat 'C:\\Users\\27734'`。如果你要继续验证，建议在本机终端或编辑器集成终端里再跑一次。
- 终端里有些中文文案看起来可能显示异常，改动这些字符串时最好用编辑器确认原始文件内容。

## 修改建议
- 优先保持“离线、轻量、单页”的体验，不要把数据流改成重后端方案。
- 如果要加新字段，先同步更新 `lib/types.ts`、`lib/bundle.ts`、`lib/db.ts`，再改表单和列表。
- 涉及照片或导出格式的改动，记得补 `tests/bundle.test.ts`。
