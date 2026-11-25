const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const path = require('node:path')

function setup(key = 'chosen', initiallyLoaded = true) {
  const file = path.join(__dirname, '../src/composables/usePreferredVoice.ts')
  const { outputText } = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS }
  })
  const def = { voiceURI: 'default', lang: 'en-US', default: true }
  const chosen = { voiceURI: 'chosen', lang: 'en-GB' }
  const auth = { token: 'test-session', isAuthenticated: true, user: initiallyLoaded ? { id: 'test', preferredVoiceKey: key } : null,
    updateUser(update) { this.user = { ...this.user, ...update } } }
  const spoken = [], warnings = []
  let voices = [def], cancels = 0
  let clock = 0
  const synth = { getVoices: () => voices, cancel: () => cancels++, speak: u => spoken.push(u) }
  const module = { exports: {} }
  vm.runInNewContext(outputText, {
    module, exports: module.exports, require(name) {
      if (name.includes('auth.store')) return { useAuthStore: () => auth }
      if (name.includes('useToast')) return { useToast: () => ({ showWarning: m => warnings.push(m) }) }
      throw Error(name)
    },
    window: { speechSynthesis: synth }, document: { documentElement: { lang: 'en' } },
    localStorage: { getItem: () => null },
    SpeechSynthesisUtterance: class { constructor(text) { this.text = text } },
    Date: { now: () => clock }, setTimeout(fn, ms) { clock += ms; queueMicrotask(fn) }
  }, { filename: file })
  return { ...module.exports, auth, spoken, warnings, chosen, def, setVoices: v => voices = v, cancels: () => cancels }
}

test('waits for the chosen voice, never speaks the default first', async () => {
  const s = setup()
  const request = s.speakPreferred('word')
  assert.equal(s.spoken.length, 0)
  s.setVoices([s.def, s.chosen])
  await request
  assert.equal(s.spoken.length, 1)
  assert.equal(s.spoken[0].voice, s.chosen)
  assert.equal(s.spoken[0].lang, 'en-GB')
})

test('new speech request supersedes a previous waiting request', async () => {
  const s = setup()
  const first = s.speakPreferred('old')
  const second = s.speakPreferred('new')
  s.setVoices([s.def, s.chosen])
  await Promise.all([first, second])
  assert.deepEqual(s.spoken.map(u => u.text), ['new'])
  assert.ok(s.cancels() >= 2)
})

test('preview is temporary; user selection stays intact', async () => {
  const s = setup()
  s.setVoices([s.def, s.chosen])
  await s.speakPreferred('preview', { voiceKey: 'default' })
  await s.speakPreferred('word')
  assert.deepEqual(s.spoken.map(u => u.voice.voiceURI), ['default', 'chosen'])
  assert.equal(s.getPreferredVoiceKey(), 'chosen')
})

test('missing selected voice warns instead of speaking another voice', async () => {
  const s = setup()
  await s.speakPreferred('word')
  assert.equal(s.spoken.length, 0)
  assert.equal(s.warnings.length, 1)
})

test('reload waits for user preference; changing voice cancels pending speech', async () => {
  const s = setup('chosen', false)
  const pending = s.speakPreferred('reload')
  s.auth.user = { id: 'test', preferredVoiceKey: 'chosen' }
  s.setVoices([s.def, s.chosen])
  await pending
  assert.equal(s.spoken[0].voice.voiceURI, 'chosen')
  s.setPreferredVoiceKey('default')
  await s.speakPreferred('updated')
  assert.equal(s.spoken[1].voice.voiceURI, 'default')
})
