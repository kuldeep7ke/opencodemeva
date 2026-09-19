import type { Plugin } from "@opencode-ai/plugin"

interface SessionStats {
  startTime: number
  filesCreated: string[]
  filesEdited: string[]
  toolsUsed: Map<string, number>
  errors: string[]
}

const plugin: Plugin = async (context) => {
  let stats: SessionStats | null = null

  return {
    event: async (input) => {
      const event = input.event

      if (event.type === "session.created") {
        stats = {
          startTime: Date.now(),
          filesCreated: [],
          filesEdited: [],
          toolsUsed: new Map(),
          errors: [],
        }
        return
      }

      if (event.type === "file.edited") {
        if (stats && !stats.filesEdited.includes(event.properties.file)) {
          stats.filesEdited.push(event.properties.file)
        }
        return
      }

      if (event.type !== "session.idle" || !stats) return

      const duration = Date.now() - stats.startTime
      const durationStr = formatDuration(duration)

      console.log(`\n${'═'.repeat(50)}`)
      console.log(`📊 SESSION SUMMARY`)
      console.log(`${'═'.repeat(50)}`)

      console.log(`\n⏱️  Duration: ${durationStr}`)

      console.log(`\n📁 Files:`)
      console.log(`   Created: ${stats.filesCreated.length}`)
      console.log(`   Edited:  ${stats.filesEdited.length}`)

      if (stats.filesCreated.length > 0) {
        console.log(`\n   New files:`)
        stats.filesCreated.slice(0, 5).forEach(f =>
          console.log(`   + ${f}`)
        )
        if (stats.filesCreated.length > 5) {
          console.log(`   ... and ${stats.filesCreated.length - 5} more`)
        }
      }

      if (stats.toolsUsed.size > 0) {
        console.log(`\n🔧 Tools used:`)
        const sorted = [...stats.toolsUsed.entries()]
          .sort((a, b) => b[1] - a[1])
        sorted.slice(0, 5).forEach(([tool, count]) =>
          console.log(`   ${tool}: ${count}`)
        )
      }

      console.log(`\n${'═'.repeat(50)}\n`)

      stats = null
    },

    "tool.execute.after": async (input) => {
      if (!stats) return

      if (input.tool === 'write') {
        const fp = String(((input.args ?? {}) as Record<string, any>).filePath ?? '')
        if (fp && !stats.filesCreated.includes(fp)) stats.filesCreated.push(fp)
      }

      const count = stats.toolsUsed.get(input.tool) || 0
      stats.toolsUsed.set(input.tool, count + 1)
    },
  }
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

export default plugin