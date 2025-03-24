import spacy
from spacy.matcher import PhraseMatcher
from fuzzywuzzy import process
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import re

# Load spaCy model
nlp = spacy.load("en_core_web_sm")

# Define FastAPI app
app = FastAPI()

# Predefined list of job titles
job_titles = [
    "Software Engineer", "Full Stack Developer", "Frontend Developer", "Backend Developer",
    "DevOps Engineer", "Data Scientist", "Machine Learning Engineer", "Cloud Engineer",
    "AI Engineer", "Cybersecurity Engineer", "Network Engineer", "Database Administrator",
    "System Administrator", "Technical Support Engineer", "Mobile Developer", "Android Developer",
    "iOS Developer", "Game Developer", "Embedded Software Engineer", "Site Reliability Engineer",
    "QA Engineer", "Test Automation Engineer", "Business Analyst", "IT Project Manager",
    "Scrum Master", "Product Manager", "Software Architect", "Security Analyst",
    "UI/UX Designer", "Solutions Architect", "Blockchain Developer", "Data Analyst",
    "Programmer Analyst", "Front End Engineer"
]

# Predefined list of skills
skills_list = [
    # Programming Languages
    "JavaScript", "TypeScript", "Python", "Java", "C", "C++", "C#", "Go", "Rust", "Swift", "Kotlin", "Ruby", "PHP", "Perl",
    "Objective-C", "Dart", "Scala", "R", "Haskell", "Lua", "Shell Scripting", "Bash", "PowerShell",

    # Frontend Technologies
    "ReactJS", "React", "Next.js", "VueJS", "Vue", "Nuxt.js", "AngularJS", "Angular", "Svelte", "SolidJS", "AlpineJS",
    "HTML", "CSS", "SCSS", "LESS", "Bootstrap", "TailwindCSS", "Material UI", "Chakra UI", "jQuery",

    # Backend Technologies
    "NodeJS", "Node", "ExpressJS", "Express", "FastAPI", "Flask", "Django", "Spring Boot", "ASP.NET", "NestJS", 
    "Ruby on Rails", "Laravel", "Phoenix", "Gin", "Fiber", "Ktor", "Actix", "Quarkus", "Micronaut", 
    "Spring", "Maven", "Tomcat",

    # Databases
    "MongoDB", "MySQL", "PostgreSQL", "SQLite", "MariaDB", "Oracle DB", "Firebase", "DynamoDB",
    "Redis", "Cassandra", "CouchDB", "Neo4j", "Elasticsearch", "FaunaDB", "Supabase", "SQL",

    # DevOps & Cloud
    "Docker", "Kubernetes", "K8s", "Terraform", "Ansible", "Jenkins", "GitHub Actions", "CircleCI", "TravisCI",
    "AWS", "Azure", "Google Cloud", "GCP", "DigitalOcean", "Heroku", "Netlify", "Vercel",
    "CloudFormation", "Lambda", "EC2", "S3", "IAM", "Cloudflare", "Firebase Hosting", "Grunt",

    # API & Communication
    "GraphQL", "RESTful API", "REST", "WebSockets", "gRPC", "Apollo", "Axios", "Fetch API",
    "OAuth", "JWT", "OpenAPI", "Swagger", "Postman", "Socket.io",

    # Mobile Development
    "React Native", "Flutter", "SwiftUI", "Jetpack Compose", "Cordova", "Ionic", "Xamarin", "Expo", "ExponentJS",

    # Testing & Automation
    "Jest", "Mocha", "Chai", "Cypress", "Selenium", "Playwright", "JUnit", "PyTest", "Robot Framework",
    "Karma", "TestCafe", "Appium", "Postman Tests",

    # Other
    "PassportJS", "Passport", "HTML/CSS"
]

# Extended list of terms that shouldn't be identified as locations
false_location_terms = [
    # Technologies that are often mistaken as locations
    "Grunt", "Socket.io", "Docker", "Tomcat", "Spring", "Maven", "Express", "ExpressJS",
    "Heroku", "Expo", "ExponentJS", "React", "React Native", "Node", "NodeJS", "Vue", "Angular", 
    "Passport", "PassportJS", "WordPress",
    
    # Educational terms
    "M.S.", "B.S.", "Ph.D.", "MBA", "Bachelor", "Master", "Degree",
    
    # Job titles
    "Analyst", "Engineer", "Developer", "Manager", "Architect", "Director", "VP",
    
    # Other terms
    "Call", "Remote", "Distributed", "Cloud", "API", "Interface", "Frontend", "Backend"
]

# Normalize skills list for case-insensitive comparison and prevent duplication
normalized_skills = {}
for skill in skills_list:
    normalized_skills[skill.lower()] = skill

