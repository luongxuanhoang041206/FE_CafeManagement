;(function () {
  const API_URL = 'https://cafemanagement-rgd5.onrender.com/products'
  const state = {
    products: [],
    loaded: false,
    loading: false,
  }

  const quickPrompts = [
    'Món nào ít ngọt?',
    'Có gì dưới 40k?',
    'Tôi muốn món dễ uống',
    'Cần món tỉnh táo',
  ]

  const templates = {
    welcome:
      'Nhập nhu cầu để xem món phù hợp. Ví dụ: "món ít ngọt", "dưới 40k", hoặc "cần món tỉnh táo".',
    empty:
      'Chưa tìm thấy món phù hợp. Hãy thử lại với mức giá, vị hoặc nhu cầu khác.',
    loading: 'Đang tải menu...',
    loadError: 'Không tải được menu lúc này.',
    loginHint: 'Cần đăng nhập để thêm món vào giỏ.',
  }

  function normalizeText(value) {
    return (value || '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0)
  }

  function ensureChatbot() {
    if (document.getElementById('clientChatbotRoot')) return

    const style = document.createElement('style')
    style.id = 'client-chatbot-style'
    style.textContent = `
      .client-chatbot-root { position: fixed; right: 14px; bottom: 108px; z-index: 9500; font-family: 'Baloo 2', sans-serif; }
      .client-chatbot-toggle { border: none; border-radius: 999px; background: linear-gradient(135deg, #2c1a0e, #6f4e37); color: #fff; min-width: 64px; height: 64px; padding: 0 18px; box-shadow: 0 18px 40px rgba(44,26,14,0.25); cursor: pointer; display: flex; align-items: center; gap: 10px; transition: transform 0.18s ease, box-shadow 0.18s ease; }
      .client-chatbot-toggle:hover { transform: translateY(-2px); box-shadow: 0 22px 44px rgba(44,26,14,0.3); }
      .client-chatbot-toggle-label { font-size: 13px; font-weight: 700; letter-spacing: 0.2px; }
      .client-chatbot-panel { position: absolute; right: 0; bottom: 78px; width: min(360px, calc(100vw - 24px)); height: 520px; background: #fffaf5; border: 1px solid rgba(111,78,55,0.18); border-radius: 24px; box-shadow: 0 28px 80px rgba(44,26,14,0.2); overflow: hidden; display: none; }
      .client-chatbot-panel.open { display: flex; flex-direction: column; }
      .client-chatbot-header { padding: 18px 18px 14px; background: linear-gradient(140deg, #2c1a0e, #4c2f1c); color: #fff; }
      .client-chatbot-title { font-size: 17px; font-weight: 700; }
      .client-chatbot-subtitle { margin-top: 4px; font-size: 12px; opacity: 0.78; line-height: 1.4; }
      .client-chatbot-body { flex: 1; overflow-y: auto; padding: 16px 14px 10px; background: radial-gradient(circle at top, rgba(245,240,232,0.95), #fffaf5 52%); }
      .client-chatbot-row { display: flex; margin-bottom: 12px; }
      .client-chatbot-row.bot { justify-content: flex-start; }
      .client-chatbot-row.user { justify-content: flex-end; }
      .client-chatbot-bubble { max-width: 88%; border-radius: 18px; padding: 12px 14px; font-size: 14px; line-height: 1.55; white-space: pre-line; box-shadow: 0 10px 24px rgba(44,26,14,0.06); }
      .client-chatbot-row.bot .client-chatbot-bubble { background: #fff; color: #3d2b1f; border-top-left-radius: 8px; }
      .client-chatbot-row.user .client-chatbot-bubble { background: #2c1a0e; color: #fff; border-top-right-radius: 8px; }
      .client-chatbot-suggestions { display: grid; gap: 10px; margin: 8px 0 16px; }
      .client-chatbot-card { background: #fff; border: 1px solid #eee1d3; border-radius: 18px; padding: 12px; }
      .client-chatbot-card-name { font-size: 14px; font-weight: 700; color: #2c1a0e; }
      .client-chatbot-card-meta { margin-top: 4px; font-size: 12px; color: #8b6d57; }
      .client-chatbot-card-reason { margin-top: 8px; font-size: 13px; color: #5f4b3d; line-height: 1.5; }
      .client-chatbot-card-actions { margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap; }
      .client-chatbot-chip, .client-chatbot-add { border: none; border-radius: 999px; padding: 8px 12px; font-size: 12px; font-weight: 700; cursor: pointer; }
      .client-chatbot-chip { background: #f5ede5; color: #5f4635; }
      .client-chatbot-add { background: #2c1a0e; color: #fff; }
      .client-chatbot-quick { padding: 0 14px 12px; display: flex; gap: 8px; flex-wrap: wrap; }
      .client-chatbot-input-wrap { border-top: 1px solid #f0e3d7; background: #fff; padding: 12px; display: grid; grid-template-columns: 1fr auto; gap: 10px; }
      .client-chatbot-input { border: 1px solid #e7d8c7; border-radius: 14px; padding: 12px 14px; font-size: 14px; outline: none; }
      .client-chatbot-input:focus { border-color: #8b5e3c; box-shadow: 0 0 0 3px rgba(111,78,55,0.12); }
      .client-chatbot-send { border: none; border-radius: 14px; background: #8b5e3c; color: #fff; padding: 0 16px; font-size: 13px; font-weight: 700; cursor: pointer; }
      @media (max-width: 640px) {
        .client-chatbot-root { right: 12px; bottom: 88px; left: 12px; }
        .client-chatbot-panel { right: 0; left: 0; width: auto; height: min(72vh, 540px); bottom: 76px; }
        .client-chatbot-toggle { margin-left: auto; }
      }
    `
    document.head.appendChild(style)

    const root = document.createElement('div')
    root.id = 'clientChatbotRoot'
    root.className = 'client-chatbot-root'
    root.innerHTML = `
      <div class="client-chatbot-panel" id="clientChatbotPanel">
        <div class="client-chatbot-header">
          <div class="client-chatbot-title">Chọn món nhanh</div>
          <div class="client-chatbot-subtitle">Gợi ý theo vị, mức giá và nhu cầu.</div>
        </div>
        <div class="client-chatbot-body" id="clientChatbotBody"></div>
        <div class="client-chatbot-quick" id="clientChatbotQuick"></div>
        <div class="client-chatbot-input-wrap">
          <input id="clientChatbotInput" class="client-chatbot-input" type="text" placeholder="Ví dụ: món ít ngọt dưới 40k" />
          <button id="clientChatbotSend" class="client-chatbot-send" type="button">Gửi</button>
        </div>
      </div>
      <button id="clientChatbotToggle" class="client-chatbot-toggle" type="button" aria-expanded="false">
        <span aria-hidden="true" style="display:flex;align-items:center;justify-content:center;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4.5 12a7.5 7.5 0 1 1 15 0" stroke="white" stroke-width="1.9" stroke-linecap="round"/>
            <rect x="2.7" y="10" width="3.4" height="6.4" rx="1.7" fill="white"/>
            <rect x="17.9" y="10" width="3.4" height="6.4" rx="1.7" fill="white"/>
            <path d="M7.1 12.3c0-1 .8-1.8 1.8-1.8h6.2c1 0 1.8.8 1.8 1.8v2.8c0 1-.8 1.8-1.8 1.8H8.9c-1 0-1.8-.8-1.8-1.8v-2.8Z" fill="white"/>
            <circle cx="10.1" cy="13.7" r="0.95" fill="#6F4E37"/>
            <circle cx="13.9" cy="13.7" r="0.95" fill="#6F4E37"/>
            <path d="M12.8 17.1v1c0 .5-.4.9-.9.9H9.7" stroke="white" stroke-width="1.7" stroke-linecap="round"/>
            <rect x="8.6" y="18" width="5.1" height="1.6" rx="0.8" fill="white"/>
          </svg>
        </span>
        <span class="client-chatbot-toggle-label">Gợi ý món</span>
      </button>
    `
    document.body.appendChild(root)

    bindEvents()
    renderQuickPrompts()
    addBotMessage(templates.welcome)
  }

  function bindEvents() {
    const toggle = document.getElementById('clientChatbotToggle')
    const panel = document.getElementById('clientChatbotPanel')
    const input = document.getElementById('clientChatbotInput')
    const send = document.getElementById('clientChatbotSend')

    toggle.addEventListener('click', async function () {
      const isOpen = panel.classList.toggle('open')
      toggle.setAttribute('aria-expanded', String(isOpen))
      if (isOpen) {
        input.focus()
        await ensureProductsLoaded()
      }
    })

    send.addEventListener('click', handleSubmit)
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault()
        handleSubmit()
      }
    })
  }

  function renderQuickPrompts() {
    const quick = document.getElementById('clientChatbotQuick')
    quick.innerHTML = quickPrompts
      .map(
        (prompt) =>
          `<button type="button" class="client-chatbot-chip" data-prompt="${prompt}">${prompt}</button>`,
      )
      .join('')

    quick.querySelectorAll('[data-prompt]').forEach((button) => {
      button.addEventListener('click', function () {
        const input = document.getElementById('clientChatbotInput')
        input.value = this.dataset.prompt || ''
        handleSubmit()
      })
    })
  }

  async function ensureProductsLoaded() {
    if (state.loaded || state.loading) return
    state.loading = true
    addBotMessage(templates.loading)

    try {
      const response = await fetch('https://cafemanagement-rgd5.onrender.com/products',{
        credentials: 'include'
      })
      const data = await response.json()
      state.products = (data.content || data || []).map(enrichProduct)
      state.loaded = true
    } catch (error) {
      console.error('Chatbot menu load failed', error)
      addBotMessage(templates.loadError)
    } finally {
      state.loading = false
    }
  }

  function enrichProduct(product) {
    const name = product.name || ''
    const text = normalizeText([name, product.descr, product.description, product.groupName].join(' '))
    const price = Number(product.price) || 0
    const tags = []

    if (/(latte|bac xiu|bạc xỉu|caramel|sua|milk|matcha|mocha)/i.test(name)) tags.push('milky', 'easy')
    if (/(tra|tea|dao|vai|hoa qua)/i.test(name)) tags.push('tea', 'refresh', 'light-caffeine')
    if (/(espresso|den|americano|cold brew|ca phe|cà phê)/i.test(name)) tags.push('coffee', 'strong', 'caffeine')
    if (/(da xay|freeze|ice blended|smoothie|sinh to)/i.test(name)) tags.push('sweet', 'refresh')
    if (price <= 30000) tags.push('budget-low')
    if (price > 30000 && price <= 40000) tags.push('budget-mid')
    if (price > 40000) tags.push('budget-high')
    if (/(caramel|socola|chocolate|vani|bạc xỉu|matcha)/i.test(text)) tags.push('sweet')
    if (/(espresso|den|americano|cold brew)/i.test(text)) tags.push('bitter')

    return {
      ...product,
      _text: text,
      _price: price,
      _tags: Array.from(new Set(tags)),
    }
  }

  async function handleSubmit() {
    const inputEl = document.getElementById('clientChatbotInput')
    const sendBtn = document.getElementById('clientChatbotSend')
    const message = (inputEl && inputEl.value || '').trim()
    if (!message) return

    addUserMessage(message)
    inputEl.value = ''

    // disable send button and show loading state
    const origText = sendBtn ? sendBtn.textContent : ''
    if (sendBtn) {
      sendBtn.disabled = true
      sendBtn.textContent = 'Đang trả lời...'
    }

    try {
      // call backend chat API
      const res = await fetch('https://cafemanagement-rgd5.onrender.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })

      if (!res.ok) throw new Error('Network response not ok')

      const data = await res.json()
      const botText = data && data.response ? String(data.response) : templates.empty
      addBotMessage(botText)
    } catch (err) {
      console.error('chat API failed', err)
      // fallback: if we have local products, use the recommendation logic
      if (state.loaded && state.products && state.products.length) {
        const result = recommendProducts(message, state.products)
        renderRecommendation(result)
      } else {
        addBotMessage('He thong tam thoi ban, vui long thu lai')
      }
    } finally {
      if (sendBtn) {
        sendBtn.disabled = false
        sendBtn.textContent = origText || 'Gửi'
      }
    }
  }

  function recommendProducts(message, products) {
    const query = normalizeText(message)
    const maxPriceMatch = query.match(/duoi\s*(\d+)\s*k?/)
    const minPriceMatch = query.match(/tren\s*(\d+)\s*k?/)
    const budgetMax = maxPriceMatch ? Number(maxPriceMatch[1]) * 1000 : null
    const budgetMin = minPriceMatch ? Number(minPriceMatch[1]) * 1000 : null

    const intent = {
      sweet: /(ngot|de uong|de uống|beo|béo|kem|sua|sữa)/.test(query),
      lessSweet: /(it ngot|khong ngot|không ngọt|giam ngot)/.test(query),
      strong: /(dam|đậm|tinh tao|tỉnh táo|ca phe manh|coffee manh|tap trung)/.test(query),
      light: /(mat|refresh|thanh|nhe bung|nhẹ bụng|buoi toi|buổi tối|it caffeine)/.test(query),
      coffee: /(ca phe|cafe|coffee|espresso|americano)/.test(query),
      tea: /(tra|tea|dao|vai|hoa qua|fruit)/.test(query),
    }

    const scored = products
      .filter((product) => {
        if (budgetMax !== null && product._price > budgetMax) return false
        if (budgetMin !== null && product._price < budgetMin) return false
        return true
      })
      .map((product) => {
        let score = 0
        const reasons = []

        if (intent.lessSweet && (product._tags.includes('tea') || product._tags.includes('light-caffeine'))) {
          score += 3
          reasons.push('vi thanh va de uong hon')
        }
        if (intent.sweet && (product._tags.includes('milky') || product._tags.includes('sweet'))) {
          score += 3
          reasons.push('hop voi gu ngot beo')
        }
        if (intent.strong && (product._tags.includes('strong') || product._tags.includes('coffee'))) {
          score += 4
          reasons.push('giup tinh tao hon')
        }
        if (intent.light && (product._tags.includes('refresh') || product._tags.includes('tea') || product._tags.includes('light-caffeine'))) {
          score += 3
          reasons.push('nhe vi, uong thoai mai')
        }
        if (intent.coffee && product._tags.includes('coffee')) {
          score += 2
          reasons.push('đúng nhóm cà phê đang tìm')
        }
        if (intent.tea && product._tags.includes('tea')) {
          score += 2
          reasons.push('thuoc nhom tra / tra hoa qua')
        }

        if (budgetMax !== null) {
          score += 1
          reasons.push(`nam trong muc gia ${formatPrice(budgetMax)}`)
        }

        if (!intent.sweet && !intent.lessSweet && !intent.strong && !intent.light && !intent.coffee && !intent.tea) {
          if (product._tags.includes('easy')) score += 2
          if (product._tags.includes('budget-mid')) score += 1
        }

        if (query && product._text.includes(query)) {
          score += 5
          reasons.push('trùng với tên hoặc mô tả vừa nhập')
        }

        return {
          product,
          score,
          reason: reasons[0] || 'phù hợp với nhiều khẩu vị',
        }
      })
      .sort((a, b) => b.score - a.score || a.product._price - b.product._price)
      .slice(0, 3)

    const summary = buildSummary(query, scored)
    return { summary, items: scored }
  }

  function buildSummary(query, items) {
    if (!items.length || items[0].score <= 0) {
      return templates.empty
    }

    if (/duoi\s*\d+\s*k?/.test(query)) {
      return 'Các món trong mức giá bạn đang tìm.'
    }

    if (/(it ngot|khong ngot|de uong)/.test(query)) {
      return 'Các món vị nhẹ, dễ uống.'
    }

    if (/(tinh tao|dam|ca phe)/.test(query)) {
      return 'Các món đậm vị, phù hợp khi cần tỉnh táo hơn.'
    }

    return 'Một vài món phù hợp với mô tả vừa nhập.'
  }

  function renderRecommendation(result) {
    addBotMessage(result.summary)

    if (!result.items.length || result.items[0].score <= 0) {
      return
    }

    const body = document.getElementById('clientChatbotBody')
    const wrap = document.createElement('div')
    wrap.className = 'client-chatbot-suggestions'
    wrap.innerHTML = result.items
      .map(
        ({ product, reason }) => `
          <div class="client-chatbot-card">
            <div class="client-chatbot-card-name">${escapeHtml(product.name || 'Mon dang cap nhat')}</div>
            <div class="client-chatbot-card-meta">${formatPrice(product._price)}${product.groupName ? ` • ${escapeHtml(product.groupName)}` : ''}</div>
            <div class="client-chatbot-card-reason">${escapeHtml(capitalize(reason))}</div>
            <div class="client-chatbot-card-actions">
              <button type="button" class="client-chatbot-add" data-add-product="${product.id}">Them vao gio</button>
              <button type="button" class="client-chatbot-chip" data-fill-name="${escapeHtmlAttr(product.name || '')}">Hoi them ve mon nay</button>
            </div>
          </div>`,
      )
      .join('')

    body.appendChild(wrap)
    body.scrollTop = body.scrollHeight

    wrap.querySelectorAll('[data-add-product]').forEach((button) => {
      button.addEventListener('click', function () {
        const productId = String(this.dataset.addProduct || '')
        const product = state.products.find((item) => String(item.id) === productId)
        if (!product) return
        addProductToCart(product)
      })
    })

    wrap.querySelectorAll('[data-fill-name]').forEach((button) => {
      button.addEventListener('click', function () {
        const input = document.getElementById('clientChatbotInput')
        input.value = `${this.dataset.fillName} co vi nhu the nao?`
        input.focus()
      })
    })
  }

  function addProductToCart(product) {
    if (!sessionStorage.getItem('currentUser')) {
      addBotMessage(`${templates.loginHint} Đang chuyển sang trang đăng nhập.`)
      setTimeout(() => {
        window.location.href = 'login.html'
      }, 800)
      return
    }

    if (!window.CartStore) return

    const items = window.CartStore.getItems()
    const idx = items.findIndex((item) => String(item.id) === String(product.id))

    if (idx > -1) {
      items[idx].quantity = Math.min(50, (items[idx].quantity || 0) + 1)
    } else {
      items.push({
        id: String(product.id),
        name: product.name,
        price: Number(product.price) || 0,
        image: product.imageUrl || '',
        quantity: 1,
      })
    }

    window.CartStore._save(items)
    addBotMessage(`Đã thêm ${product.name} vào giỏ.`)
  }

  function addBotMessage(text) {
    appendMessage('bot', text)
  }

  function addUserMessage(text) {
    appendMessage('user', text)
  }

  function appendMessage(role, text) {
    const body = document.getElementById('clientChatbotBody')
    const row = document.createElement('div')
    row.className = `client-chatbot-row ${role}`
    row.innerHTML = `<div class="client-chatbot-bubble">${escapeHtml(text)}</div>`
    body.appendChild(row)
    body.scrollTop = body.scrollHeight
  }

  function capitalize(value) {
    if (!value) return ''
    return value.charAt(0).toUpperCase() + value.slice(1)
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  function escapeHtmlAttr(value) {
    return escapeHtml(value)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureChatbot)
  } else {
    ensureChatbot()
  }
})()
