const express = require('express')
const router = express.Router()
const pool = require('../db/index')

router.get('/', async (req, res) => {
  const { q, platform, category, minPrice, maxPrice, sort } = req.query

  if (!q) {
    return res.status(400).json({ success: false, message: 'Search query is required' })
  }

  try {
    let query = `
      SELECT * FROM products
      WHERE (
        LOWER(name) LIKE $1 OR
        LOWER(brand) LIKE $1 OR
        LOWER(category) LIKE $1
      )
    `
    const params = [`%${q.toLowerCase()}%`]
    let paramCount = 1

    if (platform) {
      paramCount++
      query += ` AND LOWER(platform) = $${paramCount}`
      params.push(platform.toLowerCase())
    }

    if (category) {
      paramCount++
      query += ` AND LOWER(category) = $${paramCount}`
      params.push(category.toLowerCase())
    }

    if (minPrice) {
      paramCount++
      query += ` AND discounted_price >= $${paramCount}`
      params.push(Number(minPrice))
    }

    if (maxPrice) {
      paramCount++
      query += ` AND discounted_price <= $${paramCount}`
      params.push(Number(maxPrice))
    }

    if (sort === 'price_asc') query += ' ORDER BY discounted_price ASC'
    else if (sort === 'price_desc') query += ' ORDER BY discounted_price DESC'
    else if (sort === 'discount') query += ' ORDER BY discount DESC'
    else if (sort === 'rating') query += ' ORDER BY rating DESC'
    else query += ' ORDER BY rating DESC'

    const result = await pool.query(query, params)

    res.json({
      success: true,
      query: q,
      total: result.rows.length,
      results: result.rows
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Database error' })
  }
})

module.exports = router