# Create canonical forms for similar terms to prevent duplication
skill_canonicalization = {
    "react": "React",
    "reactjs": "React",
    "node": "Node.js",
    "nodejs": "Node.js",
    "express": "Express",
    "expressjs": "Express",
    "angular": "Angular",
    "angularjs": "Angular",
    "vue": "Vue.js",
    "vuejs": "Vue.js",
    "html/css": "HTML/CSS",
    "html": "HTML",
    "css": "CSS",
    "passport": "Passport",
    "passportjs": "Passport",
    "exponentjs": "Expo",
    "expo": "Expo"
}

# Create matchers
job_title_matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
skill_matcher = PhraseMatcher(nlp.vocab, attr="LOWER")

# Add patterns to matchers
job_title_patterns = [nlp.make_doc(title.lower()) for title in job_titles]
skill_patterns = [nlp.make_doc(skill.lower()) for skill in normalized_skills.keys()]

job_title_matcher.add("JOB_TITLE", job_title_patterns)
skill_matcher.add("SKILLS", skill_patterns)

# Input model for API
class ResumeText(BaseModel):
    text: str

# Function to find fuzzy matches for multi-word phrases
def get_fuzzy_matches(text, word_list, threshold=90):
    matches = []
    # Split by whitespace but keep multi-word phrases together
    phrases = re.findall(r'\b[\w\s/+#-]+\b', text)
    
    for phrase in phrases:
        if len(phrase.split()) > 1:  # Only match multi-word phrases
            best_match, score = process.extractOne(phrase, word_list)
            if score >= threshold:
                matches.append(best_match)
    return matches

# Function to canonicalize skills (standardize names)
def canonicalize_skill(skill):
    skill_lower = skill.lower()
    if skill_lower in skill_canonicalization:
        return skill_canonicalization[skill_lower]
    return skill

# Function to filter out false positive locations
def filter_locations(locations):
    valid_locations = []
    for loc in locations:
        # Skip if it's in our false location terms
        if any(term.lower() in loc.lower() for term in false_location_terms):
            continue
        
        # Check for common US state abbreviations or full state names
        state_pattern = r'\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming)\b'
        if re.search(state_pattern, loc, re.IGNORECASE):
            valid_locations.append(loc)
        # Valid country names
        elif loc in ["US", "USA", "Canada", "UK", "Australia", "India", "China", "Japan"]:
            valid_locations.append(loc)
        # Cities are often recognized correctly by spaCy, so keep those with additional filtering
        elif len(loc.split()) == 1 and loc[0].isupper() and len(loc) > 3:
            valid_locations.append(loc)
    
    return valid_locations

# Function to extract job titles, skills, and locations
def extract_info(text):
    doc = nlp(text)

    # Extract job title matches with case normalization
    job_titles_set = set()
    for match_id, start, end in job_title_matcher(doc):
        span = doc[start:end]
        # Only add job titles that appear in specific contexts
        context_start = max(0, start - 5)
        context_end = min(len(doc), end + 5)
        context = doc[context_start:context_end].text.lower()
        
        # Check for job title contextual words
        job_contexts = ["as", "position", "role", "title", "work", "experience", "job", "engineer", "analyst"]
        title_words = span.text.lower().split()
        
        # Either the context contains job-related terms or the title itself is strongly job-related
        if any(ctx in context for ctx in job_contexts) or any(word in job_contexts for word in title_words):
            # Normalize case for job title
            title_proper = ' '.join(word.capitalize() if word.lower() not in ['of', 'the', 'and', 'in', 'at', 'for'] 
                                  else word.lower() for word in span.text.split())
            job_titles_set.add(title_proper)

    # Extract exact skill matches with proper casing
    skills_set = set()
    for match_id, start, end in skill_matcher(doc):
        span = doc[start:end].text.lower()
        # Only add skills with 3+ characters to avoid false positives
        if len(span) >= 3 and span in normalized_skills:
            # Use canonicalized version to prevent duplicates
            canonical_skill = canonicalize_skill(normalized_skills[span])
            skills_set.add(canonical_skill)
    
    # Only use fuzzy matching for skills that weren't found by exact matching
    fuzzy_skills = get_fuzzy_matches(text, skills_list, threshold=90)
    for skill in fuzzy_skills:
        canonical_skill = canonicalize_skill(skill)
        skill_lower = canonical_skill.lower()
        # Only add if we don't already have a similar match
        if not any(s.lower() == skill_lower for s in skills_set):
            skills_set.add(canonical_skill)

    # Extract locations (using spaCy's Named Entity Recognition)
    extracted_locations = {ent.text for ent in doc.ents if ent.label_ == "GPE"}
    filtered_locations = filter_locations(extracted_locations)

    return list(job_titles_set), list(skills_set), filtered_locations

# API Endpoint
@app.post("/extract/")
async def extract_data(resume: ResumeText):
    try:
        job_titles, skills, locations = extract_info(resume.text)
        # Return a clean, non-nested response
        return {
                "job_titles": job_titles,
                "skills": skills,
                "locations": locations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Run the server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)