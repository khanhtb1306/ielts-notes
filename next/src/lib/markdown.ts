// Port of vanilla mdToHtml from web/app.js — returns HTML string.
// Consumed by MarkdownRenderer via dangerouslySetInnerHTML (source-authored, trusted).

function esc(s: string): string {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (m) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]!)
  )
}

function attr(s: string): string {
  return esc(String(s == null ? "" : s))
}

function inline(s: string): string {
  return esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, src) => {
      const safeSrc = attr(src)
      return `<img src="${safeSrc}" alt="${attr(alt)}" loading="lazy" />`
    })
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, href) => {
      const isExternal = /^https?:/i.test(href)
      const target = isExternal ? ' target="_blank" rel="noopener"' : ""
      return `<a href="${attr(href)}"${target}>${label}</a>`
    })
}

export function slug(s: string): string {
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80)
}

export function mdToHtml(md: string): string {
  const lines = md.split(/\r?\n/)
  const out: string[] = []
  let i = 0

  function table() {
    const rows: string[] = []
    while (i < lines.length && /^\|.*\|\s*$/.test(lines[i])) rows.push(lines[i++])
    if (rows.length < 2) return
    const cells = (r: string) =>
      r
        .split("|")
        .slice(1, -1)
        .map((x) => x.trim())
    const head = cells(rows[0])
    const body = rows.slice(2).map(cells)
    out.push(
      '<div class="table-wrap"><table>' +
        "<thead><tr>" +
        head.map((h) => `<th>${inline(h)}</th>`).join("") +
        "</tr></thead>" +
        "<tbody>" +
        body.map((r) => "<tr>" + r.map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>").join("") +
        "</tbody></table></div>"
    )
  }

  function list(ordered: boolean) {
    const items: string[] = []
    const re = ordered ? /^\d+\.\s+(.+)/ : /^[-*]\s+(.+)/
    while (i < lines.length && re.test(lines[i])) items.push(lines[i++].replace(re, "$1"))
    const tag = ordered ? "ol" : "ul"
    out.push(`<${tag}>` + items.map((x) => `<li>${inline(x)}</li>`).join("") + `</${tag}>`)
  }

  function blockquote() {
    const buf: string[] = []
    while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ""))
    let kind: "tip" | "warn" = "tip"
    let title = ""
    const head = buf[0] && buf[0].match(/^\[!(warn|tip)\]\s*(.*)$/i)
    if (head) {
      kind = head[1].toLowerCase() as "tip" | "warn"
      title = head[2]
      buf.shift()
    }
    out.push(`<div class="callout ${kind}">${title ? `<b>${inline(title)}</b>` : ""}${mdToHtml(buf.join("\n"))}</div>`)
  }

  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) {
      i++
      continue
    }
    const au = line.match(/^\[\[audio:(\d+)\]\]\s*$/)
    if (au) {
      out.push(`<div class="ielts-audio-slot" data-audio-num="${au[1]}"></div>`)
      i++
      continue
    }
    if (/^>\s?/.test(line)) {
      blockquote()
      continue
    }
    if (/^\|.*\|\s*$/.test(line)) {
      table()
      continue
    }
    const h = line.match(/^(#{1,4})\s+(.+)/)
    if (h) {
      const lv = h[1].length
      out.push(`<h${lv} id="${slug(h[2])}">${inline(h[2])}</h${lv}>`)
      i++
      continue
    }
    if (/^\d+\.\s+/.test(line)) {
      list(true)
      continue
    }
    if (/^[-*]\s+/.test(line)) {
      list(false)
      continue
    }
    const paras: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,4})\s+/.test(lines[i]) &&
      !/^\|.*\|\s*$/.test(lines[i]) &&
      !/^[-*]\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !/^\[\[audio:\d+\]\]/.test(lines[i])
    ) {
      paras.push(lines[i++])
    }
    out.push(`<p>${inline(paras.join(" "))}</p>`)
  }

  return out.join("\n")
}
