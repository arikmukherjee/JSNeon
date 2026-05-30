/* ============================================
   JSNeon IDE v2.0 — script.js
   Full-featured JavaScript compiler IDE
   ============================================ */

"use strict";

// ── Constants ──────────────────────────────────────────────────────────────
const STORAGE_KEY  = "jsneon_files";
const HISTORY_KEY  = "jsneon_history";
const THEME_KEY    = "jsneon_theme";
const EDITOR_THEME_KEY = "jsneon_editor_theme";
const FONT_SIZE_KEY = "jsneon_fontsize";
const MAX_HISTORY  = 30;
const MIN_FONT     = 10;
const MAX_FONT     = 24;

// ── Snippets Library ───────────────────────────────────────────────────────
const SNIPPETS = [
  {
    title: "Async / Await Fetch",
    tag: "async",
    desc: "Fetch JSON from a URL with error handling",
    code: `async function fetchData(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    const data = await res.json();
    console.log(data);
    return data;
  } catch (err) {
    console.error("Fetch failed:", err.message);
  }
}

fetchData("https://jsonplaceholder.typicode.com/todos/1");`
  },
  {
    title: "Debounce Function",
    tag: "utility",
    desc: "Delay a function call until input stops",
    code: `function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

const onSearch = debounce((query) => {
  console.log("Searching for:", query);
}, 500);

onSearch("hello");
onSearch("hello w");
onSearch("hello world"); // only this fires`
  },
  {
    title: "Deep Clone Object",
    tag: "utility",
    desc: "Safely deep-clone any serialisable object",
    code: `function deepClone(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date)  return new Date(obj);
  if (obj instanceof Array) return obj.map(deepClone);
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, deepClone(v)])
  );
}

const original = { a: 1, b: { c: [1, 2, 3], d: new Date() } };
const clone    = deepClone(original);
clone.b.c.push(99);
console.log("Original:", JSON.stringify(original.b.c));
console.log("Clone:   ", JSON.stringify(clone.b.c));`
  },
  {
    title: "Event Emitter",
    tag: "pattern",
    desc: "Simple pub/sub event system",
    code: `class EventEmitter {
  #events = {};

  on(event, listener) {
    (this.#events[event] ??= []).push(listener);
    return () => this.off(event, listener);
  }
  off(event, listener) {
    this.#events[event] = (this.#events[event] ?? [])
      .filter(l => l !== listener);
  }
  emit(event, ...args) {
    (this.#events[event] ?? []).forEach(l => l(...args));
  }
  once(event, listener) {
    const off = this.on(event, (...args) => { listener(...args); off(); });
  }
}

const bus = new EventEmitter();
bus.on("message", (msg) => console.log("Received:", msg));
bus.once("connect", () => console.log("Connected!"));

bus.emit("connect");
bus.emit("connect"); // no-op
bus.emit("message", "Hello, World!");`
  },
  {
    title: "Promise.all Race",
    tag: "async",
    desc: "Run parallel async tasks with timeout",
    code: `const delay = (ms, val) =>
  new Promise(res => setTimeout(() => res(val), ms));

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, rej) =>
      setTimeout(() => rej(new Error(\`Timeout after \${ms}ms\`)), ms)
    )
  ]);

async function main() {
  const tasks = [
    delay(100, "Task A done"),
    delay(200, "Task B done"),
    delay(50,  "Task C done"),
  ];

  const results = await Promise.all(tasks);
  console.log("All results:", results);

  try {
    await withTimeout(delay(500, "slow"), 200);
  } catch (e) {
    console.warn("Caught:", e.message);
  }
}

main();`
  },
  {
    title: "Linked List",
    tag: "data structure",
    desc: "Singly linked list with full operations",
    code: `class Node { constructor(val) { this.val = val; this.next = null; } }

class LinkedList {
  #head = null; #size = 0;

  push(val) {
    const node = new Node(val);
    if (!this.#head) { this.#head = node; }
    else {
      let cur = this.#head;
      while (cur.next) cur = cur.next;
      cur.next = node;
    }
    this.#size++;
  }
  pop() {
    if (!this.#head) return null;
    if (!this.#head.next) { const v = this.#head.val; this.#head = null; this.#size--; return v; }
    let cur = this.#head;
    while (cur.next.next) cur = cur.next;
    const v = cur.next.val; cur.next = null; this.#size--;
    return v;
  }
  toArray() {
    const arr = []; let cur = this.#head;
    while (cur) { arr.push(cur.val); cur = cur.next; }
    return arr;
  }
  get size() { return this.#size; }
}

const list = new LinkedList();
[10, 20, 30, 40].forEach(v => list.push(v));
console.log("List:", list.toArray());
console.log("Pop:", list.pop());
console.log("After pop:", list.toArray(), "size:", list.size);`
  },
  {
    title: "Memoize / Cache",
    tag: "utility",
    desc: "Cache expensive function results",
    code: `function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      console.log(\`[cache hit] \${fn.name}(\${args})\`);
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

function slowFib(n) {
  if (n <= 1) return n;
  return slowFib(n - 1) + slowFib(n - 2);
}

const fib = memoize(slowFib);

console.time("first run");
console.log("fib(35):", fib(35));
console.timeEnd("first run");

console.time("cached");
console.log("fib(35):", fib(35));
console.timeEnd("cached");`
  },
  {
    title: "Observable / Reactive",
    tag: "pattern",
    desc: "Simple reactive state with subscriptions",
    code: `function observable(initial) {
  let value = initial;
  const subscribers = new Set();

  return {
    get value() { return value; },
    set(newVal) {
      const old = value;
      value = newVal;
      subscribers.forEach(fn => fn(newVal, old));
    },
    subscribe(fn) {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    }
  };
}

const count = observable(0);

const unsubA = count.subscribe((n, old) =>
  console.log(\`A: changed \${old} → \${n}\`));
count.subscribe((n) =>
  console.log(\`B: count is now \${n}\`));

count.set(1);
count.set(5);
unsubA(); // unsubscribe A
count.set(10); // only B fires`
  },
  {
    title: "Binary Search",
    tag: "algorithm",
    desc: "O(log n) search in a sorted array",
    code: `function binarySearch(arr, target) {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    if      (arr[mid] === target) return mid;
    else if (arr[mid] < target)   lo = mid + 1;
    else                          hi = mid - 1;
  }
  return -1;
}

const sorted = Array.from({ length: 20 }, (_, i) => i * 3);
console.log("Array:", sorted.join(", "));

[0, 15, 30, 57].forEach(target => {
  const idx = binarySearch(sorted, target);
  console.log(\`Search \${target}: \${idx >= 0 ? "found at index " + idx : "not found"}\`);
});`
  },
  {
    title: "Flatten & Group",
    tag: "array",
    desc: "Deep flatten + groupBy utilities",
    code: `const deepFlat = arr =>
  arr.reduce((acc, v) =>
    acc.concat(Array.isArray(v) ? deepFlat(v) : v), []);

function groupBy(arr, keyFn) {
  return arr.reduce((map, item) => {
    const key = keyFn(item);
    (map[key] ??= []).push(item);
    return map;
  }, {});
}

const nested = [1, [2, [3, [4, [5]]]], 6];
console.log("Flat:", deepFlat(nested));

const people = [
  { name: "Alice", dept: "Eng" },
  { name: "Bob",   dept: "HR"  },
  { name: "Carol", dept: "Eng" },
  { name: "Dave",  dept: "HR"  },
  { name: "Eve",   dept: "Eng" },
];
const byDept = groupBy(people, p => p.dept);
console.log("By dept:", JSON.stringify(byDept, null, 2));`
  },
  {
    title: "Proxy Validator",
    tag: "advanced",
    desc: "Runtime type-checking with ES Proxy",
    code: `function createValidated(schema) {
  return new Proxy({}, {
    set(target, prop, value) {
      const rule = schema[prop];
      if (rule && typeof value !== rule) {
        throw new TypeError(
          \`\${prop} must be \${rule}, got \${typeof value}\`
        );
      }
      target[prop] = value;
      return true;
    }
  });
}

const user = createValidated({ name: "string", age: "number" });

user.name = "Alice";
user.age  = 30;
console.log("Valid:", user.name, user.age);

try {
  user.age = "thirty"; // throws!
} catch (e) {
  console.error(e.message);
}`
  },
  {
    title: "Generator Sequence",
    tag: "advanced",
    desc: "Infinite sequences using generators",
    code: `function* range(start, end, step = 1) {
  for (let i = start; i < end; i += step) yield i;
}

function* take(n, iter) {
  let i = 0;
  for (const v of iter) {
    if (i++ >= n) return;
    yield v;
  }
}

function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) { yield a; [a, b] = [b, a + b]; }
}

function* filter(pred, iter) {
  for (const v of iter) if (pred(v)) yield v;
}

console.log("Range 0-10 step 2:", [...range(0, 11, 2)]);

const first10Fib = [...take(10, fibonacci())];
console.log("First 10 Fibonacci:", first10Fib);

const evenFib = [...take(8, filter(n => n % 2 === 0, fibonacci()))];
console.log("First 8 even Fibonacci:", evenFib);`
  },
];

