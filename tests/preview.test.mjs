import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { startPreview } from '../scripts/preview-local.mjs'

test('local preview protects runtime config, reads updates and never caches or serves outside its root', async () => {
  const unsupportedArgs = spawnSync(process.execPath, [fileURLToPath(new URL('../scripts/preview-local.mjs', import.meta.url)), '--unsupported'], { encoding: 'utf8' })
  assert.equal(unsupportedArgs.status, 1)
  assert.match(unsupportedArgs.stderr, /No command-line arguments are supported/)
  const root = await mkdtemp(join(tmpdir(), 'opass-preview-test-'))
  const directory = join(root, 'public')
  await mkdir(directory)
  const configFile = join(root, 'config.json')
  await writeFile(configFile, '{"gateway_key":"test-only"}')
  await writeFile(join(directory, 'index.html'), '<p>Admin</p>')
  await writeFile(join(directory, 'app.js'), 'const app = "test-app"')
  const server = await startPreview({ directory, password: 'test-only', configFile, port: 0 })
  const url = `http://127.0.0.1:${server.address().port}`
  const headers = { Authorization: `Basic ${Buffer.from('opass:test-only').toString('base64')}` }
  try {
    for (const path of ['/admin/', '/admin/app.js', '/admin/config.json']) {
      const anonymous = await fetch(url + path)
      assert.equal(anonymous.status, 401)
      assert.equal(anonymous.headers.get('cache-control'), 'no-store')
      assert.ok(!((await anonymous.text()).includes('test-only')))
    }
    const response = await fetch(url + '/admin/app.js', { headers })
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('cache-control'), 'no-store')
    assert.match(await response.text(), /test-app/)
    const config = await fetch(url + '/admin/config.json', { headers })
    assert.equal(config.status, 200)
    assert.equal(config.headers.get('cache-control'), 'no-store')
    assert.match(config.headers.get('content-type'), /application\/json/)
    assert.equal((await config.json()).gateway_key, 'test-only')
    await writeFile(configFile, '{"gateway_key":"updated-test-only"}')
    assert.equal((await (await fetch(url + '/admin/config.json', { headers })).json()).gateway_key, 'updated-test-only')
    const head = await fetch(url + '/admin/config.json', { method: 'HEAD', headers })
    assert.equal(head.status, 200)
    assert.equal(await head.text(), '')
    assert.equal((await fetch(url + '/config.json', { headers })).status, 404)
    assert.equal((await fetch(url + '/admin/%2e%2e%2fconfig.json', { headers })).status, 404)
    assert.equal((await fetch(url + '/admin/', { headers })).status, 200)
  } finally {
    await new Promise(resolve => server.close(resolve))
    await rm(root, { recursive: true, force: true })
  }
})
