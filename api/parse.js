import { JSDOM } from 'jsdom'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { htmlContent } = req.body
    if (!htmlContent) return res.status(400).json({ error: 'HTML content required' })

    res.status(200).json(parseHTML(htmlContent))
  } catch (error) {
    res.status(500).json({ error: 'Parse failed', details: error.message })
  }
}

function parseHTML(html) {
  const doc = new JSDOM(html).window.document
  const root = doc.querySelector('DL') || doc.querySelector('dl')
  if (!root) throw new Error('Invalid bookmark file')

  const stats = { total: 0, folders: 0, depth: 0 }
  console.log('Starting HTML parsing...')
  const result = { bookmarks: parseNode(root, 0, stats), ...stats }
  console.log(`Parse complete: ${stats.total} bookmarks, ${stats.folders} folders`)
  return result
}

function parseNode(node, depth, stats) {
  stats.depth = Math.max(stats.depth, depth)
  const bookmarks = []
  
  for (const child of node.children) {
    if (child.tagName !== 'DT') continue
    
    const element = child.firstElementChild
    if (!element) continue
    
    if (element.tagName === 'H3') {
      const folder = parseFolder(child, depth, stats)
      if (folder) {
        bookmarks.push(folder)
        stats.folders++
      }
    } else if (element.tagName === 'A') {
      const bookmark = parseLink(element)
      if (bookmark) {
        bookmarks.push(bookmark)
        stats.total++
      }
    }
  }
  
  return bookmarks
}

function parseFolder(dt, depth, stats) {
  const h3 = dt.querySelector('H3')
  if (!h3) return null
  
  const title = h3.textContent.trim()
  let children = []
  
  const childDL = dt.querySelector('DL')
  if (childDL) {
    children = parseNode(childDL, depth + 1, stats)
  } else {
    let nextSibling = dt.nextElementSibling
    while (nextSibling) {
      if (nextSibling.tagName === 'DL') {
        children = parseNode(nextSibling, depth + 1, stats)
        break
      } else if (nextSibling.tagName === 'DT') {
        break
      }
      nextSibling = nextSibling.nextElementSibling
    }
  }
  
  return {
    id: `folder-${title}-${Date.now()}`,
    type: 'folder',
    title,
    children,
    expanded: false
  }
}

function parseLink(a) {
  if (!a.href || !a.textContent.trim()) {
    console.log('Skipping invalid link:', { href: a.href, text: a.textContent })
    return null
  }
  
  return {
    id: `link-${a.href}-${Date.now()}`,
    type: 'link',
    title: a.textContent.trim(),
    url: a.href,
    icon: getFavicon(a.href)
  }
}

function getFavicon(url) {
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}`
  } catch {
    return null
  }
}
