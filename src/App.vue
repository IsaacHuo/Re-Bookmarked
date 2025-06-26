<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-4xl mx-auto px-4 py-6">
        <h1 class="text-3xl font-bold text-gray-900">Re-Bookmarked</h1>
        <p class="text-gray-600 mt-2">书签解析器</p>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 py-8">
      <div class="card mb-8">
        <h2 class="text-xl font-semibold mb-4">上传书签</h2>
        
        <div 
          class="upload-area"
          :class="{ 'border-blue-400 bg-blue-50': isDragOver }"
          @drop="handleDrop"
          @dragover.prevent="isDragOver = true"
          @dragleave="isDragOver = false"
          @click="fileInput?.click()"
        >
          <input 
            ref="fileInput"
            type="file" 
            accept=".html,.htm"
            @change="e => selectedFile = e.target.files[0]"
            class="hidden"
          >
          
          <div class="text-center">
            <p class="text-lg text-gray-600 mb-2">拖拽HTML文件或点击选择</p>
            <p class="text-sm text-gray-500">支持Chrome、Firefox、Safari书签</p>
          </div>
        </div>

        <div v-if="selectedFile" class="mt-4 p-4 bg-blue-50 rounded-lg">
          <p class="text-sm text-blue-800">
            {{ selectedFile.name }} ({{ formatSize(selectedFile.size) }})
          </p>
        </div>

        <div class="mt-6 flex gap-4">
          <button 
            @click="parse"
            :disabled="!selectedFile || loading"
            class="btn-primary disabled:opacity-50"
          >
            {{ loading ? '解析中...' : '解析' }}
          </button>
          
          <button 
            @click="clear"
            v-if="selectedFile"
            class="btn-secondary"
          >
            清除
          </button>
        </div>
      </div>

      <div v-if="result" class="card">
        <h2 class="text-xl font-semibold mb-4">解析结果</h2>
        
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="bg-blue-50 p-4 rounded-lg text-center">
            <div class="text-2xl font-bold text-blue-600">{{ result.total }}</div>
            <div class="text-sm text-blue-800">书签</div>
          </div>
          <div class="bg-green-50 p-4 rounded-lg text-center">
            <div class="text-2xl font-bold text-green-600">{{ result.folders }}</div>
            <div class="text-sm text-green-800">文件夹</div>
          </div>
          <div class="bg-purple-50 p-4 rounded-lg text-center">
            <div class="text-2xl font-bold text-purple-600">{{ result.depth }}</div>
            <div class="text-sm text-purple-800">深度</div>
          </div>
        </div>

        <div class="max-h-96 overflow-y-auto border rounded-lg">
          <BookmarkTree :bookmarks="result.bookmarks" />
        </div>

        <div class="mt-6 flex gap-4">
          <button @click="downloadJson(result, `bookmarks-${Date.now()}.json`)" class="btn-primary">导出JSON</button>
          <button @click="downloadCsv(result.bookmarks, `bookmarks-${Date.now()}.csv`)" class="btn-secondary">导出CSV</button>
        </div>

        <!-- AI整理 -->
        <div class="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <h3 class="text-lg font-semibold mb-4 text-gray-800">🤖 AI智能整理</h3>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">整理策略</label>
            <select v-model="organizeStrategy" class="w-full p-2 border border-gray-300 rounded-md">
              <option value="category">按功能分类</option>
              <option value="domain">按网站域名</option>
              <option value="purpose">按使用目的</option>
              <option value="topic">按主题内容</option>
            </select>
          </div>
          
          <div class="flex gap-4">
            <button 
              @click="organizeWithAI"
              :disabled="organizing"
              class="btn-primary disabled:opacity-50"
            >
              {{ organizing ? '整理中...' : '开始AI整理' }}
            </button>
            
            <div v-if="organizing" class="flex items-center text-blue-600">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span class="text-sm">AI正在分析书签...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- AI整理结果 -->
      <div v-if="organizedResult" class="card mt-8">
        <h2 class="text-xl font-semibold mb-4">🎯 AI整理结果</h2>
        
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="bg-emerald-50 p-4 rounded-lg text-center">
            <div class="text-2xl font-bold text-emerald-600">{{ organizedResult.summary.totalFolders }}</div>
            <div class="text-sm text-emerald-800">分类文件夹</div>
          </div>
          <div class="bg-blue-50 p-4 rounded-lg text-center">
            <div class="text-2xl font-bold text-blue-600">{{ organizedResult.summary.totalBookmarks }}</div>
            <div class="text-sm text-blue-800">整理书签</div>
          </div>
          <div class="bg-purple-50 p-4 rounded-lg text-center">
            <div class="text-2xl font-bold text-purple-600">{{ organizedResult.summary.averageBookmarksPerFolder }}</div>
            <div class="text-sm text-purple-800">平均每文件夹</div>
          </div>
        </div>

        <div class="max-h-96 overflow-y-auto border rounded-lg bg-white">
          <BookmarkTree :bookmarks="organizedResult.organizedBookmarks" />
        </div>

        <div class="mt-6 flex gap-4">
          <button @click="downloadOrganizedHTMLFile" class="btn-primary bg-emerald-600 hover:bg-emerald-700">
            📥 下载整理后的书签HTML
          </button>
          <button @click="downloadJson(organizedResult, `bookmarks-organized-${Date.now()}.json`)" class="btn-secondary">
            导出JSON
          </button>
          <button @click="resetOrganization" class="btn-secondary border-orange-300 text-orange-700 hover:bg-orange-50">
            重新整理
          </button>
        </div>
      </div>

      <div v-if="error" class="card border-red-200 bg-red-50">
        <div class="text-red-800">错误: {{ error }}</div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BookmarkTree from './components/BookmarkTree.vue'
