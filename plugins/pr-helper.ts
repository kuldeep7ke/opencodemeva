import type { Plugin } from "@opencode-ai/plugin"

const plugin: Plugin = async (context) => {
  const changedFiles = new Set<string>()
  let sessionStartBranch: string | null = null

  return {
    event: async (input) => {
      const event = input.event

      if (event.type === "vcs.branch.updated") {
        if (event.properties.branch) sessionStartBranch = event.properties.branch
        return
      }

      if (event.type === "file.edited") {
        changedFiles.add(event.properties.file)
        return
      }

      if (event.type !== "session.idle") return
      if (changedFiles.size === 0) return

      const files = Array.from(changedFiles)
      changedFiles.clear()

      console.log(`\n📋 PR Helper Summary`)
      console.log(`${'─'.repeat(40)}`)

      if (sessionStartBranch) {
        console.log(`Branch: ${sessionStartBranch}`)
      }

      console.log(`\nFiles changed (${files.length}):`)
      files.slice(0, 10).forEach(f => console.log(`  • ${f}`))
      if (files.length > 10) {
        console.log(`  ... and ${files.length - 10} more`)
      }

      console.log(`\n📝 Suggested PR commands:`)
      console.log(`   git add -A`)
      console.log(`   git commit -m "feat: <description>"`)
      console.log(`   git push -u origin HEAD`)
      console.log(`   gh pr create --fill`)
    },
  }
}

export default plugin