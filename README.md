# CatAndMe / 猫与回忆

这是一个用 Next.js 15 和 React 19 写的私密回忆记录应用。它把照片、地点、日期、标签、评论和收藏状态放在同一个时间线里，再用地图把这些回忆串起来。对我来说，它不只是一个 CRUD 小项目，更像是在练习怎样把“记录生活”这件事做得轻一点、安静一点，也更值得长期使用。

## 项目理解

项目的核心入口在 `app/page.tsx`。首页承担了新增回忆、搜索、地图选点、导入导出和当前状态展示；`app/memories/page.tsx` 则更像一个完整的回忆列表页，用来查看、搜索、收藏和删除已经创建的内容。

数据层已经从纯前端存储走向了云端：

- Supabase Auth 负责登录状态。
- Drizzle ORM + Postgres 保存回忆、地点、评论、标签、照片元数据等结构化数据。
- Supabase Storage 保存照片文件。
- API Routes 作为前端和服务端数据之间的边界。
- 导入导出支持把照片转成 base64，并可以通过 Web Crypto 做加密备份。

这让应用的定位更清楚：它不是一次性的相册页面，而是一个可以跨设备、可备份、可恢复的个人回忆库。

## 主要功能

- 创建带标题、日期、备注、地点、标签、评论和照片的回忆。
- 通过 MapLibre 展示地点，也可以从地图上选择坐标回填到表单。
- 上传照片到 Supabase Storage，并在数据库中保存照片元数据。
- 按标题、备注或日期搜索回忆。
- 收藏或删除单条回忆。
- 查看当前账号的完整回忆列表。
- 支持 JSON 快照导入导出，包含照片 base64。
- 支持加密导出和解密导入，适合做私密备份。
- 配置了 PWA manifest 和 service worker，具备渐进式 Web App 的基础。

## 技术栈

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Supabase Auth / Storage
- Drizzle ORM
- Postgres
- MapLibre GL
- Vitest
- Web Crypto API

## 目录速览

```text
app/                         Next.js App Router 页面与 API
app/api/memories/            回忆列表读取与创建接口
app/api/memories/[id]/       收藏更新与删除接口
app/api/photos/upload/       照片上传接口
app/api/import/              快照导入接口
components/                  表单、列表、地图、导入导出面板和 UI 组件
lib/server/                  服务端认证、数据库、存储和业务数据逻辑
lib/bundle.ts                快照序列化与照片水合逻辑
lib/crypto.ts                导入导出加密解密逻辑
drizzle/                     数据库迁移与快照
tests/                       Vitest 测试
public/                      PWA、图标和静态资源
```

## 本地运行

先安装依赖：

```bash
npm install
```

复制环境变量模板并填写 Supabase 和数据库配置：

```bash
cp .env.example .env.local
```

`.env.example` 中需要关注的变量：

```env
DATABASE_URL="postgres://postgres:postgres@127.0.0.1:54322/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_STORAGE_BUCKET="memory-photos"
DEV_USER_ID="dev-user"
```

启动开发环境：

```bash
npm run dev
```

运行测试：

```bash
npm test
```

构建生产版本：

```bash
npm run build
```

## 数据模型

项目的数据结构拆得比较清楚：

- `Memory` 是回忆主体，保存标题、日期、备注和收藏状态。
- `Place` 保存地点名称、经纬度、地址和来源。
- `Photo` 保存照片名称、类型、尺寸、经纬度和 Storage 路径。
- `Comment` 保存回忆下的文字评论。
- `Tag` 和 `MemoryTag` 负责标签及其关联。
- `DBSnapshot` 是导入导出用的快照格式，当前版本是 `version: 1`。

这种拆法比把所有字段塞进一张大表更耐用。照片、地点、标签和评论都有自己的生命周期，也方便以后继续扩展，比如做地点聚合、标签筛选、照片墙或按年份归档。

## 开发心得

这个项目最有意思的地方，是它把“情绪化的产品主题”和“工程化的数据边界”放在了一起。界面想表达的是柔软的回忆、两个人的日常和猫的陪伴；代码里真正需要稳住的，却是认证、上传、关联表、导入导出、加密和错误处理。

我读下来感觉，项目已经有了一个清晰的骨架：页面负责体验，组件负责交互，`lib/server` 负责服务端能力，`lib/types.ts` 统一描述数据形状。这样的分层让后续维护会舒服很多。尤其是 `MemoryView` 这个聚合视图，让前端不用到处拼请求，页面拿到一份完整快照后就能完成搜索、列表、地图和统计。

导入导出也是一个很关键的设计点。回忆类应用最怕用户觉得数据被锁住，而这个项目把结构化数据和照片都放进快照里，并且提供加密能力，说明它把“可迁移”和“可备份”当成了核心体验的一部分。这比只做云同步更让人安心。

目前代码里部分中文在终端里会显示成乱码，说明后续最好统一检查文件编码和编辑器设置。功能上也可以继续加强表单校验、照片预览体验、地图离线可用性，以及更细的测试覆盖。

## 后续可以改进的方向

- 增加按标签、地点、年份或收藏状态的筛选。
- 给照片上传增加进度、失败重试和批量预览。
- 为导入流程增加版本校验和冲突处理提示。
- 给地图增加地点聚类或按回忆数量高亮。
- 补充 API Route 和服务端数据逻辑的测试。
- 检查并统一中文文案编码，避免不同终端下出现乱码。

## 总结

CatAndMe 是一个很适合继续打磨的小型全栈应用。它的主题很私人，但技术结构并不松散：有认证、有数据库、有对象存储、有地图、有加密备份，也有测试入口。继续往下做时，我会优先保持它现在这种轻量、亲密、可掌控的气质，让功能增长服务于记录本身，而不是让应用变得沉重。
