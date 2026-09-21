<div align="center">
<h1>CCIP-Admin-Bueno</h1>

<p>
  <strong>CCIP admin for SITCON</strong>,
</p>

<p>
  <sub>
    Made by <a href="https://github.com/CCIP-App/CCIP-Admin-Bueno/graphs/contributors">contributors</a>
  </sub>
</p>

<p>

<a href="https://github.com/CCIP-App/CCIP-Admin-Bueno"><img src="https://img.shields.io/aur/license/yaourt.svg" alt="GPL 3.0 License"></a>

</div>

> A Vue.js project

## Build Setup

Use Node.js 24 or newer. Copy `config.json.example` to `config.json` and fill in the event, API and Gateway settings before running the app. All eight fields are loaded at runtime when the page opens; reload after changing settings. Builds do not require or embed `config.json`. Camera scanning requires HTTPS or localhost. Image upload is only shown when the browser does not support camera capture; denied permissions keep the camera workflow with a retry action. A yellow outline marks a located QR code that cannot yet be decoded, and a green outline marks a decoded QR code.

``` bash
# install dependencies
npm ci

# configure the event, API and Gateway
cp config.json.example config.json
chmod 600 config.json

# serve with hot reload at localhost:5173
npm run dev

# build for production under /admin/
npm run build

# lint and run browser smoke checks with mocked APIs
npm run lint
npm exec playwright install chromium
npm test
```

The smoke check serves mocked runtime configuration and blocks real backend requests. It covers configuration reloads and failures, all enabled routes, navigation, light charts under dark system preferences, forms, QR image/video decoding, camera permissions and retry, detection outlines, camera cleanup, and token/Bingo compatibility. To use an existing Chrome installation, set `CHROME_BIN` to its executable path when running `npm test`.

## 公開活動推播

推播直接使用 [Gateway v1](https://github.com/CCIP-App/CCIP-Push-Gateway/blob/main/openapi.yaml)，角色清單由 CCIP-Server 提供。公告與推播為獨立操作。

在 `config.json` 設定中央提供的 `gateway_url`（origin，不含 `/v1`）與 `gateway_key`；`event_id` 必須與 Gateway 授權的活動相符。

本機受保護預覽：在受保護目錄建立 `admin-basic-password.txt`，設定目錄權限為 `0700`、密碼檔為 `0600`，然後執行：

```bash
OPASS_SECRETS_DIR=/path/to/protected-directory npm run preview:local
```

開啟 `http://127.0.0.1:4173/admin/#/push`，Basic Auth 使用者為 `opass`，密碼來自上述檔案。中央須登記 origin `http://127.0.0.1:4173`。

設定檔含憑證，不得公開或提交至 Git。部署時，將 document root 外的 `config.json` 映射到 `/admin/config.json`，回傳 `Content-Type: application/json`；不將設定檔放進 `public/` 或建置產物。整個 `/admin/`（含設定端點與靜態資源）都須受 Basic Auth 與 `Cache-Control: no-store` 保護。本機預覽已套用此保護，並從專案根目錄的 `config.json` 即時讀檔；開發模式由 Vite 提供 `/config.json`，僅使用測試憑證。修改設定後重新整理頁面即可，不需重新建置或重啟預覽服務。

---

> [SITCON - Official Site](https://SITCON.org) &nbsp;&middot;&nbsp;
> Github of CCIP [@CCIP-App](https://github.com/CCIP-App)


For build configuration, see the [Vite documentation](https://vite.dev/).
