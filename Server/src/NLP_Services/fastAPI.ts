import axios from "axios";

interface NLPData {
  job_titles: string[];
  skills: string[];
  locations: string[];
}
interface FilterData {
  job_titles: string[];
  locations: string[];
}

const nlpApiReq = async (text: string): Promise<FilterData | undefined> => {
  try {
    const nlpResponse = await axios.post("http://127.0.0.1:8000/extract/", {
      text,
    });

    const data: NLPData = nlpResponse.data;

    if (data.job_titles.length === 0 && data.skills.length > 0) {
      console.log("No job titles found, determining from skills...");
      data.job_titles = determineJobTitlesFromSkills(data.skills);

      if (data.job_titles.length === 0) {
        console.log("No job titles could be determined from the skills.");
        data.job_titles = ["Software Developer"];
      }
    }

    if (data.job_titles.length === 0) {
      console.log("Insufficient data to search for jobs");
      return undefined;
    }

    const { skills, ...filteredData } = data;

    return filteredData;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("API Error:", error.message);
      throw new Error(error.message);
    } else {
      console.error("Unknown API Error:", error);
      throw new Error("Internal Service Error");
    }
  }
};

function determineJobTitlesFromSkills(skills: string[]): string[] {
  const skillsLower = skills.map((skill) => skill.toLowerCase());
  const jobTitles = new Set<string>();

  const frontendSkills = [
    "react",
    "angular",
    "vue",
    "html",
    "css",
    "javascript",
    "jquery",
  ];
  if (frontendSkills.some((skill) => skillsLower.includes(skill))) {
    jobTitles.add("Frontend Developer");
  }

  if (skillsLower.includes("react")) {
    jobTitles.add("React Developer");
  }
  if (skillsLower.includes("angular")) {
    jobTitles.add("Angular Developer");
  }

  const backendSkills = [
    "node.js",
    "nodejs",
    "express",
    "java",
    "spring",
    "python",
    "django",
    "sql",
    "mysql",
    "mongodb",
    "rest",
  ];
  if (backendSkills.some((skill) => skillsLower.includes(skill))) {
    jobTitles.add("Backend Developer");
  }

  if (
    skillsLower.includes("node.js") ||
    skillsLower.includes("nodejs") ||
    skillsLower.includes("express")
  ) {
    jobTitles.add("Node.js Developer");
  }
  if (skillsLower.includes("java")) {
    jobTitles.add("Java Developer");
  }
  if (skillsLower.includes("java") && skillsLower.includes("spring")) {
    jobTitles.add("Java Spring Developer");
  }

  if (skillsLower.includes("react native") || skillsLower.includes("expo")) {
    jobTitles.add("React Native Developer");
    jobTitles.add("Mobile Developer");
  }

  const hasBackend = backendSkills.some((skill) => skillsLower.includes(skill));
  const hasFrontend = frontendSkills.some((skill) =>
    skillsLower.includes(skill)
  );

  if (hasBackend && hasFrontend) {
    jobTitles.add("Full Stack Developer");
  }

  if (
    skillsLower.includes("mongodb") &&
    (skillsLower.includes("express") ||
      skillsLower.includes("nodejs") ||
      skillsLower.includes("node.js")) &&
    skillsLower.includes("react")
  ) {
    jobTitles.add("MERN Stack Developer");
  }

  if (skillsLower.includes("docker") || skillsLower.includes("circleci")) {
    jobTitles.add("DevOps Engineer");
  }

  if (
    jobTitles.size === 0 &&
    (skillsLower.includes("javascript") ||
      skillsLower.includes("java") ||
      skillsLower.includes("python") ||
      skillsLower.includes("sql"))
  ) {
    jobTitles.add("Software Developer");
  }

  return Array.from(jobTitles);
}

export default nlpApiReq;
