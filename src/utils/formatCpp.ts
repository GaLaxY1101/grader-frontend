/**
 * Lightweight C/C++ formatter — re-indents based on braces, normalizes whitespace.
 * Not as thorough as clang-format, but works in the browser without any dependency.
 */
export function formatCpp(source: string, indentSize = 4): string {
  if (!source.trim()) return source;

  const indentUnit = ' '.repeat(indentSize);
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let depth = 0;
  let inBlockComment = false;

  for (const rawLine of lines) {
    let line = rawLine.replace(/\s+$/g, '');
    const trimmed = line.trim();

    if (trimmed === '') {
      out.push('');
      continue;
    }

    // Preprocessor directives stick to column 0
    if (!inBlockComment && trimmed.startsWith('#')) {
      out.push(trimmed);
      continue;
    }

    // Track block comments to avoid mis-counting braces inside them
    let closersBefore = 0;
    let openers = 0;
    let closers = 0;

    let i = 0;
    let leadingDoneBefore = false;
    while (i < trimmed.length) {
      const ch = trimmed.charAt(i);
      const next = trimmed.charAt(i + 1);

      if (inBlockComment) {
        if (ch === '*' && next === '/') {
          inBlockComment = false;
          i += 2;
          continue;
        }
        i++;
        continue;
      }

      if (ch === '/' && next === '*') {
        inBlockComment = true;
        i += 2;
        continue;
      }
      if (ch === '/' && next === '/') break;
      if (ch === '"' || ch === "'") {
        const quote = ch;
        i++;
        while (i < trimmed.length && trimmed.charAt(i) !== quote) {
          if (trimmed.charAt(i) === '\\') i++;
          i++;
        }
        i++;
        continue;
      }

      if (ch === '{') {
        openers++;
        leadingDoneBefore = true;
      } else if (ch === '}') {
        if (!leadingDoneBefore) closersBefore++;
        closers++;
      } else if (!/\s/.test(ch)) {
        leadingDoneBefore = true;
      }
      i++;
    }

    const indentDepth = Math.max(0, depth - closersBefore);
    line = indentUnit.repeat(indentDepth) + trimmed;
    out.push(line);

    depth = depth + openers - closers;
    if (depth < 0) depth = 0;
  }

  return out.join('\n');
}
