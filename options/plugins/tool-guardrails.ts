import type { Plugin } from "@opencode-ai/plugin";

export const ToolGuardrailsPlugin: Plugin = async () => {
  return {
    "tool.execute.before": async (input, output) => {
      if (!input || !input.tool) return;

      const args = (output.args ?? {}) as Record<string, any>;

      if (input.tool === "bash") {
        const command = typeof args.command === 'string' ? args.command : '';
        if (!command) return;

        // Block dev servers outside tmux (POSIX only — tmux doesn't exist on Windows)
        if (process.platform !== 'win32' && /npm run dev|pnpm dev|yarn dev|bun dev/.test(command)) {
          if (!process.env.TMUX) {
            throw new Error(
              '[Hook] Dev server must run in tmux for log access\n' +
              '[Hook] Use: tmux new-session -d -s dev "npm run dev"'
            );
          }
        }

        // Reminder for long-running commands
        if (/npm install|docker|pytest|cargo build/.test(command) && !process.env.TMUX) {
          console.warn('[Hook] Consider running in tmux for session persistence');
        }

        // Pre-push reminder
        if (command.trim().startsWith('git push')) {
          console.warn('[Hook] Review changes before push...');
        }
      }

      if (input.tool === "write") {
        const filePath = typeof args.filePath === 'string' ? args.filePath : '';

        // Block random .md/.txt files that aren't pack content or docs
        if (filePath && /\.(md|txt)$/.test(filePath)) {
            const fileName = filePath.split(/[/\\]/).pop() ?? '';
            const allowed = [
                'README.md', 'CONTRIBUTING.md', 'CHANGELOG.md',
                'AGENTS.md', 'MIGRATE_HOOKS.md', 'TODO.md'
            ];

            // Allow pack content dirs (skills/commands/agents), .opencode, docs
            const segments = filePath.split(/[/\\]/);
            const isAllowedDir = segments.includes('skills') || segments.includes('commands')
              || segments.includes('agents') || segments.includes('.opencode')
              || segments.includes('docs');

            if (!allowed.includes(fileName) && !isAllowedDir && !fileName.startsWith('CLAUDE')) {
                 throw new Error(
                    '[Hook] Unnecessary documentation file creation blocked. ' +
                    'Use README.md or the docs/ directory for documentation.'
                  );
            }
        }
      }
    },

    "tool.execute.after": async (input, output) => {
      if (input.tool === "bash") {
        const args = (input.args ?? {}) as Record<string, any>;
        const command = typeof args.command === 'string' ? args.command : '';

        // Log PR creation
        if (command && /gh pr create/.test(command)) {
          const cmdOutput = (output as any)?.output || "";
          const match = cmdOutput.match(/https:\/\/github.com\/[^/]+\/[^/]+\/pull\/\d+/);
          if (match) {
            console.log(`[Hook] PR created: ${match[0]}`);
          }
        }
      }
    }
  }
}