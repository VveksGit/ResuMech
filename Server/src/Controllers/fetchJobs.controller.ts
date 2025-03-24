import axios from "axios";
import nlpApiReq from "../NLP_Services/fastAPI";

interface Job {
  title: string;
  company: string;
  location: string;
  url: string;
}
interface data {
  job_titles: string[];
  locations: string[];
}

const fetchJobs = async (text: string): Promise<Job[] | undefined> => {
  if (!process.env.ADZUNA_API_ID || !process.env.ADZUNA_API_KEY) {
    throw new Error("Missing Adzuna API credentials");
  }

  const nlpResponse = await nlpApiReq(text);

  if (!nlpResponse) {
    throw new Error("NLP API returned undefined");
  }
  const data: data = nlpResponse;

  const adzunaUrl = `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${
    process.env.ADZUNA_API_ID
  }&app_key=${
    process.env.ADZUNA_API_KEY
  }&results_per_page=10&what=${encodeURIComponent(data.job_titles[0])}${
    data.locations.length > 0
      ? `&where=${encodeURIComponent(data.locations[0])}`
      : `&where=Remote`
  }`;

  try {
    const adzunaResponse = await axios.get(adzunaUrl);

    const jobs: Job[] = adzunaResponse.data.results.map((job: any) => ({
      title: job.title,
      company: job.company.display_name,
      location: job.location.display_name,
      url: job.redirect_url,
    }));

    return jobs;
  } catch (adzunaError) {
    console.error(
      "Adzuna API Error:",
      adzunaError instanceof Error ? adzunaError.message : adzunaError
    );
    throw new Error("Failed to fetch jobs from Adzuna");
  }
};

export default fetchJobs;
