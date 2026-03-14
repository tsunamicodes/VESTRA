const https = require('https')

function fetchNykaa(searchQuery) {
  return new Promise((resolve, reject) => {
    const encodedQuery = encodeURIComponent(searchQuery)
    const url = `https://www.nykaafashion.com/rest/appapi/V2/categories/products?searchTerm=${encodedQuery}&PageSize=36&sort=popularity&currentPage=1&filter_format=v2&currency=INR&country_code=IN&apiVersion=6&deviceType=MSITE&device_os=mweb_windows`

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-IN,en;q=0.9',
        'Referer': 'https://www.nykaafashion.com/search?q=black+crop+top',
        'Origin': 'https://www.nykaafashion.com',
        'x-channel': 'msite',
        'x-device-os': 'mweb_windows'
      }
    }

    https.get(url, options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          resolve(json)
        } catch (e) {
          reject(new Error('Failed to parse JSON: ' + data.substring(0, 100)))
        }
      })
    }).on('error', reject)
  })
}

async function scrapeNykaa(searchQuery) {
  console.log(`Fetching Nykaa products for: ${searchQuery}`)

  const data = await fetchNykaa(searchQuery)

  if (data.status !== 'success') {
    console.log('API returned:', data.status)
    return []
  }

  const products = data.response.products.slice(0, 10).map(p => ({
    name: p.subTitle || 'N/A',
    brand: p.title || 'N/A',
    price: p.price || 'N/A',
    discountedPrice: p.discountedPrice || 'N/A',
    discount: p.discount ? `${p.discount}%` : 'N/A',
    image: p.imageUrl || 'N/A',
    url: `https://www.nykaafashion.com/${p.slug || ''}`,
    platform: 'Nykaa Fashion'
  }))

  console.log(`Found ${products.length} products`)
  console.log(JSON.stringify(products, null, 2))
  return products
}

scrapeNykaa('black crop top')

