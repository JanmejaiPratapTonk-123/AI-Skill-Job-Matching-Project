const express = require("express")
const router = express.Router()
const multer = require("multer")
const pdf = require("pdf-parse")
const fs = require("fs")
const axios = require("axios")
const pool = require("../config/db")
const authMiddleware = require("../middleware/authMiddleware")

const upload = multer({ dest: "uploads/" })

router.post("/upload", authMiddleware, upload.single("resume"), async (req, res) => {
    try {

        const fileBuffer = fs.readFileSync(req.file.path)
        const pdfData = await pdf(fileBuffer)
        const text = pdfData.text

        const aiResponse = await axios.post(
            "http://localhost:8000/extract-skills",
            { text }
        )

        const skills = aiResponse.data.skills
        const userId = req.user.userId

        for (const skill of skills) {

            const result = await pool.query(
                "SELECT id FROM skills WHERE LOWER(name) = $1",
                [skill]
            )

            if (result.rows.length > 0) {
                const skillId = result.rows[0].id

                await pool.query(
                    `INSERT INTO user_skills (user_id, skill_id)
                     VALUES ($1,$2)
                     ON CONFLICT DO NOTHING`,
                    [userId, skillId]
                )
            }
        }

        res.json({
            message: "Resume processed successfully",
            skills
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Resume processing failed" })
    }
})

module.exports = router