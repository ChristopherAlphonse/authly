---
description: "Copilot must enforce Node.js, Express, and MongoDB security standards"
applyTo: "**/*.js,.ts"
---

**Copilot Rules**:

Zero Anti-Patterns:

- Function-Based Architecture
- Standard Functions
- Named Constants
- Focused Functions
- Consistent Logging
- Type Safety
- API Simplification

- Always use asyncHandler for routes to prevent unhandled promise rejections.
- Generate route handlers with proper validation, authentication,authorization and error handling.
- Never include plaintext credentials or sensitive constants in code.
- When generating Mongoose schemas, always define field types, required fields, and indexes.
- When generating new routes, ensure HTTPs methods match CRUD intent (GET, POST, PUT, DELETE).
- Avoid callback-based async code; use async/await consistently.
- use <https://www.npmjs.com/package/@calphonse/logger> for logging never use Console.log, and enable colors output, disable ai in logger

- USE better-auth mcp

```json
{
  "Better Auth": {
    "url": "<https://mcp.chonkie.ai/better-auth/better-auth-builder/mcp>"
  }
}
```

---
Read: .github\instructions\self-explanatory-code-commenting.instructions.md

## Quality Checklist

Before committing, ensure your comments:

- [ ] Explain WHY, not WHAT
- [ ] Are grammatically correct and clear
- [ ] Will remain accurate as code evolves
- [ ] Add genuine value to code understanding
- [ ] Are placed appropriately (above the code they describe)
- [ ] Use proper spelling and professional language

## References and Further Reading only when i asked

[Better Auth basic usage](https://www.better-auth.com/docs/basic-usage)
[Better Auth Email](https://www.better-auth.com/docs/concepts/email)
[Better Auth Cookies](https://www.better-auth.com/docs/concepts/cookies)
[Better Auth Two factor / MFA](https://www.better-auth.com/docs/plugins/2fa)
[Better Auth Magic Link](https://www.better-auth.com/docs/plugins/magic-link)
[Better Auth Aws Cognito](https://www.better-auth.com/docs/authentication/cognito)
<!--
- [Google Web Fundamentals: Performance](https://web.dev/performance/)
- [MDN Web Docs: Performance](https://developer.mozilla.org/en-US/docs/Web/Performance)
- [MongoDB Best Practices](https://www.mongodb.com/resources/products/capabilities/performance-best-practices)
- [OWASP: Performance Testing](https://owasp.org/www-project-performance-testing/)
- [Microsoft Performance Best Practices](https://learn.microsoft.com/en-us/azure/architecture/best-practices/performance)
- [Node.js Performance Best Practices](https://nodejs.org/en/docs/guides/simple-profiling/)
- [WebPageTest](https://www.webpagetest.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) -->