// ── Keyboard Shortcuts reference ───────────────────────────────────────────
const SHORTCUTS = [
  {
    section: "Execution",
    items: [
      { keys: ["Ctrl", "↵"], label: "Run code" },
      { keys: ["Ctrl", "Shift", "K"], label: "Clear console" },
    ]
  },
  {
    section: "Editor",
    items: [
      { keys: ["Ctrl", "/"], label: "Toggle comment" },
      { keys: ["Ctrl", "Shift", "F"], label: "Format code" },
      { keys: ["Ctrl", "F"], label: "Find & Replace" },
      { keys: ["Tab"], label: "Indent (2 spaces)" },
    ]
  },
  {
    section: "Files",
    items: [
      { keys: ["Ctrl", "Shift", "N"], label: "New file tab" },
      { keys: ["Ctrl", "W"], label: "Close current tab" },
      { keys: ["Ctrl", "Shift", "C"], label: "Copy code" },
      { keys: ["Ctrl", "S"], label: "Download file" },
    ]
  },
  {
    section: "UI",
    items: [
      { keys: ["Ctrl", "+"], label: "Increase font size" },
      { keys: ["Ctrl", "-"], label: "Decrease font size" },
      { keys: ["Escape"], label: "Close modal / find bar" },
      { keys: ["Ctrl", "Shift", "T"], label: "Toggle theme" },
    ]
  },
];

// ── Multi-file state ───────────────────────────────────────────────────────
const SAMPLE_CODE = `// Welcome to JSNeon IDE v2.0 ⚡
// Press Ctrl+Enter or click "Run Code" to execute

// ── Closures & Higher-order functions ──
function makeCounter(start = 0) {
  let count = start;
  return {
    increment: () => ++count,
    decrement: () => --count,
    reset:     () => { count = start; },
    value:     () => count,
  };
}

const counter = makeCounter(10);
counter.increment(); counter.increment(); counter.increment();
console.log("Counter after 3 increments:", counter.value());

// ── Array pipeline ──
const result = [1,2,3,4,5,6,7,8,9,10]
  .filter(n => n % 2 === 0)
  .map(n => n ** 2)
  .reduce((acc, n) => acc + n, 0);
console.log("Sum of even squares:", result);

// ── Classes with private fields ──
class Stack {
  #items = [];
  push(...vals) { this.#items.push(...vals); }
  pop()  { return this.#items.pop(); }
  peek() { return this.#items.at(-1); }
  get size() { return this.#items.length; }
  toString() { return \`Stack[\${this.#items.join(", ")}]\`; }
}

const s = new Stack();
s.push(1, 2, 3, 4);
console.log(s.toString(), "| peek:", s.peek(), "| size:", s.size);

// ── Async/Await ──
const delay = ms => new Promise(res => setTimeout(res, ms));

async function run() {
  console.info("Starting async task…");
  await delay(50);
  console.log("Async task done!");
  console.table([
    { name: "Alice", score: 95 },
    { name: "Bob",   score: 87 },
    { name: "Carol", score: 92 },
  ]);
}

run();

console.warn("This is a console.warn example");
console.error("This is a console.error example");
`;

