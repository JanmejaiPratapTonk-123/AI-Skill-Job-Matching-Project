const express = require("express")
const router = express.Router()
const pool = require("../config/db")
const bcrypt = require("bcrypt")

router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body

        const hashedPassword = await bcrypt.hash(password, 10)

        const result = await pool.query(
            "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
            [name, email, hashedPassword]
        )

        res.json(result.rows[0])

    } catch (error) {
        console.error(error)
        res.status(500).send("Error registering user")
    }
})

const jwt = require("jsonwebtoken")

router.post("/login", async (req, res) => {
    try {

        const { email, password } = req.body

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        )

        if (result.rows.length === 0) {
            return res.status(400).json({ error: "User not found" })
        }

        const user = result.rows[0]

        const validPassword = await bcrypt.compare(password, user.password)

        if (!validPassword) {
            return res.status(400).json({ error: "Invalid password" })
        }

        const token = jwt.sign(
            { userId: user.id },
            "secretkey",
            { expiresIn: "24h" }
        )

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        })

    } catch (error) {
        console.error(error)
        res.status(500).send("Login error")
    }
})

module.exports = router