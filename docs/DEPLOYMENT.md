# 部署指南

這個 App 目前的執行方式是：**後端 Express 伺服器同時提供 API（`/api/*`）和前端靜態檔案**，整個 App 只用一個 port。開發時在本機執行、手機透過同一個 WiFi 連到你電腦的區網 IP 就能同步資料。這份文件說明兩種讓「隨時隨地都能同步」的路，以及需要你自己動手的步驟（這些帳號申請、部署動作不會由 Claude 代為執行）。

## 目前的方式：本機 + 同一個 WiFi

1. 在專案根目錄建置正式版本：
   ```bash
   npm run build
   ```
2. 啟動正式伺服器：
   ```bash
   npm start
   ```
   （或手動：`cd server && NODE_ENV=production node dist/index.js`）
3. 找到電腦的區網 IP（Windows：`ipconfig`，看 Wi-Fi 介面卡的 IPv4 位址）。
4. 手機連到同一個 WiFi，瀏覽器開啟 `http://<你的區網IP>:4000`。
5. Android Chrome：選單 →「加到主畫面」；iOS Safari：分享 →「加入主畫面」，就能像 App 一樣使用。

限制：只有手機和電腦在**同一個 WiFi** 時才能同步，電腦關機或離開 WiFi 就無法連線。

## 想要「隨時隨地都能同步」：部署到雲端

需要把後端 + 資料庫放到一個 24 小時在線的伺服器上。推薦以下任一種免費方案，**這些帳號申請與設定步驟需要你自己完成**（涉及註冊帳號、綁定金流資訊等，不適合由助理代為操作）：

### 選項 A：Render（建議，設定最簡單）

1. 到 [render.com](https://render.com) 註冊帳號，連接你的 GitHub。
2. 把這個專案推到 GitHub（一個新的 repository）。
3. Render 上新增一個 **PostgreSQL** 資料庫（免費方案即可），複製它的 `Internal Database URL`。
4. 新增一個 **Web Service**，指向你的 repo：
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - 環境變數：
     - `DATABASE_URL` = 上一步複製的 Postgres URL
     - `JWT_SECRET` = 一組隨機長字串（例如用 `openssl rand -hex 32` 產生）
     - `NODE_ENV` = `production`
5. 把 `server/prisma/schema.prisma` 的 `datasource db` provider 從 `sqlite` 改成 `postgresql`（見下方「切換資料庫」）。
6. 部署完成後，Render 會給一個 `https://xxxx.onrender.com` 網址，手機和電腦都用這個網址存取，資料就會同步。

### 選項 B：Railway / Fly.io

流程類似 Render：申請帳號、建立一個 Postgres 資料庫、部署這個 repo 當作 Web Service，設定同樣的三個環境變數。

## 切換資料庫：SQLite → PostgreSQL

目前 `server/prisma/schema.prisma` 用的是本機檔案型的 SQLite，方便在你電腦上開發。要換成雲端 Postgres 只需要兩步：

1. 修改 `server/prisma/schema.prisma`：
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. 在雲端服務的環境變數把 `DATABASE_URL` 設成 Postgres 的連線字串，然後執行一次：
   ```bash
   npx prisma migrate deploy
   ```
   這會把 `server/prisma/migrations` 裡的既有 migration 套用到新的 Postgres 資料庫，不需要重寫任何程式碼。

## 環境變數總覽

| 變數 | 說明 |
|---|---|
| `PORT` | 伺服器監聽的 port，雲端平台通常會自動注入，不用自己設 |
| `NODE_ENV` | 設為 `production` 才會啟用「同源 serve 前端靜態檔」的邏輯 |
| `DATABASE_URL` | SQLite 用 `file:./dev.db`；Postgres 用雲端服務提供的連線字串 |
| `JWT_SECRET` | 登入 token 簽章用的隨機字串，正式環境務必換成長且隨機的值，不要用 `.env.example` 裡的預設值 |
| `JWT_EXPIRES_IN` | 登入有效期限，預設 `30d` |

## 匯率資料來源的限制

系統的匯率轉換依賴兩個免費、不需金鑰的服務：
- [Frankfurter.app](https://www.frankfurter.app)（ECB 資料，涵蓋約 30 種主要貨幣，含歷史匯率）
- [open.er-api.com](https://www.exchangerate-api.com/docs/free)（備援，涵蓋更多貨幣如 TWD，但只有即時匯率、沒有歷史資料）

兩者都是公開免費服務，沒有官方 SLA 保證。如果之後其中一個服務停止服務或改成需要金鑰，`server/src/services/exchangeRateService.ts` 是唯一需要更新的地方。
