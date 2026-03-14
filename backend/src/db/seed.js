const pool = require('./index')
const mockProducts = require('../data/mockProducts')

async function seed() {
  console.log('Seeding database...')

  for (const p of mockProducts) {
    await pool.query(
      `INSERT INTO products 
        (id, name, brand, price, discounted_price, discount, image, url, platform, category, sizes, rating, reviews)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (id) DO NOTHING`,
      [p.id, p.name, p.brand, p.price, p.discountedPrice, p.discount, p.image, p.url, p.platform, p.category, p.sizes, p.rating, p.reviews]
    )
    console.log(`Inserted: ${p.name} (${p.platform})`)
  }

  console.log('Seeding complete!')
  process.exit(0)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})