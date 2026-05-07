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

let clipboardHistory = [
  { content: '你好，这是剪贴板内容1', timestamp: Date.now() - 60000, type: 'text' },
  { content: 'www.example.com', timestamp: Date.now() - 120000, type: 'url' },
  { content: '1234567890', timestamp: Date.now() - 180000, type: 'text' }
]

let snippets = [
  { 
    trigger: ';email', 
    content: 'user@example.com', 
    description: '我的邮箱',
    type: 'snippet'
  },
  { 
    trigger: ';addr', 
    content: '北京市朝阳区某某路123号', 
    description: '家庭地址',
    type: 'snippet'
  },
  { 
    trigger: ';tel', 
    content: '138-0000-0000', 
    description: '手机号码',
    type: 'snippet'
  },
  { 
    trigger: ';sig', 
    content: '祝好！\n张三\n2024年1月1日', 
    description: '邮件签名',
    type: 'snippet'
  },
  { 
    trigger: ';cmd', 
    content: 'git status && git add . && git commit -m ""', 
    description: 'Git 提交流程',
    type: 'snippet'
  }
]

let currentResults = []
let selectedIndex = 0

function getItemIcon(item) {
  if (item.type === 'clipboard') {
    return '📋'
  } else if (item.type === 'snippet') {
    return '⚡'
  }
  return item.icon
}

function getItemTitle(item) {
  if (item.type === 'clipboard') {
    const preview = item.content.substring(0, 50)
    return preview + (item.content.length > 50 ? '...' : '')
  } else if (item.type === 'snippet') {
    return item.trigger
  }
  return item.title
}

function getItemSubtitle(item) {
  if (item.type === 'clipboard') {
    return '剪贴板历史'
  } else if (item.type === 'snippet') {
    return item.description
  }
  return item.subtitle
}

function getTimeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return '刚刚'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  return `${days}天前`
}

function search(query) {
  if (!query.trim()) {
    currentResults = []
    renderResults()
    return
  }

  const lowerQuery = query.toLowerCase()
  let results = []

  results = results.concat(allItems.filter(item => 
    item.title.toLowerCase().includes(lowerQuery) ||
    item.subtitle.toLowerCase().includes(lowerQuery)
  ))

  if (query.startsWith(';')) {
    const snippetQuery = query.toLowerCase()
    results = results.concat(snippets.filter(snippet => 
      snippet.trigger.toLowerCase().includes(snippetQuery) ||
      snippet.description.toLowerCase().includes(snippetQuery)
    ))
  } else if (query.startsWith(':')) {
    const clipQuery = query.substring(1).toLowerCase()
    results = results.concat(clipboardHistory.filter(clip => 
      clip.content.toLowerCase().includes(clipQuery)
    ).map(clip => ({
      ...clip,
      type: 'clipboard',
      title: clip.content,
      subtitle: getTimeAgo(clip.timestamp)
    })))
  } else {
    results = results.concat(clipboardHistory.map(clip => ({
      ...clip,
      type: 'clipboard',
      title: clip.content,
      subtitle: getTimeAgo(clip.timestamp)
    })))
    results = results.concat(snippets)
  }

  currentResults = results.slice(0, 10)
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
      <div class="result-icon ${item.type === 'clipboard' ? 'clipboard-icon' : item.type === 'snippet' ? 'snippet-icon' : ''}">${getItemIcon(item)}</div>
      <div class="result-info">
        <div class="result-title">${getItemTitle(item)}</div>
        <div class="result-subtitle">${getItemSubtitle(item)}</div>
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
  
  if (item.type === 'snippet') {
    console.log('插入 snippet:', item.content)
    ipcRenderer.send('insert-text', item.content)
  } else if (item.type === 'clipboard') {
    console.log('复制剪贴板:', item.content)
    ipcRenderer.send('copy-to-clipboard', item.content)
  } else {
    console.log('Selected:', item)
  }
  
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

ipcRenderer.on('clipboard-update', (event, text) => {
  clipboardHistory.unshift({
    content: text,
    timestamp: Date.now(),
    type: 'text'
  })
  if (clipboardHistory.length > 50) {
    clipboardHistory = clipboardHistory.slice(0, 50)
  }
})
