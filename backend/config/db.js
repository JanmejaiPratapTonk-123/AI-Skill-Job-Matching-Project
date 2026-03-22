const { Pool } = require("pg")

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "career_platform",
  password: "JANMEJAI",
  port: 5432,
})

module.exports = pool