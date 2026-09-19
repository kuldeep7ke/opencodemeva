---
name: visual-dev-loop
description: 'Automated visual development loop: run app, preview in browser, screenshot, inspect, fix, repeat until done. Uses the Playwright MCP server for browser inspection.'
---

# Visual Development Loop

Use this skill when developing frontend/UI features that need visual verification. The agent runs an automated loop: build → preview → screenshot → inspect → fix → repeat until the task is complete.

## Tooling Overview

| Tool                    | Purpose                                                                                 |
| ----------------------- | --------------------------------------------------------------------------------------- |
| **playwright MCP**      | Navigate, screenshot, snapshot (a11y tree), inspect console + network                    |

## Starting the Dev Server

The dev server curl/markup depends on the framework. Use `package.json` scripts or the framework CLI:

```bash
# In project with package.json:
npm run dev
# or, with explicit port, e.g. Vite/Next default:
npm run dev -- --port 5173
```

Figure out the dev URL from the server output (normally `http://localhost:<port>`). Always use a fixed port so reloads hit the same URL.

## Dev Loop Protocol

### Step 1: Start Dev Server

```bash
npm run dev
```

NOTE: if the vendor's dev port is dynamic, pick an explicit port. The app is now at `http://localhost:<port>`.

### Step 2: Open Browser & Navigate

Use Playwright to open the app:

```
playwright browser_navigate http://localhost:<port>
```

### Step 3: Inspect the UI

Using Playwright (primary):

```
playwright browser_take_screenshot          — full page screenshot
playwright browser_snapshot                 — accessibility tree with refs
playwright browser_console_messages         — check for errors/warnings
playwright browser_network_requests         — verify API calls, no 4xx/5xx
```

### Step 4: Analyze Issues

Compare what you see against the task requirements:

- Visual issues (layout, styling, missing elements) → from screenshots
- Console errors → from `browser_console_messages`
- Network failures → from `browser_network_requests`
- Accessibility violations → from `browser_snapshot`

### Step 5: Fix Code

Edit the source files based on findings.

### Step 6: Reload & Re-inspect

```
playwright browser_navigate http://localhost:<port> (reload)
# Wait for page to load
playwright browser_take_screenshot
playwright browser_console_messages
```

### Step 7: Loop Until Done

Repeat steps 4-6 until all issues are resolved.

## Playwright Specific Workflows

### Full Inspection (Every Loop)

```
1. browser_take_screenshot               — visual capture
2. browser_snapshot                      — accessibility tree with element refs
3. browser_console_messages (level: error, warning) — JS errors
4. browser_network_requests (filter: /api/) — API call status
```

### Mobile/Responsive Testing

```
1. browser_resize 375 812             — mobile viewport
2. browser_take_screenshot
3. browser_resize 1440 900            — desktop viewport
4. browser_take_screenshot
```

## Loop Termination Criteria

The loop stops when ALL criteria are met:

- [ ] Application loads without console errors
- [ ] All network requests return 2xx/3xx
- [ ] UI matches requirements visually (verified via screenshot)
- [ ] Accessibility snapshot shows correct elements
- [ ] No layout/rendering issues visible

If after 10 iterations the task is not complete, stop and report remaining issues.

## Common Pitfalls

1. **Port already in use** → Kill existing process with `kill $(lsof -ti:PORT)` or use a different port
2. **Chrome not starting** → Ensure Chrome is installed. The Playwright MCP (`playwright`) is configured to use your installed Chrome (`--browser chrome`), no download needed
3. **Screenshot too large** → Playwright screenshots use CSS pixels by default; request `scale: css` to keep token usage down
4. **State loss on reload** → If app state resets, use Playwright `browser_evaluate` to re-hydrate state after reload