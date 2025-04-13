import axios from "axios";
import nlpApiReq from "../NLP_Services/fastAPI";

interface Job {
  title: string;
  company: string;
  location: string;
  url: string;
}

interface NLPData {
  job_titles: string[];
  locations: string[];
}

interface OrganizedJobs {
  [key: string]: {
    [location: string]: Job[];
  };
}

interface FetchJobsResult {
  nlpData: NLPData;
  jobs: OrganizedJobs;
}

const fetchJobs = async (text: string): Promise<FetchJobsResult> => {
  if (!process.env.ADZUNA_API_ID || !process.env.ADZUNA_API_KEY) {
    throw new Error("Missing Adzuna API credentials");
  }

  const nlpResponse = await nlpApiReq(text);
  if (!nlpResponse) {
    throw new Error("NLP API returned undefined");
  }

  const nlpData: NLPData = nlpResponse;
  console.log("NLP Data:", nlpData);

  const organizedJobs: OrganizedJobs = {};

  // Use Promise.all to make concurrent API calls
  const jobPromises = nlpData.job_titles.flatMap((title) =>
    nlpData.locations.map(async (location) => {
      const adzunaUrl = `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${
        process.env.ADZUNA_API_ID
      }&app_key=${
        process.env.ADZUNA_API_KEY
      }&results_per_page=5&what=${encodeURIComponent(title)}${
        location !== "Remote"
          ? `&where=${encodeURIComponent(location)}`
          : "&where=Remote"
      }`;

      try {
        const adzunaResponse = await axios.get(adzunaUrl);
        const jobs = adzunaResponse.data.results.map((job: any) => ({
          title: job.title,
          company: job.company.display_name,
          location: job.location.display_name,
          url: job.redirect_url,
        }));

        // Organize jobs by title and location
        if (!organizedJobs[title]) {
          organizedJobs[title] = {};
        }
        organizedJobs[title][location] = jobs;
        return { title, location, jobs };
      } catch (adzunaError) {
        console.error(
          `Error fetching jobs for ${title} in ${location}:`,
          adzunaError instanceof Error ? adzunaError.message : adzunaError
        );
        return { title, location, jobs: [] };
      }
    })
  );

  // Wait for all promises to resolve
  await Promise.all(jobPromises);

  return {
    nlpData,
    jobs: organizedJobs,
  };
};

export default fetchJobs;
