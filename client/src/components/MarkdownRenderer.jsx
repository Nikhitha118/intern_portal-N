"use client"
import { useState } from "react"
import { Copy, Check, Terminal, ExternalLink } from "lucide-react"

/**
 * Clean & normalize markdown text:
 * - Unifies line endings
 * - Expands squished numbered/bullet lists onto separate lines
 * - Auto-closes orphaned double asterisks so syntax markers are never exposed raw
 */
function normalizeMarkdown(text) {
  if (!text) return ""
  let clean = String(text).replace(/\r\n/g, "\n")

  // Expand squished list items onto separate lines: e.g. "Intro: 1. **Step** ... 2. **Step** ..."
  clean = clean.replace(/([^\n])\s+(\d+[\.\)]\s+\*\*)/g, "$1\n\n$2")
  clean = clean.replace(/([^\n])\s+([•\-\*]\s+\*\*)/g, "$1\n$2")
  clean = clean.replace(/([^\n])\s*(•|\*•)\s+/g, "$1\n• ")
  clean = clean.replace(/([^\n])\s*👉\s+/g, "$1\n\n👉 ")

  // Auto-close dangling unclosed double asterisks on a per-line basis
  const lines = clean.split("\n").map(line => {
    const doubleAsteriskCount = (line.match(/\*\*/g) || []).length
    if (doubleAsteriskCount % 2 !== 0) {
      return line + "**"
    }
    return line
  })

  return lines.join("\n")
}

/**
 * Robust regex for inline Markdown tokens:
 * - ***bold-italic*** or ___bold-italic___
 * - **bold** or __bold__
 * - `inline code`
 * - [link text](url)
 * - ~~strikethrough~~
 * - *italic* or _italic_
 */
