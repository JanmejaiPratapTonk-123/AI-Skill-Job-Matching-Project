from fastapi import FastAPI
import pandas as pd

app = FastAPI()

skills_df = pd.read_csv("../../datasets/skills.csv")

skills_list = skills_df["name"].str.lower().tolist()

@app.post("/extract-skills")
def extract_skills(data: dict):

    text = data["text"].lower()

    found_skills = []

    for skill in skills_list:
        if skill in text:
            found_skills.append(skill)

    return {"skills": found_skills}