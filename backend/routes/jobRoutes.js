const express = require("express")
const router = express.Router()
const pool = require("../config/db")
const authMiddleware = require("../middleware/authMiddleware")

router.get("/recommend", authMiddleware, async (req, res) => {

    try {

        const userId = req.user.userId

        const result = await pool.query(`
            SELECT 
                j.id,
                j.title,
                j.company,

                COUNT(js.skill_id) AS total_skills,

                COUNT(us.skill_id) AS matched_skills,

                COALESCE(
                    ARRAY_REMOVE(
                        ARRAY_AGG(s.name) FILTER (
                            WHERE us.skill_id IS NULL
                        ),
                        NULL
                    ),
                    '{}'
                ) AS missing_skills,

                COALESCE(
                    ARRAY_REMOVE(
                        ARRAY_AGG(DISTINCT c.name) FILTER (
                            WHERE us.skill_id IS NULL
                        ),
                        NULL
                    ),
                    '{}'
                ) AS recommended_courses

            FROM jobs j

            JOIN job_skills js ON j.id = js.job_id
            JOIN skills s ON js.skill_id = s.id

            LEFT JOIN user_skills us 
                ON js.skill_id = us.skill_id 
                AND us.user_id = $1

            LEFT JOIN courses c 
                ON c.skill_id = s.id

            GROUP BY j.id
        `, [userId])

        const recommendations = result.rows.map(job => {
            const score = job.total_skills == 0
                ? 0
                : (job.matched_skills / job.total_skills) * 100

            return {
                job: job.title,
                company: job.company,
                match_score: Math.round(score),
                missing_skills: job.missing_skills,
                recommended_courses: job.recommended_courses
            }
        })

        recommendations.sort((a, b) => b.match_score - a.match_score)

        res.json(recommendations)

    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Server error" })
    }
})

module.exports = router