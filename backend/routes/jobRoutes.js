const express = require("express")
const router = express.Router()
const pool = require("../config/db")
const authMiddleware = require("../middleware/authMiddleware")

router.get("/recommend", authMiddleware, async (req, res) => {

    const userId = req.user.userId

    // Get user skills
    const userSkillsResult = await pool.query(
        "SELECT skill_id FROM user_skills WHERE user_id = $1",
        [userId]
    )

    const userSkills = userSkillsResult.rows.map(r => r.skill_id)

    // Get all jobs
    const jobsResult = await pool.query("SELECT * FROM jobs")

    const recommendations = []

    for (const job of jobsResult.rows) {

        const jobSkillsResult = await pool.query(
            "SELECT skill_id FROM job_skills WHERE job_id = $1",
            [job.id]
        )

        const jobSkills = jobSkillsResult.rows.map(r => r.skill_id)

        const matched = jobSkills.filter(skill => userSkills.includes(skill))

        const score = (matched.length / jobSkills.length) * 100

        recommendations.push({
            job: job.title,
            company: job.company,
            match_score: Math.round(score)
        })
    }

    // Sort by best match
    recommendations.sort((a, b) => b.match_score - a.match_score)

    res.json(recommendations)
})

module.exports = router