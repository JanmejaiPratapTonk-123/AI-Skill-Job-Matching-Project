import React, { useState } from "react";
import axios from "axios";

function App() {

  const [file, setFile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [jobs, setJobs] = useState([]);

  const token = "PASTE_YOUR_TOKEN_HERE";

  const uploadResume = async () => {
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/resume/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setSkills(res.data.skills);
      fetchJobs();

    } catch (err) {
      console.error(err);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/jobs/recommend",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setJobs(res.data);

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>

      <h1>AI Career Advisor 🚀</h1>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <br /><br />

      <button onClick={uploadResume}>Upload Resume</button>

      <h2>Extracted Skills</h2>
      <ul>
        {skills.map((skill, index) => (
          <li key={index}>{skill}</li>
        ))}
      </ul>

      <h2>Job Recommendations</h2>
      {jobs.map((job, index) => (
        <div key={index} style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}>
          <h3>{job.job}</h3>
          <p><b>Company:</b> {job.company}</p>
          <p><b>Match:</b> {job.match_score}%</p>

          <p><b>Missing Skills:</b></p>
          <ul>
            {job.missing_skills?.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>

          <p><b>Recommended Courses:</b></p>
          <ul>
            {job.recommended_courses?.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      ))}

    </div>
  );
}

export default App;