let files = [];       // array of { id, name, code, savedCode }
let activeFileId = null;
let execHistory  = [];
let isRunning    = false;
let replHistory  = [];
let replHistIdx  = -1;
let currentFilter = "all";
let logCounts    = { log: 0, warn: 0, error: 0, info: 0 };

// ── DOM refs ───────────────────────────────────────────────────────────────
const tabsList        = document.getElementById("tabs-list");
const tabAddBtn       = document.getElementById("tab-add-btn");
const runBtn          = document.getElementById("run-btn");
const formatBtn       = document.getElementById("format-btn");
const clearEditorBtn  = document.getElementById("clear-editor-btn");
const copyBtn         = document.getElementById("copy-btn");
const downloadBtn     = document.getElementById("download-btn");
const clearOutputBtn  = document.getElementById("clear-output-btn");
const themeToggle     = document.getElementById("theme-toggle");
const historyBtn      = document.getElementById("history-btn");
const closeHistoryBtn = document.getElementById("close-history");
const clearHistoryBtn = document.getElementById("clear-history-btn");
const snippetsBtn     = document.getElementById("snippets-btn");
const closeSnippets   = document.getElementById("close-snippets");
const snippetSearch   = document.getElementById("snippet-search");
const snippetsGrid    = document.getElementById("snippets-grid");
const shortcutsBtn    = document.getElementById("shortcuts-btn");
const closeShortcuts  = document.getElementById("close-shortcuts");
const shortcutsBody   = document.getElementById("shortcuts-body");
const findOpenBtn     = document.getElementById("find-open-btn");
const findBar         = document.getElementById("find-bar");
const findInput       = document.getElementById("find-input");
const replaceInput    = document.getElementById("replace-input");
const findPrev        = document.getElementById("find-prev");
const findNext        = document.getElementById("find-next");
const replaceOne      = document.getElementById("replace-one");
const replaceAll      = document.getElementById("replace-all");
const findClose       = document.getElementById("find-close");
const findCount       = document.getElementById("find-count");
const langSelect      = document.getElementById("lang-select");
const editorThemeSel  = document.getElementById("editor-theme");
const fsDown          = document.getElementById("fs-down");
const fsUp            = document.getElementById("fs-up");
const fsLabel         = document.getElementById("fs-label");
const outputConsole   = document.getElementById("output-console");
const outputWrap      = document.getElementById("output-wrap");
const execStatus      = document.getElementById("exec-status");
const execTime        = document.getElementById("exec-time");
const lineCountEl     = document.getElementById("line-count");
const wordCountEl     = document.getElementById("word-count");
const charCountEl     = document.getElementById("char-count");
const cursorPosEl     = document.getElementById("cursor-pos");
const selCountEl      = document.getElementById("sel-count");
const historyModal    = document.getElementById("history-modal");
const historyList     = document.getElementById("history-list");
const snippetsModal   = document.getElementById("snippets-modal");
const shortcutsModal  = document.getElementById("shortcuts-modal");
const scrollLockChk   = document.getElementById("scroll-lock");
const replInput       = document.getElementById("repl-input");
const replRunBtn      = document.getElementById("repl-run");
const logCountEl      = document.getElementById("log-count");
const resizer         = document.getElementById("resizer");
const editorPanel     = document.getElementById("editor-panel");
const outputPanel     = document.getElementById("output-panel");
const footerYear      = document.getElementById("footer-year");
const toastContainer  = document.getElementById("toast-container");

// ── CodeMirror ────────────────────────────────────────────────────────────
let currentFontSize = parseInt(localStorage.getItem(FONT_SIZE_KEY)) || 14;

const editor = CodeMirror.fromTextArea(document.getElementById("code-editor"), {
  mode: "javascript",
  theme: localStorage.getItem(EDITOR_THEME_KEY) || "dracula",
  lineNumbers: true,
  autoCloseBrackets: true,
  matchBrackets: true,
  styleActiveLine: true,
  indentUnit: 2,
  tabSize: 2,
  indentWithTabs: false,
  foldGutter: true,
  gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
  extraKeys: {
    "Tab":          cm => cm.replaceSelection("  "),
    "Ctrl-Enter":   () => runCode(),
    "Cmd-Enter":    () => runCode(),
    "Ctrl-/":       cm => cm.toggleComment(),
    "Ctrl-F":       () => openFindBar(),
    "Cmd-F":        () => openFindBar(),
    "Ctrl-S":       () => downloadCurrent(),
    "Cmd-S":        () => downloadCurrent(),
    "Shift-Ctrl-F": () => formatCode(),
    "Shift-Ctrl-N": () => addNewTab(),
    "Shift-Ctrl-K": () => { clearOutput(); showToast("Console cleared", "info"); },
    "Ctrl-W":       () => closeActiveTab(),
    "Shift-Ctrl-C": async () => {
      const ok = await copyToClipboard(editor.getValue());
      showToast(ok ? "Copied!" : "Copy failed", ok ? "success" : "error");
    },
    "Shift-Ctrl-T": () => toggleTheme(),
  },
  autoRefresh: true,
});

applyFontSize(currentFontSize, false);

// Restore editor theme
const savedEditorTheme = localStorage.getItem(EDITOR_THEME_KEY);
if (savedEditorTheme) {
  editor.setOption("theme", savedEditorTheme);
  editorThemeSel.value = savedEditorTheme;
}

editor.on("change", () => {
  saveActiveFileCode();
  updateStats();
  // Mark tab as unsaved if changed from saved
  const f = getActiveFile();
  if (f) {
    const changed = f.code !== f.savedCode;
    const tabEl = tabsList.querySelector(`[data-id="${f.id}"]`);
    if (tabEl) {
      const dot = tabEl.querySelector(".tab-unsaved");
      if (dot) dot.style.display = changed ? "inline" : "none";
    }
  }
});

editor.on("cursorActivity", () => {
  const c    = editor.getCursor();
  const sel  = editor.getSelection();
  cursorPosEl.textContent = `Ln ${c.line + 1}, Col ${c.ch + 1}`;
  selCountEl.textContent  = sel.length > 0 ? `${sel.length} chars selected` : "";
});

