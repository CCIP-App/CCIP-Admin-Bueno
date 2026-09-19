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

Use Node.js 24 or newer. Copy `config.json.example` to `config.json` and fill in the event and API settings before running the app. Camera scanning requires HTTPS or localhost. Image upload is only shown when the browser does not support camera capture; denied permissions keep the camera workflow with a retry action. A yellow outline marks a located QR code that cannot yet be decoded, and a green outline marks a decoded QR code.

``` bash
# install dependencies
npm ci

# configure the event and API endpoints
cp config.json.example config.json

# serve with hot reload at localhost:5173
npm run dev

# build for production under /admin/
npm run build

# lint and run browser smoke checks with mocked APIs
npm run lint
npm exec playwright install chromium
npm test
```

The smoke check builds with test configuration and blocks real backend requests. It covers all enabled routes, navigation, light charts under dark system preferences, forms, QR image/video decoding, camera permissions and retry, detection outlines, camera cleanup, and token/Bingo compatibility. To use an existing Chrome installation, set `CHROME_BIN` to its executable path when running `npm test`.

---

> [SITCON - Official Site](https://SITCON.org) &nbsp;&middot;&nbsp;
> Github of CCIP [@CCIP-App](https://github.com/CCIP-App)


For build configuration, see the [Vite documentation](https://vite.dev/).
