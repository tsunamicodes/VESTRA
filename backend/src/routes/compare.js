const express = require('express')
const router = express.Router()
const pool = require('../db/index')

const coupons = {
  'Myntra': { code: 'STEAL50', discount: 50, type: 'percentage' },
  'Ajio': { code: 'AJIO20', discount: 20, type: 'percentage' },
  'Nykaa Fashion': { code: 'NYKAA10', discount: 10, type: 'percentage' },
  'H&M': { code: 'HMFIRST', discount: 100, type: 'flat' },
  'Zara': null
}

function applyBestCoupon(product) {
  const coupon = coupons[product.platform]
  if (!coupon) return { finalPrice: product.discounted_price, coupon: null, savings: 0 }

  let finalPrice = product.discounted_price
  let savings = 0

  if (coupon.type === 'percentage') {
    savings = Math.round(product.discounted_price * coupon.discount / 100)
    finalPrice = product.discounted_price - savings
  } else if (coupon.type === 'flat') {
    savings = coupon.discount
    finalPrice = product.discounted_price - savings
  }

  return { finalPrice, coupon, savings }
}

router.get('/', async (req, res) => {
  const { name } = req.query

  if (!name) {
    return res.status(400).json({ success: false, message: 'Product name is required' })
  }

  try {
    const result = await pool.query(
      `SELECT * FROM products
       WHERE LOWER(name) LIKE $1
       OR LOWER(category) LIKE $1`,
      [`%${name.toLowerCase()}%`]
    )

    if (result.rows.length === 0) {
      return res.json({ success: true, message: 'No matches found', comparisons: [] })
    }

    const comparisons = result.rows.map(product => {
      const { finalPrice, coupon, savings } = applyBestCoupon(product)
      return { ...product, finalPrice, coupon, savings }
    })

    comparisons.sort((a, b) => a.finalPrice - b.finalPrice)
    comparisons[0].bestDeal = true

    res.json({
      success: true,
      query: name,
      total: comparisons.length,
      bestDeal: comparisons[0],
      comparisons
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Database error' })
  }
})

module.exports = router