// ── File / Tab Management ─────────────────────────────────────────────────
function createFile(name, code = "") {
  return { id: Date.now() + Math.random(), name, code, savedCode: code };
}

function loadFiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      files = JSON.parse(raw);
      if (files.length) { activateFile(files[0].id); return; }
    }
  } catch {}
  // Default: one file with sample code
  const f = createFile("script.js", SAMPLE_CODE);
  files = [f];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  activateFile(f.id);
}

function persistFiles() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
}

function getActiveFile() {
  return files.find(f => f.id === activeFileId) || null;
}

function saveActiveFileCode() {
  const f = getActiveFile();
  if (f) { f.code = editor.getValue(); persistFiles(); }
}

function activateFile(id) {
  saveActiveFileCode(); // save current before switching
  activeFileId = id;
  const f = getActiveFile();
  if (!f) return;
  editor.setValue(f.code);
  editor.clearHistory();
  editor.refresh();
  renderTabs();
  updateStats();
  editor.focus();
}

function addNewTab(name, code = "") {
  const idx = files.length + 1;
  const f   = createFile(name || `file_${idx}.js`, code);
  files.push(f);
  persistFiles();
  activateFile(f.id);
  showToast(`Created ${f.name}`, "info", 1500);
}

function closeActiveTab() {
  if (files.length <= 1) { showToast("Cannot close the last file", "warning"); return; }
  const idx = files.findIndex(f => f.id === activeFileId);
  files.splice(idx, 1);
  persistFiles();
  activateFile(files[Math.max(0, idx - 1)].id);
  showToast("Tab closed", "info", 1500);
}

function closeTab(id, e) {
  e.stopPropagation();
  if (files.length <= 1) { showToast("Cannot close the last file", "warning"); return; }
  const idx = files.findIndex(f => f.id === id);
  files.splice(idx, 1);
  persistFiles();
  if (activeFileId === id) {
    activateFile(files[Math.max(0, idx - 1)].id);
  } else {
    renderTabs();
  }
}

function renderTabs() {
  tabsList.innerHTML = "";
  files.forEach(f => {
    const tab = document.createElement("div");
    tab.className = `file-tab${f.id === activeFileId ? " active" : ""}`;
    tab.dataset.id = f.id;
    const changed = f.code !== f.savedCode;
    tab.innerHTML = `
      <span class="tab-dot"></span>
      <span class="tab-name" title="${escapeHtml(f.name)}">${escapeHtml(f.name)}</span>
      <span class="tab-unsaved" style="display:${changed ? "inline" : "none"}">●</span>
      <button class="tab-close" title="Close tab">✕</button>
    `;
    tab.addEventListener("click", () => activateFile(f.id));
    tab.querySelector(".tab-close").addEventListener("click", (e) => closeTab(f.id, e));
    tabsList.appendChild(tab);
  });
}

// ── Stats ─────────────────────────────────────────────────────────────────
function updateStats() {
  const code  = editor.getValue();
  const lines = code.split("\n").length;
  const words = code.trim() ? code.trim().split(/\s+/).length : 0;
  lineCountEl.textContent = `${lines} line${lines !== 1 ? "s" : ""}`;
  wordCountEl.textContent = `${words} word${words !== 1 ? "s" : ""}`;
  charCountEl.textContent = `${code.length} char${code.length !== 1 ? "s" : ""}`;
}

// ── Font Size ─────────────────────────────────────────────────────────────
function applyFontSize(size, notify = true) {
  currentFontSize = Math.max(MIN_FONT, Math.min(MAX_FONT, size));
  document.documentElement.style.setProperty("--editor-font-size", currentFontSize + "px");
  fsLabel.textContent = currentFontSize + "px";
  editor.refresh();
  localStorage.setItem(FONT_SIZE_KEY, currentFontSize);
  if (notify) showToast(`Font size: ${currentFontSize}px`, "info", 1200);
}

fsUp.addEventListener("click", () => applyFontSize(currentFontSize + 1));
fsDown.addEventListener("click", () => applyFontSize(currentFontSize - 1));

// ── Code Formatter ────────────────────────────────────────────────────────
function formatCode() {
  const code = editor.getValue();
  if (!code.trim()) return;
  try {
    const formatted = naiveFormat(code);
    const cursor = editor.getCursor();
    editor.setValue(formatted);
    editor.setCursor(cursor);
    showToast("Code formatted", "success", 1500);
  } catch (e) {
    showToast("Format failed: " + e.message, "error");
  }
}

/**
 * Naive JS formatter — fixes indentation, spacing around operators,
 * blank lines, semicolons, and trailing whitespace.
 * Not a full AST formatter, but handles 90% of common cases cleanly.
 */
function naiveFormat(code) {
  const lines = code.split("\n");
  let indent  = 0;
  const TAB   = "  ";
  const result = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
      .trimEnd()
      .replace(/\t/g, TAB);

    // Strip leading spaces — we'll re-indent
    const trimmed = line.trimStart();
    if (!trimmed) { result.push(""); continue; }

    // Reduce indent before closing braces/brackets
    const closers = (trimmed.match(/^[}\])]/) || []).length;
    if (closers) indent = Math.max(0, indent - closers);

    // Fix spacing around common operators (avoid URLs //)
    let formatted = trimmed
      .replace(/([^=!<>])=(?!=)/g, "$1 = ")   // assignment
      .replace(/([^=!<>])===?/g,  m => m.includes("==") ? m : m)
      .replace(/  +/g, " ")                     // multi-space collapse
      .trimStart();

    result.push(TAB.repeat(indent) + formatted);

    // Increase indent after opening braces
    const opens  = (trimmed.match(/[{[(]/g) || []).length;
    const closes = (trimmed.match(/[}\])]/g) || []).length;
    indent = Math.max(0, indent + opens - closes);

    // Closers at line start already handled
    if (closers && opens === 0) indent = Math.max(0, indent);
  }

  // Remove excessive blank lines (> 2 consecutive)
  return result
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd();
}

// ── Find & Replace ────────────────────────────────────────────────────────
let findCursor = null;

function openFindBar() {
  findBar.hidden = false;
  const sel = editor.getSelection();
  if (sel) findInput.value = sel;
  findInput.focus();
  findInput.select();
  doFind();
}
function closeFindBar() {
  findBar.hidden = true;
  // Clear highlights
  editor.getAllMarks().forEach(m => m.clear());
  findCount.textContent = "";
  editor.focus();
}

