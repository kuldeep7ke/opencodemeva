---
name: visual-dev-loop
description: 'Automated visual development loop: run app, preview in browser, screenshot, inspect, fix, repeat until done. Uses the Playwright MCP server for browser inspection + agent-browser for annotated screenshots + portless for stable dev URLs.'
---

# Visual Development Loop

Use this skill when developing frontend/UI features that need visual verification. The agent runs an automated loop: build → preview → screenshot → inspect → fix → repeat until the task is complete.

## Tooling Overview

| Tool                    | Purpose                                                                                 |
| ----------------------- | --------------------------------------------------------------------------------------- |
| **portless**            | Run dev server with named URL: `https://myapp.localhost`                                |
| **playwright MCP**      | Navigate, screenshot, snapshot (a11y tree), inspect console + network                    |
| **agent-browser MCP**   | Annotated screenshots (numbered labels), visual diff, React tree inspection, Web Vitals |

## Port-Specific Guidance

When running `portless` as a Bash command, use the `PORT` env var if port 443 is unavailable:

```bash
PORT=443 portless myapp npm run dev
```

Portless reads `package.json` "dev" script automatically. Just run:

```bash
portless
# or
portless myapp next dev
```

This produces `https://myapp.localhost` (or `<project-name>.localhost`).

## Dev Loop Protocol

### Step 1: Start Dev Server

```bash
# In project with package.json:
portless

# Or with explicit name and command:
portless <app-name> <dev-command>
```

The app is now at `https://<app-name>.localhost`.

### Step 2: Open Browser & Navigate

Use Playwright to open the app:

```
playwright browser_navigate https://<app-name>.localhost
```

### Step 3: Inspect the UI

**Using Playwright (primary):**

```
playwright browser_take_screenshot          — full page screenshot
playwright browser_snapshot                 — accessibility tree with refs
playwright browser_console_messages         — check for errors/warnings
playwright browser_network_requests         — verify API calls, no 4xx/5xx
```

**Using agent-browser (when visual context is needed):**

```
agent-browser screenshot --annotate        — screenshot with numbered labels
agent-browser snapshot -i                  — interactive elements only
agent-browser get title                    — current page title
agent-browser get url                      — current URL
```

### Step 4: Analyze Issues

Compare what you see against the task requirements:

- Visual issues (layout, styling, missing elements) → from screenshots
- Console errors → from `browser_console_messages`
- Network failures → from `browser_network_requests`
- Accessibility violations → from `browser_snapshot` / `agent-browser snapshot`

### Step 5: Fix Code

Edit the source files based on findings.

### Step 6: Reload & Re-inspect

```
playwright browser_navigate https://<app-name>.localhost (reload)
# Wait for page to load
playwright browser_take_screenshot
playwright browser_console_messages
```

### Step 7: Loop Until Done

Repeat steps 4-6 until all issues are resolved.

## Agent-Browser Specific Workflows

### Annotated Screenshots for Visual Reference

```
agent-browser navigate_page https://myapp.localhost
agent-browser screenshot --annotate
```

Produces a screenshot with `@e1`, `@e2`, etc. labels overlaid on interactive elements.

### Visual Regression Diff

```
agent-browser screenshot baseline.png
# ... after changes ...
agent-browser screenshot current.png
agent-browser diff screenshot --baseline baseline.png --output diff.png
```

### React Component Inspection

```
agent-browser new_page https://myapp.localhost --enable react-devtools
agent-browser evaluate_script "agent_browser_react_tree()"
```

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

1. **Port already in use** → Kill existing process with `kill $(lsof -ti:PORT)` or use different port
2. **portless permission** → First run requires `sudo` for port 443 on macOS/Linux: `sudo portless trust`
3. **Chrome not starting** → Ensure Chrome is installed. The Playwright MCP (`playwright`) is configured to use your installed Chrome (`--browser chrome`), no download needed
4. **agent-browser not installed** → `npm install -g agent-browser && agent-browser install`
5. **Screenshot too large** → Playwright screenshots use CSS pixels by default; request `scale: css` to keep token usage down
6. **State loss on reload** → If app state resets, use Playwright `browser_evaluate` to re-hydrate state after reload
