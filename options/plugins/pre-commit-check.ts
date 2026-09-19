import type { Plugin } from "@opencode-ai/plugin"

const GIT_COMMIT_PATTERN = /git\s+commit/

const plugin: Plugin = async (context) => {
  return {
    "tool.execute.before": async (input, output) => {
      if (input.tool !== 'bash') return

      const args = (output.args ?? {}) as Record<string, any>
      const command = typeof args.command === 'string' ? args.command : ''
      if (!GIT_COMMIT_PATTERN.test(command)) return

      try {
        const { $ } = context

        const lintResult = await $`npm run lint --if-present --silent 2>/dev/null`
        if (lintResult.exitCode !== 0) {
          console.warn(`⚠️  Lint errors detected. Consider fixing before commit.`)
        }

        const testResult = await $`npm test --if-present --silent 2>/dev/null`
        if (testResult.exitCode !== 0) {
          console.warn(`⚠️  Test failures detected. Consider fixing before commit.`)
        }
      } catch {
        // Lint/test commands not available, skip
      }
    },

    "tool.execute.after": async (input) => {
      if (input.tool !== 'bash') return

      const args = (input.args ?? {}) as Record<string, any>
      const command = typeof args.command === 'string' ? args.command : ''
      if (!GIT_COMMIT_PATTERN.test(command)) return

      console.log(`✅ Commit executed`)

      try {
        const { $ } = context
        const status = await $`git log -1 --pretty=format:"%h %s"`
        console.log(`   ${String(status.stdout).trim()}`)
      } catch {
        // Git not available
      }
    },
  }
}

export default plugin