/**
 * Environment Protection Plugin
 *
 * Prevents accidental exposure of sensitive environment files.
 * Blocks read/write operations on .env files and other sensitive configs.
 *
 * Installation:
 * 1. Copy to .opencode/plugin/env-protection.ts
 * 2. Add to opencode.json: { "plugin": ["./plugin/env-protection.ts"] }
 */

import type { Plugin } from "@opencode-ai/plugin"
import * as path from "path"

// Patterns for sensitive files
const SENSITIVE_PATTERNS = [
  /\.env$/,
  /\.env\..+$/,           // .env.local, .env.production, etc.
  /credentials\.json$/,
  /secrets\.json$/,
  /\.pem$/,
  /\.key$/,
  /id_rsa/,
  /id_ed25519/,
  /\.p12$/,
  /\.pfx$/,
  /keystore/,
]

// Files that are allowed (overrides patterns)
const ALLOWED_FILES = [
  '.env.example',
  '.env.template',
  '.env.sample',
]

function isSensitiveFile(filePath: string): boolean {
  const basename = path.basename(filePath)

  // Check if explicitly allowed
  if (ALLOWED_FILES.includes(basename)) {
    return false
  }

  // Check against sensitive patterns
  return SENSITIVE_PATTERNS.some(pattern => pattern.test(basename))
}

const SECRET_PATTERNS = [
  /api[_-]?key\s*[:=]\s*["'][a-zA-Z0-9]{20,}["']/i,
  /secret[_-]?key\s*[:=]\s*["'][a-zA-Z0-9]{20,}["']/i,
  /password\s*[:=]\s*["'][^"']{8,}["']/i,
  /(api[_-]?key|secret[_-]?key|password|passwd|pwd|token)\s*[:=]\s*[^\s"'`]{12,}/i,
  /AKIA[0-9A-Z]{16}/,  // AWS Access Key
  /-----BEGIN (RSA |DSA |EC )?PRIVATE KEY-----/,
]

const BASH_SECRET_COMMANDS = [
  /cat\s+.*\.env/,
  /echo\s+.*\$\{?[A-Z_]*KEY/i,
  /echo\s+.*\$\{?[A-Z_]*SECRET/i,
  /echo\s+.*\$\{?[A-Z_]*PASSWORD/i,
  /printenv/,
  /export\s+.*=.*["'][^"']{20,}["']/,
]

const plugin: Plugin = async (context) => {
  return {
    "tool.execute.before": async (input, output) => {
      const args = (output.args ?? {}) as Record<string, any>

      // Check read operations
      if (input.tool === 'read' && args.filePath) {
        if (isSensitiveFile(String(args.filePath))) {
          throw new Error(
            `🔒 Access denied: "${path.basename(String(args.filePath))}" contains sensitive data.\n` +
            `If you need to reference environment variables, use .env.example as a template.`
          )
        }
      }

      // Check write operations
      if ((input.tool === 'write' || input.tool === 'edit') && args.filePath) {
        if (isSensitiveFile(String(args.filePath))) {
          throw new Error(
            `🔒 Write denied: Cannot modify sensitive file "${path.basename(String(args.filePath))}".\n` +
            `Manually edit this file or use .env.example for templates.`
          )
        }
      }

      // Check for secrets in content being written
      if ((input.tool === 'write' || input.tool === 'edit') && args.content) {
        const content = String(args.content)
        for (const pattern of SECRET_PATTERNS) {
          if (pattern.test(content)) {
            throw new Error(
              `🔒 Secret detected: Content appears to contain hardcoded credentials.\n` +
              `Please use environment variables instead of hardcoding secrets.`
            )
          }
        }
      }

      // Also check bash commands
      if (input.tool === 'bash' && args.command) {
        const command = String(args.command)
        for (const pattern of BASH_SECRET_COMMANDS) {
          if (pattern.test(command)) {
            throw new Error(
              `🔒 Command blocked: This command may expose sensitive data.\n` +
              `Avoid printing or echoing environment variables with secrets.`
            )
          }
        }
      }
    },
  }
}

export default plugin