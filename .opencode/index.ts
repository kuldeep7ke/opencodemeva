/**
 * Opencode Patch Plugin for opencode
 *
 * This package provides the published Opencode Patch opencode plugin module:
 * - Plugin hooks (auto-format, TypeScript check, console.log warning, env injection, etc.)
 * - Custom tools (run-tests, check-coverage, security-audit, format-code, lint-check, git-summary)
 * - Bundled reference config/assets for the wider Opencode Patch opencode setup
 *
 * Usage:
 *
 * Option 1: Install via npm
 * ```bash
 * npm install opencode-patch
 * ```
 *
 * Then add to your opencode.json:
 * ```json
 * {
 *   "plugin": ["opencode-patch"]
 * }
 * ```
 *
 * That enables the published plugin module only. For Opencode Patch commands, agents,
 * prompts, and instructions, use this repository's `.opencode/opencode.json`
 * as a base or copy the bundled `.opencode/` assets into your project.
 *
 * Option 2: Clone and use directly
 * ```bash
 * git clone https://github.com/kuldeep7ke/opencodemeva
 * cd opencodemeva
 * opencode
 * ```
 *
 * @packageDocumentation
 */

// Export the main plugin
// opencode's legacy plugin loader iterates every module export and throws if
// any is not a plugin function, so only the plugin function may be exported.
export { default } from "./plugins/index.js"
