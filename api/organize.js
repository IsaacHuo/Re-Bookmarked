import OpenAI from "openai"

const client = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY || 'sk-e63c6b6f4fd1418383be5ab633539397',
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
})

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { bookmarks, organizeStrategy = 'category' } = req.body
    if (!bookmarks) return res.status(400).json({ error: 'Bookmarks required' })

    const result = await organizeBookmarks(bookmarks, organizeStrategy)
    res.status(200).json(result)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Failed', details: error.message })
  }
}

async function organizeBookmarks(bookmarks, strategy) {
  try {
    const links = extractLinks(bookmarks)
    
    if (links.length === 0) throw new Error('No valid bookmarks found')
    
    console.log(`Total bookmarks: ${links.length}`)
    
    if (links.length <= 50) {
      return await processBookmarks(links, strategy)
    }
    
    const batches = []
    const batchSize = 50
    for (let i = 0; i < links.length; i += batchSize) {
      batches.push(links.slice(i, i + batchSize))
    }
    
    console.log(`Processing ${batches.length} batches`)
    
    const results = []
    for (let i = 0; i < batches.length; i++) {
      try {
        console.log(`Batch ${i + 1}/${batches.length}`)
        const batchResult = await processBookmarks(batches[i], strategy)
        results.push(batchResult)
        
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      } catch (error) {
        console.error(`Batch ${i + 1} failed:`, error)
      }
    }
    
    if (results.length === 0) {
      throw new Error('All batches failed')
    }
    
    return combineResults(results, links.length)
    
  } catch (error) {
    console.error('AI error:', error)
    throw new Error('AI failed: ' + error.message)
  }
}

async function processBookmarks(links, strategy) {
  const prompt = buildPrompt(links, strategy)
  
  const response = await client.chat.completions.create({
    model: "qwen-turbo",
    messages: [
      { role: "system", content: "You are a bookmark organizer. Return only Chrome bookmark HTML format." },
      { role: "user", content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 4000
  })

  const html = response.choices[0].message.content
  const structure = parseHTML(html)
  
  return {
    html,
    organizedBookmarks: structure,
    summary: {
      totalFolders: countFolders(structure),
      totalBookmarks: countBookmarks(structure),
      averageBookmarksPerFolder: Math.round(countBookmarks(structure) / Math.max(countFolders(structure), 1))
    }
  }
}

function combineResults(results, totalBookmarks) {
  let combinedHTML = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`
  
  const allStructures = []
  let totalFolders = 0
  let processedBookmarks = 0
  
  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    
    const html = result.html
    const contentMatch = html.match(/<DL><p>([\s\S]*?)<\/DL><p>/)
    if (contentMatch) {
      combinedHTML += `<DT><H3>Group ${i + 1}</H3>\n<DL><p>\n`
      combinedHTML += contentMatch[1]
      combinedHTML += `</DL><p>\n`
    }
    
    allStructures.push(...result.organizedBookmarks)
    totalFolders += result.summary.totalFolders
    processedBookmarks += result.summary.totalBookmarks
  }
  
  combinedHTML += `</DL><p>`
  
  return {
    html: combinedHTML,
    organizedBookmarks: allStructures,
    summary: {
      totalFolders,
      totalBookmarks: processedBookmarks,
      averageBookmarksPerFolder: Math.round(processedBookmarks / Math.max(totalFolders, 1)),
      originalCount: totalBookmarks,
      batchCount: results.length
    }
  }
}

function extractLinks(bookmarks) {
  const links = []
  let totalItems = 0
  let validLinks = 0
  let invalidLinks = 0
  
  function traverse(items) {
    for (const item of items) {
      totalItems++
      if (item.type === 'link' && item.url && item.title) {
        // Accept more URL schemes
        if (item.url.startsWith('http') || item.url.startsWith('https') || item.url.startsWith('ftp')) {
          links.push({ 
            title: item.title.substring(0, 60).trim(), // Increased from 40 to 60
            url: item.url.substring(0, 120) // Increased from 80 to 120
          })
          validLinks++
        } else {
          invalidLinks++
          console.log(`Skipped invalid URL: ${item.url}`)
        }
      } else if (item.type === 'folder' && item.children) {
        traverse(item.children)
      } else if (item.type === 'link') {
        invalidLinks++
        console.log(`Skipped link - missing title or URL:`, { title: !!item.title, url: !!item.url })
      }
    }
  }
  
  traverse(bookmarks)
  console.log(`Link extraction stats: Total items: ${totalItems}, Valid links: ${validLinks}, Invalid: ${invalidLinks}`)
  return links
}

function buildPrompt(links, strategy) {
  const linkList = links.map(link => `${link.title}|${link.url}`).join('\n')
  
  return `Organize ${links.length} bookmarks by ${strategy}:

${linkList}

Output Chrome HTML:
<!DOCTYPE NETSCAPE-Bookmark-file-1>
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
<DT><H3>Category</H3>
<DL><p>
<DT><A HREF="url" ADD_DATE="1700000000">title</A>
</DL><p>
</DL><p>`
}

function parseHTML(html) {
  const bookmarks = []
  const lines = html.split('\n')
  const stack = [{ children: bookmarks }]
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    if (trimmed.includes('<H3>')) {
      const title = trimmed.match(/<H3[^>]*>([^<]+)<\/H3>/)?.[1] || 'Folder'
      const folder = { type: 'folder', title, children: [] }
      stack[stack.length - 1].children.push(folder)
      stack.push(folder)
    } else if (trimmed.includes('<A HREF=')) {
      const urlMatch = trimmed.match(/HREF="([^"]+)"/)
      const titleMatch = trimmed.match(/>([^<]+)<\/A>/)
      if (urlMatch && titleMatch) {
        stack[stack.length - 1].children.push({
          type: 'link',
          title: titleMatch[1],
          url: urlMatch[1]
        })
      }
    } else if (trimmed === '</DL><p>') {
      if (stack.length > 1) stack.pop()
    }
  }
  
  return bookmarks
}

function countFolders(items) {
  let count = 0
  for (const item of items) {
    if (item.type === 'folder') {
      count++
      if (item.children) count += countFolders(item.children)
    }
  }
  return count
}

function countBookmarks(items) {
  let count = 0
  for (const item of items) {
    if (item.type === 'link') {
      count++
    } else if (item.type === 'folder' && item.children) {
      count += countBookmarks(item.children)
    }
  }
  return count
}
