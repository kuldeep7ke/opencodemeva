import type { Plugin } from "@opencode-ai/plugin"

const DANGEROUS_COMMANDS = [
  /rm\s+-rf\s+[\/~]/,
  /rm\s+-rf\s+\*/,
  /rm\s+-rf\s+\.\./,
  />\s*\/dev\/sd[a-z]/,
  /mkfs\./,
  /dd\s+if=.*of=\/dev/,
  /chmod\s+-R\s+777/,
  /curl.*\|\s*(ba)?sh/,
  /wget.*\|\s*(ba)?sh/,
  /git\s+push.*--force\s+(origin\s+)?(main|master)/,
  /git\s+reset\s+--hard\s+origin/,
  /drop\s+database/i,
  /drop\s+table/i,
  /truncate\s+table/i,
  /delete\s+from\s+\w+\s*;?\s*$/i,
]

const WARNINGS = [
  { pattern: /npm\s+publish/, message: 'Publishing to npm registry' },
  { pattern: /docker\s+push/, message: 'Pushing Docker image' },
  { pattern: /kubectl\s+delete/, message: 'Deleting Kubernetes resources' },
  { pattern: /terraform\s+destroy/, message: 'Destroying Terraform infrastructure' },
  { pattern: /aws\s+.*delete/, message: 'Deleting AWS resources' },
]

const plugin: Plugin = async (context) => {
  return {
    "tool.execute.before": async (input, output) => {
      if (input.tool !== 'bash') return

      const args = (output.args ?? {}) as Record<string, any>
      const command = typeof args.command === 'string' ? args.command : ''
      if (!command) return

      for (const pattern of DANGEROUS_COMMANDS) {
        if (pattern.test(command)) {
          throw new Error(
            `🚫 Dangerous command blocked: "${command.slice(0, 50)}..."\n` +
              `This command could cause irreversible damage.`
          )
        }
      }

      for (const { pattern, message } of WARNINGS) {
        if (pattern.test(command)) {
          console.warn(`⚠️  Warning: ${message}`)
          console.warn(`   Command: ${command.slice(0, 80)}`)
        }
      }
    },
  }
}

export default plugin