const { chromium } = require('playwright')

async function scrapeHM(searchQuery) {
  console.log(`Starting H&M scrape for: ${searchQuery}`)

  const browser = await chromium.launch({ 
    headless: false,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars',
      '--no-sandbox'
    ]
  })

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 720 },
    locale: 'en-IN',
    extraHTTPHeaders: {
      'Accept-Language': 'en-IN,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    }
  })

  // Hide webdriver property — the main thing sites check
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined })
  })

  const page = await context.newPage()

  try {
    await page.goto(`https://www2.hm.com/en_in/search-results.html?q=${encodeURIComponent(searchQuery)}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    })

    await page.waitForTimeout(4000)
    await page.waitForSelector('article', { timeout: 15000 })

    const products = await page.evaluate(() => {
      const cards = document.querySelectorAll('article')
      return [...cards].slice(0, 10).map(card => ({
        name: card.querySelector('h3')?.innerText?.trim() || 'N/A',
        price: card.querySelector('p.db0187')?.innerText?.trim() || 'N/A',
        image: card.querySelector('img')?.src || 'N/A',
        url: card.querySelector('a.b9da57')?.href || 'N/A',
        platform: 'H&M'
      }))
    })

    console.log(`Found ${products.length} products`)
    console.log(products)

    await browser.close()
    return products

  } catch (error) {
    console.error('Scrape failed:', error.message)
    await browser.close()
    return []
  }
}

scrapeHM('black crop top')