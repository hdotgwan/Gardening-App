import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Plot & Petal app shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Plot &amp; Petal/);
  assert.match(html, /Your garden, remembered/);
  assert.match(html, /Garden journal/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/);
});

test("includes the requested product capabilities", async () => {
  const [page, layout, schema, hosting] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /detectLocalPlant/);
  assert.match(page, /Understand my note/);
  assert.match(page, /garden-canvas/);
  assert.match(page, /Notification\.requestPermission/);
  assert.match(schema, /journalEntries/);
  assert.match(schema, /reminders/);
  assert.match(schema, /gardenPlans/);
  assert.match(hosting, /"d1": "DB"/);
  assert.match(layout, /og\.png/);
});
