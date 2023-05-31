
export function getNoteBody(frontMatter: [string, string][], text: string): string {
  return `
---
${frontMatter.map(([name, value]) => `${name}: ${value}`).join('\n')}
---

${text}
`
}
