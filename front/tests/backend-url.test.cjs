const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

function loadBackendUrlUtility(savedValue = null) {
  const source = fs.readFileSync("src/utils/backendUrl.ts", "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const module = { exports: {} };
  const window = {
    localStorage: {
      getItem: () => savedValue,
    },
  };
  const context = vm.createContext({
    module,
    exports: module.exports,
    window,
    URL,
  });
  vm.runInContext(transpiled, context);
  return module.exports;
}

test("accepts public Tailscale HTTPS host with no arbitrary paths", () => {
  const service = loadBackendUrlUtility();
  assert.equal(
    service.normalizeTailscaleBackendUrl("https://api.example-tailnet.ts.net/"),
    "https://api.example-tailnet.ts.net",
  );
  assert.equal(
    service.normalizeTailscaleBackendUrl(" https://api.example-tailnet.ts.net "),
    "https://api.example-tailnet.ts.net",
  );
  assert.equal(
    service.normalizeTailscaleBackendUrl("https://api.example-tailnet.ts.net:8443"),
    "https://api.example-tailnet.ts.net:8443",
  );
  assert.equal(
    service.normalizeTailscaleBackendUrl("https://api.example-tailnet.ts.net:10000"),
    "https://api.example-tailnet.ts.net:10000",
  );
});

test("rejects potentially unsafe or incompatible backend URLs", () => {
  const { normalizeTailscaleBackendUrl: validate } = loadBackendUrlUtility();
  const cases = [
    "http://api.example-tailnet.ts.net",
    "https://example.com",
    "https://127.0.0.1",
    "https://user:password@api.example-tailnet.ts.net",
    "https://api.example-tailnet.ts.net:8888",
    "https://api.example-tailnet.ts.net/unexpected/path",
    "https://api.example-tailnet.ts.net/?token=secret",
    "https://api.example-tailnet.ts.net/#private",
    "javascript:alert(1)",
    "",
  ];
  for (const input of cases) {
    assert.equal(validate(input), null, input);
  }
});

test("reads valid stored browser endpoint and ignores invalid entries", () => {
  const valid = loadBackendUrlUtility("https://backend.example.ts.net");
  assert.equal(valid.readConfiguredBackendUrl(), "https://backend.example.ts.net");
  const invalid = loadBackendUrlUtility("http://localhost:3000");
  assert.equal(invalid.readConfiguredBackendUrl(), null);
});
