/**
 * Session Notification Plugin
 *
 * Sends desktop notifications when sessions complete.
 * Useful for long-running tasks where you want to be notified.
 *
 * Installation:
 * 1. Copy to .opencode/plugin/notification.ts
 * 2. Add to opencode.json: { "plugin": ["./plugin/notification.ts"] }
 */

import type { Plugin } from "@opencode-ai/plugin"
import { spawn } from "node:child_process"

// Configuration
const CONFIG = {
  // Only notify for sessions longer than this (ms)
  minDuration: 30_000, // 30 seconds

  // Include session details in notification
  includeTitle: true,
}

// Windows-only toast via WinForms (no extra dependencies)
function showToast(title: string, body: string) {
  if (process.platform !== "win32") return

  const text = `${title} — ${body}`.replace(/['"`\r\n]/g, " ").slice(0, 120)
  const ps =
    "Add-Type -AssemblyName System.Windows.Forms;" +
    "$n=New-Object System.Windows.Forms.NotifyIcon;" +
    "$n.Icon=[System.Drawing.SystemIcons]::Information;" +
    `$n.BalloonTipTitle='${text}';` +
    "$n.Visible=$true;" +
    "$n.ShowBalloonTip(10000);" +
    "Start-Sleep -Seconds 11;" +
    "$n.Dispose()"

  const child = spawn("powershell", ["-NoProfile", "-NonInteractive", "-Command", ps], {
    windowsHide: true,
    stdio: "ignore",
  })
  child.on("error", () => {})
}

const plugin: Plugin = async (context) => {
  const sessionStartTimes = new Map<string, number>()

  return {
    event: async (input) => {
      const event = input.event

      if (event.type === "session.created") {
        sessionStartTimes.set(event.properties.info.id, Date.now())
        return
      }

      if (event.type !== "session.idle") return

      const startTime = sessionStartTimes.get(event.properties.sessionID)
      if (startTime === undefined) return
      sessionStartTimes.delete(event.properties.sessionID)

      const duration = Date.now() - startTime
      if (duration < CONFIG.minDuration) return

      const title = CONFIG.includeTitle ? "OpenCode session complete" : "OpenCode"
      showToast(title, `Session finished in ${formatDuration(duration)}`)
    },
  }
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${seconds}s`
}

export default plugin