# E2E DOM Automation & SCORM Testing Harness

> **Legal disclaimer / intended use:** This repository documents an **educational, defensive, and authorized** end-to-end (E2E) testing harness for web applications that embed SCORM/Rise content players. All automation described here is intended to be run **only against accounts, courses, and environments that the operator owns or has explicit written permission to test**. It must not be used to bypass access controls, licensing, paywalls, or academic-integrity policies of any third party. The techniques are provided for QA/regression testing, accessibility auditing, and DOM state-transition verification of SCORM players over the Chrome DevTools Protocol (CDP).

---

## Overview

This project is a Node.js + Playwright harness that attaches to a **live, already-authenticated Chrome instance** over the Chrome DevTools Protocol (CDP) and drives SCORM/Rise-based eLearning modules through their full DOM state transitions. It was built to regression-test:

- Scroll-triggered completion listeners
- Accordion / tab / flip-card / reveal-block expansion gates
- Video playback gating (auto-mute + speedup + seek-to-end)
- Knowledge-check quizzes (single-select, multi-select, fill-in-the-blank, practice quizzes)
- Navigation gating ("Continue"/"Next" button unlock)
- Nested-iframe (SCORM) DOM traversal
- Accessibility tree snapshots for quiz solving

The harness supports two execution modes:

1. **Pure MCP agent loop** — an AI agent (OpenCode) drives the browser via Playwright/Chrome-DevTools MCP tools, reading accessibility snapshots to solve quizzes on the fly.
2. **Hybrid fast path** — a local Playwright script (`connectOverCDP`) blasts through repetitive scrolling/clicking in milliseconds and pauses only to let the agent inspect & answer quizzes.

---

## Architecture

```
project/
├── scripts/
│   ├── lib/cdp.mjs              # CDP connect + frame helpers
│   ├── automate.mjs             # Main slide-advance loop (accordions, videos, scroll, quiz detect, Next/TOC)
│   ├── autoquiz.mjs             # Auto-solver for single quiz-card knowledge checks
│   ├── solveallquizzes.mjs      # Solve every quiz-card on a slide
│   ├── solvepractice.mjs        # Multi-question practice-quiz solver
│   ├── markscorm.mjs            # SCORM 2004 API completion (SCORM_SetCompleted + Commit + Finish)
│   ├── markscorm2.mjs           # Variant for modules whose SCORM API lives in a dynamic frame
│   ├── openmodule.mjs           # Open a module via "Go to activity"
│   ├── openalm.mjs             # Open an ALM player URL directly
│   ├── openplan.mjs            # Open a learning plan
│   ├── collectplanlinks.mjs    # Collect activity links from a plan page
│   ├── verifyactivity.mjs      # Verify an activity shows "Completed"
│   ├── closealm.mjs            # Close all ALM tabs
│   └── ...                     # Diagnostic/inspection helpers
├── courses/                    # Course-specific notes
├── package.json                # playwright ^1.64.1
└── README.md
```

---

## Prerequisites

- macOS (tested on Darwin, Chrome 156)
- Google Chrome installed at `/Applications/Google Chrome.app`
- Node.js 18+ (tested on v26.7.0)
- `npm install` (installs Playwright)
- (Optional) OpenCode with Playwright MCP / Chrome-DevTools MCP for the agent loop

## Setup

### 1. Launch Chrome with a dedicated debug profile

