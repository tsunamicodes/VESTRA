const { Pool } = require('pg')

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'vestra',
  password: 'CHRISevans',
  port: 5432,
})

module.exports = pool