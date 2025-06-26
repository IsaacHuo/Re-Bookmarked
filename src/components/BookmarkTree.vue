<template>
  <div class="text-sm">
    <div v-for="item in bookmarks" :key="item.id || item.title" class="border-t border-gray-100">
      <div v-if="item.type === 'folder'" class="folder">
        <div class="flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer" @click="item.expanded = !item.expanded">
          <span class="mr-2">{{ item.expanded ? '📂' : '📁' }}</span>
          <span class="font-medium">{{ item.title }}</span>
          <span class="ml-auto text-xs text-gray-500">({{ item.children?.length || 0 }})</span>
        </div>
        <div v-if="item.expanded && item.children" class="ml-6 border-l border-gray-200">
          <BookmarkTree :bookmarks="item.children" />
        </div>
      </div>

      <div v-else class="flex items-center py-2 px-3 hover:bg-gray-50">
        <img v-if="item.icon" :src="item.icon" class="h-4 w-4 mr-2" @error="item.icon = null">
        <span v-else class="mr-2">🔗</span>
        <div class="flex-1 min-w-0">
          <a :href="item.url" target="_blank" class="text-blue-600 hover:underline font-medium truncate block">
            {{ item.title }}
          </a>
          <div class="text-xs text-gray-500 truncate">{{ item.url }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  bookmarks: { type: Array, default: () => [] }
})
</script>
