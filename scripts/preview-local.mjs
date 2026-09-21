import { createServer } from 'node:http'
import { timingSafeEqual } from 'node:crypto'
import { readFile, mkdtemp, rm } from 'node:fs/promises'
import { resolve, extname, sep, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

export function startPreview ({ directory, password, configFile = fileURLToPath(new URL('../config.json', import.meta.url)), port = 4173 }) {
  const authorization = Buffer.from(`Basic ${Buffer.from(`opass:${password}`).toString('base64')}`)
  const server = createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    const send = (status, data) => {
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
      res.end(req.method === 'HEAD' ? undefined : JSON.stringify(data))
    }
    try {
      const path = new URL(req.url, 'http://localhost').pathname
      const received = Buffer.from(req.headers.authorization || '')
      if (received.length !== authorization.length || !timingSafeEqual(received, authorization)) {
        res.setHeader('WWW-Authenticate', 'Basic realm="OPass local preview"')
        return send(401, { message: 'Authentication required' })
      }
      if (!['GET', 'HEAD'].includes(req.method)) return send(405, {})
      if (path === '/admin/config.json') return send(200, JSON.parse(await readFile(configFile, 'utf8')))
      const relative = decodeURIComponent(path.replace(/^\/admin\/?/, '')) || 'index.html'
      const file = resolve(directory, relative)
      if (!file.startsWith(resolve(directory) + sep)) return send(404, {})
      const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.wasm': 'application/wasm', '.ico': 'image/x-icon' }
      const content = await readFile(file)
      res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' })
      res.end(req.method === 'HEAD' ? undefined : content)
    } catch { send(404, { message: 'Not available' }) }
  })
  return new Promise(resolve => server.listen(port, '127.0.0.1', () => resolve(server)))
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.length > 2) throw new Error('No command-line arguments are supported')
  process.umask(0o077)
  const secrets = process.env.OPASS_SECRETS_DIR
  if (!secrets) throw new Error('Set OPASS_SECRETS_DIR to the protected directory containing admin-basic-password.txt')
  const password = (await readFile(join(secrets, 'admin-basic-password.txt'), 'utf8')).trim()
  if (!password) throw new Error('The local Basic Auth password must not be empty')
  const directory = await mkdtemp(join(secrets, 'admin-build-'))
  const port = Number(process.env.OPASS_PREVIEW_PORT || 4173)
  await build({
    mode: 'production', base: '/admin/', logLevel: 'warn',
    build: { outDir: directory, emptyOutDir: true }
  })
  const server = await startPreview({ directory, password, port })
  console.log(`Local Admin: http://127.0.0.1:${port}/admin/#/push`)
  console.log('Basic Auth user: opass; password is read from the protected file')
  const stop = () => server.close(async () => {
    await rm(directory, { recursive: true, force: true })
  })
  process.on('SIGINT', stop)
  process.on('SIGTERM', stop)
}
