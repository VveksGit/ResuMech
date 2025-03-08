import { Resume } from "../Models/resume.model";
import { Request, Response } from "express";
import uploadOnCloudinary from "../cloudinary/cloudinary";

interface AuthReq extends Request {
  user?: {
    id: string;
    email: string;
    iat: number;
    exp: number;
  };
}

const uploadResume = async (req: AuthReq, res: Response) => {
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

    if (!req.file) {
      res.status(400).json({ message: "File was not uploaded" });
      return;
    }

    const resumeLocalPath = req.file.path;
    if (!resumeLocalPath) {
      res.status(400).json({ message: "Resume pdf is required" });
      return;
    }

    const uploadResumeOnCloudinary = await uploadOnCloudinary(resumeLocalPath);
    if (!uploadResumeOnCloudinary) {
      res.status(500).json({ message: "Failed to upload the pdf" });
      return;
    }

    const resumeUrl = uploadResumeOnCloudinary.secure_url;

    const resume = await Resume.create({
      userId,
      resumeUrl,
    });

    res
      .status(200)
      .json({ message: `The pdf uploaded succesfully: ${resume}` });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: `Can't upload the resume: ${(error as Error).message}`,
    });
    return;
  }
};

export default uploadResume;
