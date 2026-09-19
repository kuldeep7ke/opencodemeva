---
description: Perform a comprehensive code review on specified files or recent changes
---

# /review Command

Perform a thorough code review with actionable feedback.

## Usage

```
/review [file path or git ref]
/review                     # Review staged changes
/review src/auth/           # Review directory
/review HEAD~3..HEAD        # Review last 3 commits
```

## What This Command Does

1. Analyzes code for quality issues
2. Checks for security vulnerabilities
3. Reviews naming and readability
4. Identifies potential bugs
5. Suggests improvements

## Review Checklist

### Code Quality
- [ ] Clear, descriptive naming
- [ ] Functions do one thing
- [ ] No code duplication
- [ ] Appropriate abstractions
- [ ] Error handling present

### Security
- [ ] Input validation
- [ ] No hardcoded secrets
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] Proper authentication/authorization

### Performance
- [ ] No unnecessary loops
- [ ] Efficient data structures
- [ ] Proper caching considerations
- [ ] No memory leaks

### Maintainability
- [ ] Code is self-documenting
- [ ] Complex logic has comments
- [ ] Tests exist and are meaningful
- [ ] No magic numbers

## Output Format

```markdown
## Code Review: src/auth/login.ts

### Summary
Overall: ⚠️ **Needs Changes** (3 issues, 5 suggestions)

### Critical Issues 🔴
1. **SQL Injection vulnerability** (line 45)
   ```typescript
   // Current
   db.query(`SELECT * FROM users WHERE email = '${email}'`);
   
   // Should be
   db.query('SELECT * FROM users WHERE email = $1', [email]);
   ```

### Warnings ⚠️
2. **Missing error handling** (line 78)
   - The async function doesn't catch potential errors
   - Add try/catch or let errors propagate intentionally

### Suggestions 💡
3. **Consider extracting magic number** (line 23)
   ```typescript
   // Current
   if (attempts > 5) { ... }
   
   // Better
   const MAX_LOGIN_ATTEMPTS = 5;
   if (attempts > MAX_LOGIN_ATTEMPTS) { ... }
   ```

4. **Function too long** (lines 50-120)
   - 70 lines; consider breaking into smaller functions
   - Suggested: extract validation, extract token generation

### Positive Notes ✅
- Good use of TypeScript types
- Clear variable naming
- Appropriate logging

### Files Changed
| File | Issues | Suggestions |
|------|--------|-------------|
| login.ts | 2 | 3 |
| session.ts | 1 | 2 |
```

## Severity Levels

| Level | Icon | Description | Action |
|-------|------|-------------|--------|
| Critical | 🔴 | Security, data loss, crashes | Must fix |
| Warning | ⚠️ | Bugs, poor patterns | Should fix |
| Suggestion | 💡 | Improvements, style | Consider |
| Nitpick | 📝 | Minor style preferences | Optional |

## Example

```
/review src/api/users.ts
```

Output:
```markdown
## Code Review: src/api/users.ts

### Summary
Overall: ✅ **Approved** (0 issues, 2 suggestions)

### Suggestions 💡

1. **Consider pagination** (line 34)
   `getAll()` returns all users - could be slow with large datasets
   
2. **Add rate limiting** (line 12)
   Public endpoint should have rate limiting

### Positive Notes ✅
- Excellent error handling
- Good input validation with Zod
- Comprehensive logging
- Tests cover happy path and errors
```

## Review Guidelines

When reviewing code:
- Be specific - include line numbers and code snippets
- Be constructive - suggest fixes, not just problems
- Prioritize - critical issues first
- Acknowledge good patterns - positive feedback matters
- Consider context - code standards vary by project
