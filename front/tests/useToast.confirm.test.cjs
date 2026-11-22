const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function createToastStore() {
  // Exercise the actual TypeScript composable in an isolated module instance;
  // Vue's real ref() is used, while notification timers are deliberately inert.
  const file = path.join(__dirname, "../src/composables/useToast.ts");
  const source = fs.readFileSync(file, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
  });
  const module = { exports: {} };
  const context = vm.createContext({
    require,
    module,
    exports: module.exports,
    setTimeout: () => 0,
    console: { error: () => undefined },
  });
  vm.runInContext(outputText, context, { filename: file });
  return { ...module.exports.useToast(), anotherCaller: module.exports.useToast() };
}

test("spam deleting one vocabulary tab opens only a single confirmation", () => {
  const toast = createToastStore();
  let calls = 0;
  for (let n = 0; n < 100; n++) {
    toast.confirm(
      "Delete vocabulary tab?",
      () => {
        calls++;
      },
      { type: "error", label: "Delete" },
    );
  }
  assert.equal(toast.toasts.value.length, 1);
  assert.equal(toast.toasts.value[0].message, "Delete vocabulary tab?");
  assert.equal(calls, 0);
});

test("different confirmation callers share the same single slot", () => {
  const toast = createToastStore();
  toast.confirm("Delete tab A?", () => undefined);
  // A separate component calling useToast() must share the same confirmation slot.
  toast.anotherCaller.confirm("Delete tab B?", () => undefined);
  assert.deepEqual(
    Array.from(toast.toasts.value, (item) => item.message),
    ["Delete tab A?"],
  );
  toast.removeToast(toast.toasts.value[0].id);
  toast.confirm("Delete tab B?", () => undefined);
  assert.deepEqual(
    Array.from(toast.toasts.value, (item) => item.message),
    ["Delete tab B?"],
  );
});

test("repeated confirm clicks execute delete exactly once", async () => {
  const toast = createToastStore();
  let calls = 0;
  toast.confirm("Delete A?", async () => {
    calls++;
  });
  const id = toast.toasts.value[0].id;
  await Promise.all([toast.triggerAction(id), toast.triggerAction(id), toast.triggerAction(id)]);
  assert.equal(calls, 1);
  assert.equal(toast.toasts.value.length, 0);
});

test("a pending delete prevents new confirmations until its API action finishes", async () => {
  const toast = createToastStore();
  let resolveDelete;
  let calls = 0;
  const pending = new Promise((resolve) => {
    resolveDelete = resolve;
  });
  toast.confirm("Delete A?", async () => {
    calls++;
    await pending;
  });
  const id = toast.toasts.value[0].id;
  const deleting = toast.triggerAction(id);
  for (let n = 0; n < 40; n++) {
    toast.confirm("Delete B?", () => {
      calls++;
    });
  }
  assert.equal(toast.toasts.value.length, 0);
  assert.equal(calls, 1);
  resolveDelete();
  await deleting;
  toast.confirm("Delete B?", () => {
    calls++;
  });
  assert.equal(toast.toasts.value.length, 1);
  assert.equal(toast.toasts.value[0].message, "Delete B?");
});

test("a failed async confirmation releases the lock", async () => {
  const toast = createToastStore();
  toast.confirm("Delete A?", async () => {
    throw new Error("backend failed");
  });
  await toast.triggerAction(toast.toasts.value[0].id);
  toast.confirm("Delete B?", () => undefined);
  assert.equal(toast.toasts.value.length, 1);
});

test("normal notifications still work alongside a confirmation", () => {
  const toast = createToastStore();
  toast.confirm("Delete tab?", () => undefined);
  toast.show("Saved!", "success", 0);
  assert.equal(toast.toasts.value.filter((item) => !!item.onAction).length, 1);
  assert.equal(
    toast.toasts.value.some((item) => item.message === "Saved!"),
    true,
  );
});
