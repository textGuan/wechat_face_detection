const { ipcRenderer } = require('electron')

const searchInput = document.getElementById('searchInput')
const resultsContainer = document.getElementById('resultsContainer')

let allItems = [
  { title: '计算器', subtitle: '应用程序', icon: '🧮', type: 'app' },
  { title: '记事本', subtitle: '应用程序', icon: '📝', type: 'app' },
  { title: 'Safari 浏览器', subtitle: '应用程序', icon: '🌐', type: 'app' },
  { title: '邮件', subtitle: '应用程序', icon: '📧', type: 'app' },
  { title: '音乐', subtitle: '应用程序', icon: '🎵', type: 'app' },
  { title: '照片', subtitle: '应用程序', icon: '📸', type: 'app' },
  { title: '设置', subtitle: '系统偏好设置', icon: '⚙️', type: 'app' },
  { title: '终端', subtitle: '应用程序', icon: '💻', type: 'app' },
  { title: 'GitHub', subtitle: 'https://github.com', icon: '🔗', type: 'website' },
  { title: 'Google', subtitle: 'https://google.com', icon: '🔍', type: 'website' },
  { title: 'Stack Overflow', subtitle: 'https://stackoverflow.com', icon: '💡', type: 'website' },
  { title: '文档', subtitle: '我的文档', icon: '📄', type: 'file' },
  { title: '下载', subtitle: '下载文件夹', icon: '📥', type: 'file' },
  { title: '桌面', subtitle: '桌面文件夹', icon: '🖥️', type: 'file' },
  { title: '项目文件夹', subtitle: '工作空间', icon: '📁', type: 'file' }
]

let currentResults = []
let selectedIndex = 0

function search(query) {
  if (!query.trim()) {
    currentResults = []
    renderResults()
    return
  }

  const lowerQuery = query.toLowerCase()
  currentResults = allItems.filter(item => 
    item.title.toLowerCase().includes(lowerQuery) ||
    item.subtitle.toLowerCase().includes(lowerQuery)
  )
  selectedIndex = 0
  renderResults()
}

function renderResults() {
  if (currentResults.length === 0) {
    resultsContainer.classList.remove('visible')
    ipcRenderer.send('resize-window', 60)
    return
  }

  resultsContainer.classList.add('visible')
  const maxItems = Math.min(currentResults.length, 8)
  const height = 60 + 12 + maxItems * 56
  ipcRenderer.send('resize-window', Math.min(height, 480))

  resultsContainer.innerHTML = currentResults.slice(0, 8).map((item, index) => `
    <div class="result-item ${index === selectedIndex ? 'selected' : ''}" data-index="${index}">
      <div class="result-icon">${item.icon}</div>
      <div class="result-info">
        <div class="result-title">${item.title}</div>
        <div class="result-subtitle">${item.subtitle}</div>
      </div>
    </div>
  `).join('')

  document.querySelectorAll('.result-item').forEach(el => {
    el.addEventListener('click', () => {
      const index = parseInt(el.dataset.index)
      selectItem(currentResults[index])
    })
  })
}

function selectItem(item) {
  console.log('Selected:', item)
  ipcRenderer.send('hide-window')
  searchInput.value = ''
  search('')
}

searchInput.addEventListener('input', (e) => {
  search(e.target.value)
})

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    ipcRenderer.send('hide-window')
    searchInput.value = ''
    search('')
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (currentResults.length > 0) {
      selectedIndex = Math.min(selectedIndex + 1, currentResults.length - 1)
      renderResults()
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (currentResults.length > 0) {
      selectedIndex = Math.max(selectedIndex - 1, 0)
      renderResults()
    }
  } else if (e.key === 'Enter') {
    if (currentResults.length > 0) {
      selectItem(currentResults[selectedIndex])
    }
  }
})

ipcRenderer.on('focus-search', () => {
  searchInput.focus()
  searchInput.select()
})