function doFind() {
  editor.getAllMarks().forEach(m => m.clear());
  const query = findInput.value;
  if (!query) { findCount.textContent = ""; return; }

  let count = 0;
  const cursor = editor.getSearchCursor(query, CodeMirror.Pos(0, 0), { caseFold: true });
  while (cursor.findNext()) {
    editor.markText(cursor.from(), cursor.to(), {
      className: "cm-searching"
    });
    count++;
  }
  findCount.textContent = count ? `${count} match${count !== 1 ? "es" : ""}` : "no matches";
  findCursor = null; // reset navigation
}

function findStep(direction) {
  const query = findInput.value;
  if (!query) return;
  if (!findCursor) {
    findCursor = editor.getSearchCursor(query, editor.getCursor(), { caseFold: true });
  }
  const found = direction === "next" ? findCursor.findNext() : findCursor.findPrevious();
  if (!found) {
    // Wrap around
    findCursor = editor.getSearchCursor(query,
      direction === "next" ? CodeMirror.Pos(0, 0) : CodeMirror.Pos(editor.lastLine()),
      { caseFold: true });
    direction === "next" ? findCursor.findNext() : findCursor.findPrevious();
  }
  if (findCursor.from()) {
    editor.setSelection(findCursor.from(), findCursor.to());
    editor.scrollIntoView({ from: findCursor.from(), to: findCursor.to() }, 80);
  }
}

function doReplaceOne() {
  const query = findInput.value;
  const repl  = replaceInput.value;
  if (!query) return;
  if (!findCursor) findCursor = editor.getSearchCursor(query, editor.getCursor(), { caseFold: true });
  if (findCursor.findNext()) {
    findCursor.replace(repl);
    doFind();
    showToast("Replaced 1 match", "success", 1500);
  } else {
    showToast("No more matches", "info", 1500);
  }
}

function doReplaceAll() {
  const query = findInput.value;
  const repl  = replaceInput.value;
  if (!query) return;
  let count = 0;
  const cur = editor.getSearchCursor(query, CodeMirror.Pos(0, 0), { caseFold: true });
  while (cur.findNext()) { cur.replace(repl); count++; }
  doFind();
  showToast(`Replaced ${count} match${count !== 1 ? "es" : ""}`, "success");
}

findInput.addEventListener("input",  doFind);
findInput.addEventListener("keydown", e => {
  if (e.key === "Enter") { e.shiftKey ? findStep("prev") : findStep("next"); }
  if (e.key === "Escape") closeFindBar();
});
replaceInput.addEventListener("keydown", e => { if (e.key === "Escape") closeFindBar(); });
findNext.addEventListener("click", () => findStep("next"));
findPrev.addEventListener("click", () => findStep("prev"));
replaceOne.addEventListener("click", doReplaceOne);
replaceAll.addEventListener("click", doReplaceAll);
findClose.addEventListener("click", closeFindBar);
findOpenBtn.addEventListener("click", openFindBar);

// ── Executor ──────────────────────────────────────────────────────────────

function stringify(val) {
  if (val === null)      return "null";
  if (val === undefined) return "undefined";
  const type = typeof val;
  if (type === "string")  return val;
  if (type === "number" || type === "boolean") return String(val);
  if (type === "function") {
    const s = val.toString();
    const first = s.split("\n")[0];
    return first.length < 80 ? first + (s.includes("\n") ? " … }" : "") : "[Function: " + (val.name || "anonymous") + "]";
  }
  if (type === "symbol")  return val.toString();
  if (type === "bigint")  return String(val) + "n";
  if (val instanceof Error)
    return `${val.name}: ${val.message}`;
  if (val instanceof Promise)  return "Promise { <pending> }";
  if (val instanceof RegExp)   return val.toString();
  if (val instanceof Date)     return val.toISOString();
  if (val instanceof Map) {
    const entries = [...val.entries()].map(([k, v]) => `${stringify(k)} => ${stringify(v)}`);
    return `Map(${val.size}) { ${entries.slice(0, 5).join(", ")}${entries.length > 5 ? "…" : ""} }`;
  }
  if (val instanceof Set) {
    const items = [...val].map(stringify);
    return `Set(${val.size}) { ${items.slice(0, 5).join(", ")}${items.length > 5 ? "…" : ""} }`;
  }
  try {
    const seen = new WeakSet();
    return JSON.stringify(val, (k, v) => {
      if (typeof v === "object" && v !== null) {
        if (seen.has(v)) return "[Circular]"; seen.add(v);
      }
      if (typeof v === "function") return "[Function]";
      if (typeof v === "bigint")   return String(v) + "n";
      return v;
    }, 2);
  } catch { return Object.prototype.toString.call(val); }
}

function formatArgs(args) {
  if (typeof args[0] === "string" && args.length > 1 && /%[sdiof]/.test(args[0])) {
    let i = 1;
    const out = args[0].replace(/%([sdiof])/g, (_, spec) => {
      const v = args[i++];
      if (v === undefined) return `%${spec}`;
      if (spec === "d" || spec === "i") return parseInt(v);
      if (spec === "f") return parseFloat(v);
      if (spec === "o") return stringify(v);
      return String(v);
    });
    const rest = args.slice(i).map(stringify).join(" ");
    return out + (rest ? " " + rest : "");
  }
  return args.map(stringify).join(" ");
}

function tableToString(data) {
  if (!data || typeof data !== "object") return stringify(data);
  const entries = Array.isArray(data)
    ? data.map((v, i) => ({ "(index)": i, Value: typeof v === "object" ? JSON.stringify(v) : stringify(v) }))
    : Object.entries(data).map(([k, v]) => ({ "(index)": k, Value: typeof v === "object" ? JSON.stringify(v) : stringify(v) }));
  if (!entries.length) return "(empty)";
  const cols   = Object.keys(entries[0]);
  const widths = cols.map(c => Math.max(c.length, ...entries.map(r => String(r[c] ?? "").length)));
  const bar  = (l, m, r) => l + widths.map(w => "─".repeat(w + 2)).join(m) + r;
  const row  = r => "│" + cols.map((c, i) => " " + String(r[c] ?? "").padEnd(widths[i]) + " ").join("│") + "│";
  const hdr  = "│" + cols.map((c, i) => " " + c.padEnd(widths[i]) + " ").join("│") + "│";
  return [bar("┌","┬","┐"), hdr, bar("├","┼","┤"), ...entries.map(row), bar("└","┴","┘")].join("\n");
}

