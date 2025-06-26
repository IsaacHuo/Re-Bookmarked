export async function parseBookmarkFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      try {
        const html = e.target.result
        
        if (window.location.hostname !== 'localhost') {
          try {
            const response = await fetch('/api/parse', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ htmlContent: html })
            })
            
            if (response.ok) {
              resolve(await response.json())
              return
            }
          } catch {}
        }
        
        resolve(parseHTML(html))
      } catch (error) {
        reject(new Error('解析失败: ' + error.message))
      }
    }
    
    reader.onerror = () => reject(new Error('读取失败'))
    reader.readAsText(file, 'utf-8')
  })
}

function parseHTML(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const root = doc.querySelector('DL') || doc.querySelector('dl')
  
  if (!root) throw new Error('无效的书签文件')
  
  const stats = { total: 0, folders: 0, depth: 0 }
  const bookmarks = parseNode(root, 0, stats)
  
  return { bookmarks, ...stats }
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
  return {
    id: `link-${a.href}-${Date.now()}`,
    type: 'link',
    title: a.textContent.trim(),
    url: a.href,
    icon: a.getAttribute('ICON') ? `data:image/png;base64,${a.getAttribute('ICON')}` : getFavicon(a.href)
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

export function downloadJson(data, filename = 'bookmarks.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  download(blob, filename)
}

export function downloadCsv(bookmarks, filename = 'bookmarks.csv') {
  let csv = 'Path,Title,URL,Type\n'
  
  const process = (items, path = '') => {
    for (const item of items) {
      const fullPath = path ? `${path}/${item.title}` : item.title
      csv += `"${fullPath}","${item.title}","${item.url || ''}","${item.type}"\n`
      if (item.children) process(item.children, fullPath)
    }
  }
  
  process(bookmarks)
  const blob = new Blob([csv], { type: 'text/csv' })
  download(blob, filename)
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
