import type { Plugin } from "@opencode-ai/plugin"

const CONSOLE_PATTERNS = [
  /console\.log\(/,
  /console\.debug\(/,
  /console\.info\(/,
]

const ALLOWED_PATTERNS = [
  /console\.error\(/,
  /console\.warn\(/,
  /console\.time/,
  /console\.table\(/,
]

function containsConsoleLog(content: string): { found: boolean; lines: number[] } {
  const lines: number[] = []
  const contentLines = content.split('\n')

  contentLines.forEach((line, index) => {
    const isAllowed = ALLOWED_PATTERNS.some(p => p.test(line))
    if (isAllowed) return

    const hasConsole = CONSOLE_PATTERNS.some(p => p.test(line))
    if (hasConsole) {
      lines.push(index + 1)
    }
  })

  return { found: lines.length > 0, lines }
}

const plugin: Plugin = async (context) => {
  return {
    "tool.execute.after": async (input) => {
      if (input.tool !== 'write' && input.tool !== 'edit') return

      const args = (input.args ?? {}) as Record<string, any>
      if (!args.filePath) return

      const fp = String(args.filePath)
      const ext = fp.substring(fp.lastIndexOf('.'))
      if (!['.ts', '.tsx', '.js', '.jsx'].includes(ext)) return

      const content = String(args.content || args.newString || '')
      const { found, lines } = containsConsoleLog(content)

      if (found) {
        console.warn(
          `⚠️  Console.log detected in ${fp} at line(s): ${lines.join(', ')}\n` +
            `   Consider using a proper logger or removing before commit.`
        )
      }
    },
  }
}

export default plugin