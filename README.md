# ⚡ JSNeon IDE — JavaScript Compiler & Runtime Environment

> A fully in-browser JavaScript compiler and interactive development environment built with **pure HTML, CSS, and JavaScript** — no frameworks, no build tools, no server required.

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![CodeMirror](https://img.shields.io/badge/CodeMirror-D30707?style=for-the-badge&logo=codemirror&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Getting Started](#-getting-started)
- [File Structure](#-file-structure)
- [Keyboard Shortcuts](#-keyboard-shortcuts)
- [Built-in Snippets](#-built-in-snippets)
- [Tech Stack](#-tech-stack)
- [Browser Support](#-browser-support)
- [License](#-license)

---

## 🧠 Overview

**JSNeon IDE** is a zero-dependency, client-side JavaScript IDE that runs entirely in your browser. Open `index.html` and start coding — no installation, no internet connection required after first load.

It uses the browser's native `AsyncFunction` constructor as its execution engine, meaning your code runs at full speed with top-level `await` support, instant startup, and no rate limits.

---

## ✨ Features

### 🖊️ Editor
- **CodeMirror 5** powered editor with full JavaScript syntax highlighting
- **4 editor themes** — Dracula, Monokai, Material Darker, Nord
- **Code folding** — collapse and expand `{}` blocks from the gutter
- **Bracket matching** and auto-close brackets
- **Active line highlighting** and adjustable font size (`10px` – `24px`)
- Live **line count**, **word count**, **character count**, cursor position, and selection size display

### 🗂️ Multi-File Tabs
- Create, switch, and close **multiple file tabs** in one session
- Each file is **independently persisted** to `localStorage`
- **Unsaved change indicator** (`●`) per tab
- Last tab is protected from accidental deletion

### ▶️ Execution Engine
- Runs JavaScript **natively in the browser** — zero latency, works offline
- **Top-level `await`** support out of the box
- Full **`console` API** support:

  | Method | Method | Method |
  |---|---|---|
  | `console.log` | `console.warn` | `console.error` |
  | `console.info` | `console.debug` | `console.table` |
  | `console.time` | `console.timeEnd` | `console.count` |
  | `console.countReset` | `console.group` | `console.groupEnd` |
  | `console.assert` | `console.clear` | |

- Pretty-prints `Map`, `Set`, `Date`, `RegExp`, `Error`, circular references, and deeply nested objects
- `console.table` renders a **full ASCII box table**
- **Printf-style format strings** (`%s`, `%d`, `%f`, `%o`)
- Execution time shown after every run

### 💬 REPL Bar
- Quick-eval any expression directly from the console bar — **without touching the editor**
- **Arrow key history** navigation through previous REPL inputs

### 🔍 Find & Replace
- `Ctrl+F` opens a **live find bar** with highlighted matches and a match counter
- **Previous / Next** match navigation with wraparound
- **Replace one** or **replace all** occurrences in one click

### 🎨 Code Formatter
- One-click formatter (`Ctrl+Shift+F`) that:
  - Fixes indentation
  - Collapses excessive blank lines
  - Normalises spacing around operators
  - Strips trailing whitespace

### ⚡ Code Snippets Library
- 12 built-in, production-quality snippets in a **searchable card grid**
- Click any card to instantly load it into the editor
- See [Built-in Snippets](#-built-in-snippets) for the full list

### 🖥️ Console Filtering
- Filter output by: **All** · **Errors only** · **Warnings only**
- **Scroll Lock** to freeze output during long-running executions
- Per-run summary: log count · warn count · error count

### 🌗 UI & Theming
- Cyberpunk **neon dark theme** (gold/yellow accent) with scan-line texture
- **Light theme** toggle, persisted across sessions
- **Drag-to-resize** split pane between editor and console
- **Toast notifications** for all actions
- **Execution history modal** (last 30 runs) — click any entry to restore code
- **Full keyboard shortcuts reference panel**

### 💾 Persistence
- All open files **auto-saved** to `localStorage` on every keystroke
- Editor theme, UI theme, and font size preferences persisted
- Execution history persisted across sessions

---

## 🚀 Getting Started

### Option 1 — Just open it

```bash
# Clone the repo
git clone https://github.com/your-username/jsneon-ide.git

# Open in browser — no server needed
open jsneon-ide/index.html
```

### Option 2 — Serve locally (optional)

```bash
# Using Python
python -m http.server 3000

# Using Node
npx serve .

# Then visit
http://localhost:3000
```

> **Note:** The IDE works by opening `index.html` directly. A local server is only needed if your browser blocks `file://` imports.

---

## 📁 File Structure

```
jsneon-ide/
│
├── index.html      # App shell — layout, navbar, modals, tab bar, REPL bar
├── style.css       # Full UI — dark/light themes, components, animations (700+ lines)
├── script.js       # Core logic — editor, executor, REPL, tabs, snippets,
│                   #              find/replace, formatter, history (1400+ lines)
└── README.md       # This file
```

---

## ⌨️ Keyboard Shortcuts

| Action | Windows / Linux | Mac |
|---|---|---|
| Run code | `Ctrl + Enter` | `Cmd + Enter` |
| Format code | `Ctrl + Shift + F` | `Cmd + Shift + F` |
| Find & Replace | `Ctrl + F` | `Cmd + F` |
| Toggle comment | `Ctrl + /` | `Cmd + /` |
| New file tab | `Ctrl + Shift + N` | `Cmd + Shift + N` |
| Close current tab | `Ctrl + W` | `Cmd + W` |
| Download file | `Ctrl + S` | `Cmd + S` |
| Copy code | `Ctrl + Shift + C` | `Cmd + Shift + C` |
| Increase font size | `Ctrl + =` | `Cmd + =` |
| Decrease font size | `Ctrl + -` | `Cmd + -` |
| Clear console | `Ctrl + Shift + K` | `Cmd + Shift + K` |
| Toggle UI theme | `Ctrl + Shift + T` | `Cmd + Shift + T` |
| Close modal / find bar | `Escape` | `Escape` |

---

## ⚡ Built-in Snippets

| # | Snippet | Tag | Description |
|---|---|---|---|
| 1 | Async / Await Fetch | `async` | Fetch JSON with full error handling |
| 2 | Debounce Function | `utility` | Delay a function until input stops |
| 3 | Deep Clone Object | `utility` | Safely deep-clone any serialisable object |
| 4 | Event Emitter | `pattern` | Simple pub/sub event system |
| 5 | Promise.all + Timeout | `async` | Run parallel async tasks with a race timeout |
| 6 | Linked List | `data structure` | Singly linked list with full operations |
| 7 | Memoize / Cache | `utility` | Cache expensive function results |
| 8 | Observable / Reactive | `pattern` | Reactive state with subscriptions |
| 9 | Binary Search | `algorithm` | O(log n) search in a sorted array |
| 10 | Flatten & GroupBy | `array` | Deep flatten + groupBy array utilities |
| 11 | Proxy Validator | `advanced` | Runtime type-checking with ES Proxy |
| 12 | Generator Sequences | `advanced` | Infinite sequences using generators |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **HTML5** | App shell, layout, modals |
| **CSS3** | Theming system via custom properties, animations |
| **Vanilla JavaScript (ES2024)** | All logic — no frameworks |
| **CodeMirror 5** | Code editor with syntax highlighting & folding |
| **AsyncFunction constructor** | In-browser JS execution engine |
| **localStorage** | File, history, and preference persistence |

---

## 🌐 Browser Support

| Browser | Supported |
|---|---|
| Chrome 90+ | ✅ |
| Firefox 88+ | ✅ |
| Safari 15+ | ✅ |
| Edge 90+ | ✅ |
| Mobile Chrome / Safari | ✅ |

---

## 📄 License

```
MIT License — free to use, modify, and distribute.
```

---

<div align="center">

Built with ♥ using HTML, CSS & JavaScript &nbsp;·&nbsp; **JSNeon IDE v2.0**

</div>