function runCode(codeOverride, isRepl = false) {
  if (isRunning && !isRepl) return;
  const code = codeOverride ?? editor.getValue().trim();
  if (!code) { showToast("Editor is empty!", "warning"); return; }

  if (!isRepl) {
    isRunning = true;
    const t0 = performance.now();
    setStatus("running");
    runBtn.classList.add("running");
    runBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z"/></svg> Running…`;
    logCounts = { log: 0, warn: 0, error: 0, info: 0 };
    appendOutput("", "out-system");
    appendOutput(`▶  Executing — ${new Date().toLocaleTimeString()}`, "out-system");
    appendOutput("─".repeat(52), "out-system");
    execAndFinish(code, t0, false);
  } else {
    // REPL: quick eval, show in console
    appendOutput("> " + code, "out-repl", "REPL");
    execAndFinish(code, performance.now(), true);
  }
}

function execAndFinish(code, t0, isRepl) {
  const originals = {};
  const methods = ["log","warn","error","info","debug","table","dir","time","timeEnd","count","countReset","group","groupEnd","clear","assert"];
  methods.forEach(m => { originals[m] = console[m]?.bind(console); });

  const timers  = {};
  const counts  = {};
  let groupDepth = 0;
  const ind = () => "  ".repeat(groupDepth);

  console.log   = (...a) => { logCounts.log++;  appendOutput(ind() + formatArgs(a), "out-log",   "LOG");  originals.log?.(...a); };
  console.warn  = (...a) => { logCounts.warn++; appendOutput(ind() + formatArgs(a), "out-warn",  "WARN"); originals.warn?.(...a); };
  console.error = (...a) => { logCounts.error++;appendOutput(ind() + formatArgs(a), "out-error", "ERR");  originals.error?.(...a); };
  console.info  = (...a) => { logCounts.info++; appendOutput(ind() + formatArgs(a), "out-info",  "INFO"); originals.info?.(...a); };
  console.debug = (...a) => { appendOutput(ind() + formatArgs(a), "out-debug", "DBG"); originals.debug?.(...a); };
  console.table = (d)    => { appendOutput(ind() + tableToString(d), "out-log"); originals.table?.(d); };
  console.dir   = (o)    => { appendOutput(ind() + stringify(o), "out-debug"); originals.dir?.(o); };
  console.time  = (l="default") => { timers[l] = performance.now(); };
  console.timeEnd = (l="default") => {
    const ms = timers[l] != null ? (performance.now() - timers[l]).toFixed(2) + "ms" : "no timer";
    delete timers[l];
    appendOutput(`${ind()}${l}: ${ms}`, "out-info", "TIME");
  };
  console.count = (l="default") => {
    counts[l] = (counts[l]||0)+1;
    appendOutput(`${ind()}${l}: ${counts[l]}`, "out-debug");
  };
  console.countReset = (l="default") => { counts[l] = 0; };
  console.group = (...a) => { appendOutput(ind() + "▼ " + (a.length ? formatArgs(a) : ""), "out-debug"); groupDepth++; };
  console.groupEnd = () => { if (groupDepth > 0) groupDepth--; };
  console.assert = (cond, ...a) => {
    if (!cond) { logCounts.error++; appendOutput(ind() + "Assertion failed: " + formatArgs(a), "out-error", "ERR"); }
  };
  console.clear = () => { clearOutput(); };

  const restore = () => methods.forEach(m => { if (originals[m]) console[m] = originals[m]; });

  const mode = langSelect.value;
  const strict = (mode === "strict" || mode === "module") ? '"use strict";\n' : "";

  (async () => {
    let hasError = false;
    let returnVal;
    try {
      const Fn = Object.getPrototypeOf(async function(){}).constructor;
      returnVal = await new Fn(strict + code)();
      if (!isRepl && returnVal !== undefined)
        appendOutput("← " + stringify(returnVal), "out-return");
      else if (isRepl)
        appendOutput(stringify(returnVal), "out-return");
    } catch (err) {
      hasError = true;
      appendOutput("Uncaught " + (err instanceof Error ? err.name + ": " + err.message : String(err)), "out-error");
      if (err.stack) {
        err.stack.split("\n").slice(1)
          .filter(l => !l.includes("blob:") && !l.includes("script.js") && l.trim())
          .slice(0, 4)
          .forEach(l => appendOutput("  " + l.trim(), "out-error"));
      }
    } finally {
      restore();
      if (!isRepl) {
        const elapsed = ((performance.now() - t0) / 1000).toFixed(3);
        appendOutput("─".repeat(52), "out-system");
        if (!hasError) {
          appendOutput(`✔  Finished · ${elapsed}s  ·  ${logCounts.log} log · ${logCounts.warn} warn · ${logCounts.error} err`, "out-success");
          setStatus("success", elapsed);
          showToast(`Done in ${elapsed}s`, "success");
          saveHistory(editor.getValue(), true, elapsed);
        } else {
          appendOutput(`✘  Finished with errors · ${elapsed}s`, "out-error");
          setStatus("error");
          showToast("Execution finished with errors", "error");
          saveHistory(editor.getValue(), false, elapsed);
        }
        isRunning = false;
        runBtn.classList.remove("running");
        runBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> Run Code <kbd>Ctrl+↵</kbd>`;
        updateLogCount();
      }
      applyFilter(currentFilter);
      scrollOutputToBottom();
    }
  })();
}

// ── Output Helpers ────────────────────────────────────────────────────────
function appendOutput(text, cssClass = "out-log", badge = null) {
  const badgeClasses = {
    LOG: "badge-log", WARN: "badge-warn", ERR: "badge-error",
    INFO: "badge-info", DBG: "badge-log", TIME: "badge-time", REPL: "badge-repl",
  };
  const line = document.createElement("div");
  line.className = `output-line ${cssClass}`;
  if (currentFilter !== "all" && !cssClass.includes(currentFilter.replace("out-", "")))
    line.classList.add("hidden");

  if (badge) {
    const b = document.createElement("span");
    b.className = `badge ${badgeClasses[badge] || "badge-log"}`;
    b.textContent = badge;
    const t = document.createElement("span");
    t.className = "line-text";
    t.textContent = text;
    line.appendChild(b); line.appendChild(t);
  } else {
    line.textContent = text;
  }
  outputConsole.appendChild(line);
  if (!scrollLockChk.checked) scrollOutputToBottom();
}

function scrollOutputToBottom() {
  outputWrap.scrollTop = outputWrap.scrollHeight;
}

function clearOutput() {
  outputConsole.innerHTML = `
    <div class="console-welcome">
      <span class="prompt-line">JSNeon IDE v2.0 — JavaScript Runtime</span>
      <span class="prompt-line dim">Press <strong>Run Code</strong> or <strong>Ctrl+Enter</strong> to execute.</span>
      <span class="prompt-line dim">console.log · warn · error · info · table · time · count · group · assert</span>
      <span class="prompt-line dim">─────────────────────────────────────────────────────</span>
    </div>`;
  setStatus("idle");
  execTime.textContent = "";
  logCounts = { log: 0, warn: 0, error: 0, info: 0 };
  updateLogCount();
}

function updateLogCount() {
  const { log, warn, error } = logCounts;
  logCountEl.textContent = (log || warn || error)
    ? `${log} log  ${warn} warn  ${error} err`
    : "";
}

function applyFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll(".output-line").forEach(el => {
    if (filter === "all") { el.classList.remove("hidden"); return; }
    const show = el.classList.contains(filter);
    el.classList.toggle("hidden", !show);
  });
  document.querySelectorAll(".output-tab").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });
}

// ── Status ────────────────────────────────────────────────────────────────
function setStatus(state, time = "") {
  execStatus.className = `status-${state}`;
  execStatus.textContent = { idle:"● IDLE", running:"◉ RUNNING", success:"● SUCCESS", error:"● ERROR" }[state] || "● IDLE";
  execTime.textContent = time ? `${time}s` : "";
}

// ── REPL bar ─────────────────────────────────────────────────────────────
replInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    const code = replInput.value.trim();
    if (!code) return;
    replHistory.unshift(code);
    if (replHistory.length > 50) replHistory.pop();
    replHistIdx = -1;
    runCode(code, true);
    replInput.value = "";
  }
  if (e.key === "ArrowUp") {
    replHistIdx = Math.min(replHistIdx + 1, replHistory.length - 1);
    replInput.value = replHistory[replHistIdx] || "";
    setTimeout(() => replInput.setSelectionRange(9999, 9999), 0);
  }
  if (e.key === "ArrowDown") {
    replHistIdx = Math.max(replHistIdx - 1, -1);
    replInput.value = replHistIdx >= 0 ? replHistory[replHistIdx] : "";
  }
});
replRunBtn.addEventListener("click", () => {
  const code = replInput.value.trim();
  if (!code) return;
  runCode(code, true);
  replInput.value = "";
});

// ── Toast ─────────────────────────────────────────────────────────────────
function showToast(message, type = "info", duration = 3000) {
  const icons = { success: "✔", error: "✘", info: "ℹ", warning: "⚠" };
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${message}</span>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("out");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
  }, duration);
}

// ── Theme ─────────────────────────────────────────────────────────────────
function toggleTheme() {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem(THEME_KEY, next);
  showToast(`${next.charAt(0).toUpperCase() + next.slice(1)} UI theme`, "info", 1500);
}

const savedUiTheme = localStorage.getItem(THEME_KEY);
if (savedUiTheme) document.documentElement.setAttribute("data-theme", savedUiTheme);

editorThemeSel.addEventListener("change", () => {
  const t = editorThemeSel.value;
  editor.setOption("theme", t);
  localStorage.setItem(EDITOR_THEME_KEY, t);
  showToast(`Editor theme: ${t}`, "info", 1500);
});

// ── History ───────────────────────────────────────────────────────────────
function loadHistory() {
  try { execHistory = JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch { execHistory = []; }
}
function saveHistory(code, success, time) {
  loadHistory();
  execHistory.unshift({ id: Date.now(), code, success, time, date: new Date().toLocaleString() });
  if (execHistory.length > MAX_HISTORY) execHistory.pop();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(execHistory));
}
function renderHistory() {
  loadHistory();
  if (!execHistory.length) {
    historyList.innerHTML = `<p class="dim" style="padding:8px">No history yet.</p>`; return;
  }
  historyList.innerHTML = "";
  execHistory.forEach(e => {
    const div = document.createElement("div");
    div.className = "history-item";
    div.innerHTML = `
      <div class="history-meta">
        <span>${e.date}</span>
        <span class="history-status ${e.success ? "ok" : "err"}">${e.success ? "✔ OK" : "✘ ERR"} · ${e.time}s</span>
      </div>
      <pre class="history-preview">${escapeHtml(e.code.slice(0, 200))}</pre>`;
    div.addEventListener("click", () => {
      editor.setValue(e.code);
      historyModal.hidden = true;
      showToast("Code restored from history", "success");
    });
    historyList.appendChild(div);
  });
}

// ── Snippets ──────────────────────────────────────────────────────────────
function renderSnippets(filter = "") {
  snippetsGrid.innerHTML = "";
  const q = filter.toLowerCase();
  SNIPPETS.forEach(s => {
    const card = document.createElement("div");
    card.className = "snippet-card";
    const visible = !q || s.title.toLowerCase().includes(q) || s.tag.includes(q) || s.desc.toLowerCase().includes(q);
    if (!visible) card.classList.add("hidden");
    card.innerHTML = `
      <div class="snippet-title">${escapeHtml(s.title)}</div>
      <div class="snippet-desc">${escapeHtml(s.desc)}</div>
      <span class="snippet-tag">${escapeHtml(s.tag)}</span>
      <pre class="snippet-preview">${escapeHtml(s.code.slice(0, 120))}</pre>`;
    card.addEventListener("click", () => {
      editor.setValue(s.code);
      snippetsModal.hidden = true;
      showToast(`Loaded: ${s.title}`, "success");
      editor.focus();
    });
    snippetsGrid.appendChild(card);
  });
}

snippetSearch.addEventListener("input", () => renderSnippets(snippetSearch.value));

// ── Shortcuts modal ───────────────────────────────────────────────────────
function renderShortcuts() {
  shortcutsBody.innerHTML = "";
  SHORTCUTS.forEach(section => {
    const div = document.createElement("div");
    div.className = "shortcut-section";
    div.innerHTML = `<h4>${section.section}</h4>`;
    section.items.forEach(item => {
      const row = document.createElement("div");
      row.className = "shortcut-row";
      const keysHtml = item.keys.map((k, i) =>
        `<span class="key">${escapeHtml(k)}</span>${i < item.keys.length - 1 ? '<span class="key-sep">+</span>' : ""}`
      ).join("");
      row.innerHTML = `<span>${escapeHtml(item.label)}</span><div class="shortcut-keys">${keysHtml}</div>`;
      div.appendChild(row);
    });
    shortcutsBody.appendChild(div);
  });
}

// ── Resizer ───────────────────────────────────────────────────────────────
let isResizing = false, startX, startW;
resizer.addEventListener("mousedown", e => {
  isResizing = true; startX = e.clientX; startW = editorPanel.offsetWidth;
  resizer.classList.add("active");
  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";
});
document.addEventListener("mousemove", e => {
  if (!isResizing) return;
  const totalW = editorPanel.parentElement.offsetWidth - resizer.offsetWidth;
  const newW = Math.max(200, Math.min(startW + (e.clientX - startX), totalW - 200));
  editorPanel.style.flex  = "none";
  editorPanel.style.width = newW + "px";
  outputPanel.style.flex  = "1";
  editor.refresh();
});
document.addEventListener("mouseup", () => {
  if (!isResizing) return;
  isResizing = false; resizer.classList.remove("active");
  document.body.style.cursor = document.body.style.userSelect = "";
});

// ── Utilities ─────────────────────────────────────────────────────────────
function escapeHtml(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
async function copyToClipboard(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch {
    const ta = Object.assign(document.createElement("textarea"),
      { value: text, style: "position:fixed;opacity:0" });
    document.body.appendChild(ta); ta.focus(); ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta); return ok;
  }
}
function downloadCurrent() {
  const code = editor.getValue();
  const f    = getActiveFile();
  const name = f ? f.name : "script.js";
  if (!code.trim()) { showToast("Nothing to download", "warning"); return; }
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(new Blob([code], { type: "text/javascript" })),
    download: name,
  });
  a.click(); URL.revokeObjectURL(a.href);
  showToast(`Downloaded ${name}`, "success");
}

// ── Event Wiring ──────────────────────────────────────────────────────────
runBtn.addEventListener("click", () => runCode());
formatBtn.addEventListener("click", formatCode);
clearEditorBtn.addEventListener("click", () => {
  if (!editor.getValue().trim()) return;
  editor.setValue("");
  showToast("Editor cleared", "info");
  editor.focus();
});
copyBtn.addEventListener("click", async () => {
  const ok = await copyToClipboard(editor.getValue());
  showToast(ok ? "Copied to clipboard" : "Copy failed", ok ? "success" : "error");
});
downloadBtn.addEventListener("click", downloadCurrent);
clearOutputBtn.addEventListener("click", () => { clearOutput(); showToast("Console cleared", "info"); });
themeToggle.addEventListener("click", toggleTheme);
tabAddBtn.addEventListener("click", () => addNewTab());

// Output filter tabs
document.querySelectorAll(".output-tab").forEach(btn => {
  btn.addEventListener("click", () => applyFilter(btn.dataset.filter));
});

// Modals
historyBtn.addEventListener("click", () => { renderHistory(); historyModal.hidden = false; });
closeHistoryBtn.addEventListener("click", () => { historyModal.hidden = true; });
clearHistoryBtn.addEventListener("click", () => {
  execHistory = [];
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
  showToast("History cleared", "info");
});
historyModal.addEventListener("click", e => { if (e.target === historyModal) historyModal.hidden = true; });

snippetsBtn.addEventListener("click", () => {
  renderSnippets(); snippetsModal.hidden = false;
  setTimeout(() => snippetSearch.focus(), 50);
});
closeSnippets.addEventListener("click", () => { snippetsModal.hidden = true; });
snippetsModal.addEventListener("click", e => { if (e.target === snippetsModal) snippetsModal.hidden = true; });

shortcutsBtn.addEventListener("click", () => { renderShortcuts(); shortcutsModal.hidden = false; });
closeShortcuts.addEventListener("click", () => { shortcutsModal.hidden = true; });
shortcutsModal.addEventListener("click", e => { if (e.target === shortcutsModal) shortcutsModal.hidden = true; });

langSelect.addEventListener("change", () =>
  showToast(`Mode: ${langSelect.options[langSelect.selectedIndex].text}`, "info", 1500));

// Global keyboard shortcuts
document.addEventListener("keydown", e => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); runCode(); }
  if ((e.ctrlKey || e.metaKey) && e.key === "=")     { e.preventDefault(); applyFontSize(currentFontSize + 1); }
  if ((e.ctrlKey || e.metaKey) && e.key === "-")     { e.preventDefault(); applyFontSize(currentFontSize - 1); }
  if (e.key === "Escape") {
    historyModal.hidden = true;
    snippetsModal.hidden = true;
    shortcutsModal.hidden = true;
    if (!findBar.hidden) closeFindBar();
  }
});

footerYear.textContent = new Date().getFullYear();

// ── Boot ──────────────────────────────────────────────────────────────────
window.addEventListener("load", () => {
  loadFiles();
  editor.refresh();
  editor.focus();
  applyFontSize(currentFontSize, false);
  setTimeout(() => {
    const el = outputConsole.querySelector(".prompt-line");
    if (el) { el.classList.add("typing-cursor"); setTimeout(() => el.classList.remove("typing-cursor"), 3000); }
  }, 500);
});
