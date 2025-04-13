import { Resume } from "../Models/resume.model";
import { Request, Response } from "express";
import userModel from "../Models/user.model";

interface AuthReq extends Request {
  user?: {
    id: string;
    email: string;
    iat: number;
    exp: number;
  };
}

interface nlpData {
  job_titles: string[];
  locations: string[];
}

interface fetchedNlpDataAndJobs {
  nlpData: nlpData;
  jobs: Object;
}

const uploadResume = async (
  req: AuthReq,
  res: Response,
  resumeUrl: string,
  nlpDataAndJobObject: fetchedNlpDataAndJobs
) => {
  try {
    const jwtUser = req.user;
    if (!jwtUser) {
      res.status(400).json({ message: "Unauthorized user access!" });
      return;
    }

    const userId = jwtUser.id;
    if (!userId) {
      res.status(400).json({ message: "Unauthorized user ID!" });
      return;
    }

    const user = await userModel.findById(userId);

    if (!user) {
      console.log("The user does not exist");
      return;
    }

    if (!resumeUrl) {
      res.status(500).json({ message: "There is no resumeUrl" });
      return;
    }

    if (
      !nlpDataAndJobObject ||
      !nlpDataAndJobObject.nlpData ||
      !nlpDataAndJobObject.jobs ||
      !nlpDataAndJobObject.nlpData.job_titles ||
      !nlpDataAndJobObject.nlpData.locations
    ) {
      res
        .status(500)
        .json({ message: "The nlpDataAndJObObject is incomplete" });
      return;
    }

    const job_titles = nlpDataAndJobObject.nlpData.job_titles;
    const locations = nlpDataAndJobObject.nlpData.locations;
    const jobs = nlpDataAndJobObject.jobs;

    const existingResumeData = await Resume.findOne({ userId });
    console.log(existingResumeData);

    if (existingResumeData) {
      existingResumeData.resumeUrl = resumeUrl;
      existingResumeData.job_titles = job_titles;
      existingResumeData.locations = locations;
      existingResumeData.jobs = jobs;
      await existingResumeData.save();

      if (!user.userQueries.includes(existingResumeData._id)) {
        user.userQueries.push(existingResumeData._id);
        await user.save();
      }
      return existingResumeData;
    }

    const resume = await Resume.create({
      userId,
      resumeUrl,
      job_titles,
      locations,
      jobs,
    });

    user.userQueries.push(resume._id);
    await user.save();

    return resume;
  } catch (error) {
    console.log(error);
    console.log("Can't upload the resume: ", (error as Error).message);
    return;
  }
};

export default uploadResume;
