/**
 * Opencode Patch Plugins for opencode
 *
 * This module exports all Opencode Patch plugins for opencode integration.
 * Plugins provide hook-based automation taking advantage of opencode's 20+ event types.
 */

export { OpencodePatchPlugin, default } from "./opencode-patch-hooks.js"

// Re-export for named imports
export * from "./opencode-patch-hooks.js"