import { parseBookmarkFile, downloadJson, downloadCsv, organizeBookmarks, downloadOrganizedHTML } from './utils/bookmarkParser'

const selectedFile = ref(null)
const result = ref(null)
const loading = ref(false)
const error = ref('')
const isDragOver = ref(false)
const fileInput = ref(null)

const organizing = ref(false)
const organizedResult = ref(null)
const organizeStrategy = ref('category')

const handleDrop = (e) => {
  e.preventDefault()
  isDragOver.value = false
  const file = e.dataTransfer.files[0]
  if (file?.name.endsWith('.html') || file?.name.endsWith('.htm')) {
    selectedFile.value = file
    error.value = ''
  } else {
    error.value = '请选择HTML文件'
  }
}

const clear = () => {
  selectedFile.value = null
  result.value = null
  error.value = ''
  organizedResult.value = null
  if (fileInput.value) fileInput.value.value = ''
}

const parse = async () => {
  if (!selectedFile.value) return
  
  loading.value = true
  error.value = ''
  organizedResult.value = null
  
  try {
    result.value = await parseBookmarkFile(selectedFile.value)
  } catch (err) {
    error.value = err.message || '解析失败'
    result.value = null
  } finally {
    loading.value = false
  }
}

const organizeWithAI = async () => {
  if (!result.value?.bookmarks) {
    error.value = '请先解析书签文件'
    return
  }
  
  organizing.value = true
  error.value = ''
  
  try {
    organizedResult.value = await organizeBookmarks(result.value.bookmarks, organizeStrategy.value)
  } catch (err) {
    error.value = err.message || 'AI整理失败'
  } finally {
    organizing.value = false
  }
}

const downloadOrganizedHTMLFile = () => {
  if (!organizedResult.value?.html) {
    error.value = '没有整理结果可供下载'
    return
  }
  downloadOrganizedHTML(organizedResult.value.html)
}

const resetOrganization = () => {
  organizedResult.value = null
  organizeStrategy.value = 'category'
}

const formatSize = (bytes) => {
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(1) + sizes[i]
}
</script>