const INLINE_REGEX = /(\*\*\*[\s\S]+?\*\*\*|___[\s\S]+?___|\*\*[^\*\n]+?\*\*|__[^_\n]+?__|`[^`\n]+`|\[([^\]]+)\]\(([^)]+)\)|\*[^\*\n]+?\*|_[^_\n]+?_|~~[\s\S]+?~~)/g

function sanitizeHref(href) {
  if (!href) return "#"
  const clean = href.trim()
  if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("/") || clean.startsWith("#")) {
    return clean
  }
  return "#"
}

export function renderInlineTokens(text) {
  if (!text) return null
  const tokens = []
  let lastIndex = 0
  let match
  let key = 0

  while ((match = INLINE_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index))
    }
    const full = match[0]

    if ((full.startsWith("***") && full.endsWith("***")) || (full.startsWith("___") && full.endsWith("___"))) {
      tokens.push(
        <strong key={`bi-${key++}`} className="font-bold text-white">
          <em className="italic text-cyan-300">{full.slice(3, -3)}</em>
        </strong>
      )
    } else if ((full.startsWith("**") && full.endsWith("**")) || (full.startsWith("__") && full.endsWith("__"))) {
      tokens.push(
        <strong key={`b-${key++}`} className="font-semibold text-white tracking-wide">
          {full.slice(2, -2)}
        </strong>
      )
    } else if (full.startsWith("`") && full.endsWith("`")) {
      tokens.push(
        <code
          key={`c-${key++}`}
          className="px-1.5 py-0.5 rounded-md bg-black/70 text-cyan-300 font-mono text-[12px] sm:text-[13px] border border-cyan-500/30 font-medium"
        >
          {full.slice(1, -1)}
        </code>
      )
    } else if (full.startsWith("[") && match[2] && match[3]) {
      const safeHref = sanitizeHref(match[3])
      tokens.push(
        <a
          key={`a-${key++}`}
          href={safeHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline underline-offset-2 font-medium transition"
        >
          {match[2]}
          <ExternalLink size={11} className="inline opacity-75" />
        </a>
      )
    } else if (full.startsWith("~~") && full.endsWith("~~")) {
      tokens.push(
        <del key={`del-${key++}`} className="line-through text-slate-400">
          {full.slice(2, -2)}
        </del>
      )
    } else if ((full.startsWith("*") && full.endsWith("*")) || (full.startsWith("_") && full.endsWith("_"))) {
      tokens.push(
        <em key={`i-${key++}`} className="italic text-slate-300">
          {full.slice(1, -1)}
        </em>
      )
    } else {
      tokens.push(full)
    }

    lastIndex = INLINE_REGEX.lastIndex
  }

  if (lastIndex < text.length) {
    tokens.push(text.slice(lastIndex))
  }

  return tokens
}

function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-cyan-500/30 bg-[#030712] shadow-xl">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#0b1329] border-b border-cyan-500/20 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-cyan-400 uppercase tracking-wider font-semibold">
          <Terminal size={12} className="text-cyan-400" />
          <span>{lang || "code"}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:text-white bg-slate-800/80 hover:bg-slate-700/80 text-[11px] text-slate-300 transition cursor-pointer border border-slate-700/50"
        >
          {copied ? (
            <>
              <Check size={11} className="text-green-400" />
              <span className="text-green-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={11} className="text-slate-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 text-cyan-200 font-mono text-[12px] sm:text-[13px] leading-relaxed overflow-x-auto whitespace-pre selection:bg-cyan-500/30 selection:text-white">
        <code>{code}</code>
      </pre>
    </div>
  )
}

/**
 * Pure React AST block parser
 */
function parseBlocks(normalizedText) {
  const lines = normalizedText.split("\n")
  const blocks = []

  let inCodeBlock = false
  let codeLang = ""
  let codeLines = []

  let currentList = null // { type: 'ol' | 'ul', items: [] }

  const flushList = () => {
    if (currentList && currentList.items.length > 0) {
      blocks.push(currentList)
      currentList = null
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Handle code block fences: ```lang
    if (trimmed.startsWith("```")) {
      flushList()
      if (inCodeBlock) {
        blocks.push({
          type: "code",
          lang: codeLang,
          code: codeLines.join("\n")
        })
        inCodeBlock = false
        codeLang = ""
        codeLines = []
      } else {
        inCodeBlock = true
        codeLang = trimmed.slice(3).trim().toLowerCase()
        codeLines = []
      }
      continue
    }

    if (inCodeBlock) {
      codeLines.push(line)
      continue
    }

    // Blank line
    if (!trimmed) {
      flushList()
      blocks.push({ type: "spacer" })
      continue
    }

    // Headings: #, ##, ###, ####
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)/)
    if (headingMatch) {
      flushList()
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2]
      })
      continue
    }

    // Numbered list: 1. or 1)
    const numberMatch = trimmed.match(/^(\d+)[\.\)]\s+(.+)/)
    if (numberMatch) {
      if (!currentList || currentList.type !== "ol") {
        flushList()
        currentList = { type: "ol", items: [] }
      }
      currentList.items.push({
        num: numberMatch[1],
        text: numberMatch[2]
      })
      continue
    }

    // Bullet list: •, -, *, or +
    const bulletMatch = trimmed.match(/^([•\-\*\+])\s+(.+)/)
    if (bulletMatch) {
      if (!currentList || currentList.type !== "ul") {
        flushList()
        currentList = { type: "ul", items: [] }
      }
      currentList.items.push({
        bullet: bulletMatch[1],
        text: bulletMatch[2]
      })
      continue
    }

    // Blockquote or Callout
    if (trimmed.startsWith(">") || /^(👉|🎯|💡|⚠️|📌|✅|❌|ℹ️|⏳|📋|📊|🕒|🧑‍🏫|📖|🌐|💻|⚙️|🤖)/.test(trimmed)) {
      flushList()
      let content = trimmed
      let icon = null
      if (trimmed.startsWith(">")) {
        content = trimmed.slice(1).trim()
      } else {
        const emojiMatch = trimmed.match(/^([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|👉|🎯|💡|⚠️|📌|✅|❌|ℹ️|⏳|📋|📊|🕒|🧑‍🏫|📖|🌐|💻|⚙️|🤖)\s*(.*)/u)
        if (emojiMatch) {
          icon = emojiMatch[1]
          content = emojiMatch[2]
        }
      }
      blocks.push({
        type: "callout",
        icon,
        text: content
      })
      continue
    }

    // Regular paragraph line
    flushList()
    blocks.push({
      type: "paragraph",
      text: trimmed
    })
  }

  flushList()

  // Gracefully handle unclosed code block if truncated
  if (inCodeBlock && codeLines.length > 0) {
    blocks.push({
      type: "code",
      lang: codeLang,
      code: codeLines.join("\n")
    })
  }

  return blocks
}

