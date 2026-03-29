require("dotenv").config()

const express = require("express")
const cors = require("cors")
const pool = require("./config/db")
const authRoutes = require("./routes/authRoutes")
const skillRoutes = require("./routes/skillRoutes")

const app = express()

app.use(cors())
app.use(express.json())
app.use("/api/auth", authRoutes)
app.use("/api/skills", skillRoutes)

app.get("/", (req, res) => {
    res.send("AI Career Platform API running")
})

const authMiddleware = require("./middleware/authMiddleware")

app.get("/api/profile", authMiddleware, async (req, res) => {

    const result = await pool.query(
        "SELECT id, name, email FROM users WHERE id=$1",
        [req.user.userId]
    )

    res.json(result.rows[0])
})

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()")
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).send("Database connection error")
  }
})

const resumeRoutes = require("./routes/resumeRoutes")
app.use("/api/resume", resumeRoutes)

const PORT = 5000

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})