import type { Plugin } from "@opencode-ai/plugin"

const TS_EXTENSIONS = ['.ts', '.tsx']

const plugin: Plugin = async (context) => {
  const modifiedTsFiles = new Set<string>()

  return {
    event: async (input) => {
      const event = input.event

      if (event.type === "file.edited") {
        const fp = event.properties.file
        const ext = fp.substring(fp.lastIndexOf('.'))
        if (TS_EXTENSIONS.includes(ext)) {
          modifiedTsFiles.add(fp)
        }
        return
      }

      if (event.type !== "session.idle") return
      if (modifiedTsFiles.size === 0) return

      try {
        const { $ } = context
        console.log(`\n🔍 Running TypeScript check on ${modifiedTsFiles.size} modified files...`)

        const result = await $`npx tsc --noEmit`

        if (result.exitCode === 0) {
          console.log(`✅ No TypeScript errors found`)
        } else {
          const detail = String(result.stderr || result.stdout || "").trim()
          if (detail) console.log(detail)
        }
      } catch (error: unknown) {
        const err = error as { stderr?: string; message?: string }
        console.log(`\n❌ TypeScript errors detected:`)
        console.log(err.stderr || err.message)
        console.log(`\n💡 Run 'npx tsc --noEmit' to see all errors`)
      } finally {
        modifiedTsFiles.clear()
      }
    },
  }
}

export default plugin