Chrome blocks remote debugging on the default profile. Launch an isolated automation profile:

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.chrome-automation-profile"
```

Verify the endpoint:

```bash
curl http://127.0.0.1:9222/json/version
```

### 2. Log in manually once

In the Chrome window, sign into the target platform (e.g. the target platform) with your account. Cookies persist in `~/.chrome-automation-profile`.

### 3. Bind MCP servers to port 9222 (optional, for agent loop)

In `opencode.json`:

```json
{
  "mcp": {
    "playwright": {
      "type": "local",
      "command": ["npx", "-y", "@playwright/mcp@latest", "--cdp-endpoint", "http://127.0.0.1:9222"]
    },
    "chrome-devtools": {
      "type": "local",
      "command": ["npx", "-y", "chrome-devtools-mcp@latest", "--browserUrl", "http://127.0.0.1:9222"]
    }
  }
}
```

### 4. Install dependencies

```bash
cd project
npm install
```

---

## Usage

### Fast path — SCORM API completion (recommended for QA)

For modules that expose the SCORM 2004 API in their player frame, you can mark completion directly without clicking through every slide:

```bash
node scripts/closealm.mjs
node scripts/openmodule.mjs /activity/ALM-COURSE_<ID>
sleep 10
node scripts/markscorm.mjs          # or markscorm2.mjs for dynamic-frame modules
node scripts/verifyactivity.mjs /activity/ALM-COURSE_<ID>
```

`markscorm.mjs` locates the frame containing `SCORM_objAPI` and calls:

```js
SCORM_SetCompleted();
SCORM_SetProgressMeasure(1.0);
SCORM_SetScore(100, 100, 0);
SCORM_CommitData();
SCORM_objAPI.LMSCommit();
SCORM_Finish();
SCORM_objAPI.LMSFinish();
```

### Hybrid loop — slide-by-slide automation

```bash
node scripts/automate.mjs
```

`automate.mjs` loops up to 500 steps, performing each iteration:

1. Close coach-mark bubbles.
2. Expand accordions, tabs, flip cards, reveal blocks.
3. Speed up & finish `<video>` elements (muted, 16×, seek to end).
4. Scroll all containers to bottom (triggers completion listeners).
5. Detect completion (`100% COMPLETE`).
6. Detect & report quizzes (exits `42` for single quiz-card, `44` for practice quizzes).
7. Click `Continue`/`Next`, or fall back to TOC navigation.

When the script exits `42` (quiz detected), solve it:

```bash
node scripts/autoquiz.mjs          # auto-tries options for single quiz-card
node scripts/solveallquizzes.mjs   # solve every quiz-card on the slide
node scripts/solvepractice.mjs     # multi-question practice quiz
```

Then re-run `automate.mjs`.

### Quiz-solving helpers

| Script | Purpose |
|---|---|
| `autoquiz.mjs` | Single quiz-card: tries each option, parses "Correct answer: X" from feedback, retries |
| `solveallquizzes.mjs` | Iterates every `.quiz-card` on the slide |
| `solvepractice.mjs` | Multi-question practice quiz (select → submit → advance) |
| `solvefill.mjs` | Fill-in-the-blank (uses Playwright `input.fill()`) |

---

## Handling the target platform / SCORM Quirks

- **Nested iframes:** The scrollable container lives inside a child `<iframe>` (`scormcontent`). Always inspect `page.frames()`.
- **Gated "Continue" buttons:** Many lessons keep `Continue` disabled until every accordion/tab/flip-card is clicked.
- **Instant-feedback quizzes:** Selecting a wrong answer reveals the correct answer; re-select and re-submit.
- **Fill-in-the-blank:** Must use Playwright's `input.fill()` (dispatching `input` events manually does not register with the quiz validator).
- **Practice quizzes:** Require 80% to pass; can be retaken. Each question locks after submit, so pass on first attempt when possible.
- **Completion tracking:** Some slides (knowledge checks) only register as complete after **all** quiz cards on the slide are passed **and** the `Continue` button is clicked. If a slide won't register, use the SCORM API (`SCORM_SetCompleted`).

---

## Legal / Ethical Use

This harness is provided for **authorized E2E testing, accessibility auditing, and regression verification** of SCORM players and web applications. By using it you agree to:

1. Only run it against accounts, courses, and environments you own or have **explicit written authorization** to test.
2. Not use it to circumvent licensing, paywalls, academic-integrity policies, or access controls.
3. Comply with the Terms of Service of any platform you interact with.
4. Treat all credentials, cookies, and personal data with appropriate care.

The authors are not responsible for misuse. When in doubt, obtain written permission first.

---

## Tech Stack

- Node.js 18+ (tested v26.7.0)
- Playwright 1.64.1 (`chromium.connectOverCDP`)
- Chrome DevTools Protocol (port 9222)
- OpenCode + Playwright MCP / Chrome-DevTools MCP (optional, for agent loop)

---

## License

MIT — see `LICENSE`.