/**
 * Main MarkdownRenderer component
 * Safely renders markdown into native React elements with 14-16px readable typography,
 * styled code blocks, numbered step pills, and zero raw markdown artifacts.
 */
export default function MarkdownRenderer({ text, className = "" }) {
  if (!text) return null

  const normalized = normalizeMarkdown(text)
  const blocks = parseBlocks(normalized)

  return (
    <div className={`space-y-1.5 text-[14px] sm:text-[15px] leading-relaxed text-slate-200 ${className}`}>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "spacer":
            return <div key={`sp-${idx}`} className="h-1.5" />

          case "heading": {
            if (block.level === 1) {
              return (
                <h2
                  key={`h1-${idx}`}
                  className="text-base sm:text-lg font-bold text-white mt-3.5 mb-1.5 border-b border-cyan-500/25 pb-1 flex items-center gap-2"
                >
                  {renderInlineTokens(block.text)}
                </h2>
              )
            }
            if (block.level === 2) {
              return (
                <h3
                  key={`h2-${idx}`}
                  className="text-[15px] sm:text-base font-bold text-cyan-200 mt-3 mb-1"
                >
                  {renderInlineTokens(block.text)}
                </h3>
              )
            }
            if (block.level === 3) {
              return (
                <h4
                  key={`h3-${idx}`}
                  className="text-[14px] sm:text-[15px] font-semibold text-cyan-300 mt-2 mb-0.5"
                >
                  {renderInlineTokens(block.text)}
                </h4>
              )
            }
            return (
              <h5
                key={`h4-${idx}`}
                className="text-[13px] sm:text-[14px] font-semibold text-purple-300 mt-2 mb-0.5"
              >
                {renderInlineTokens(block.text)}
              </h5>
            )
          }

          case "ol":
            return (
              <ol key={`ol-${idx}`} className="my-2.5 space-y-2.5 list-none p-0">
                {block.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[14px] sm:text-[15px] leading-relaxed">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold text-xs shrink-0 mt-0.5 shadow-sm">
                      {item.num}
                    </span>
                    <div className="flex-1 text-slate-200 pt-0.5">
                      {renderInlineTokens(item.text)}
                    </div>
                  </li>
                ))}
              </ol>
            )

          case "ul":
            return (
              <ul key={`ul-${idx}`} className="my-2 space-y-2 list-none p-0">
                {block.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[14px] sm:text-[15px] leading-relaxed">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 mt-2 shrink-0 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                    <div className="flex-1 text-slate-200">
                      {renderInlineTokens(item.text)}
                    </div>
                  </li>
                ))}
              </ul>
            )

          case "code":
            return <CodeBlock key={`cb-${idx}`} lang={block.lang} code={block.code} />

          case "callout":
            return (
              <div
                key={`co-${idx}`}
                className="my-2.5 p-3 sm:p-3.5 rounded-xl bg-cyan-950/35 border border-cyan-500/30 text-cyan-100 text-[13px] sm:text-[14px] leading-relaxed flex items-start gap-2.5 shadow-inner"
              >
                {block.icon && <span className="text-base shrink-0 select-none">{block.icon}</span>}
                <div className="flex-1">{renderInlineTokens(block.text)}</div>
              </div>
            )

          case "paragraph":
          default:
            return (
              <p
                key={`p-${idx}`}
                className="my-1.5 text-slate-200 leading-relaxed text-[14px] sm:text-[15px] break-words"
              >
                {renderInlineTokens(block.text)}
              </p>
            )
        }
      })}
    </div>
  )
}

