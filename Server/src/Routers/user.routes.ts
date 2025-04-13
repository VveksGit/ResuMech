import { Router } from "express";
import signupUser from "../Controllers/userSignup.controller";
import signinUser from "../Controllers/userSignin.controller";
import { upload } from "../Middlewares/multer.middleware";
import authUser from "../Middlewares/JwtAuth.middleware";
import { extractText } from "../Controllers/extract.controller";
import fs from "fs";
import fetchJobs from "../Controllers/fetchJobs.controller";
import uploadOnCloudinary from "../cloudinary/upload.cloudinary";
import uploadResume from "../Controllers/uploadResume.controller";

interface nlpData {
  job_titles: string[];
  locations: string[];
}

interface fetchedNlpDataAndJobs {
  nlpData: nlpData;
  jobs: Object;
}

const routers = Router();

routers.route("/sign/up").post(signupUser);
routers.route("/sign/in").post(signinUser);
routers
  .route("/upload/resume")
  .post(authUser, upload.single("myResume"), async (req, res) => {
    if (!req.file) {
      res.status(400).json({ message: "Resume upload failed" });
      return;
    }

    const pdfPath = req.file.path;

    console.log(`File uploaded successfully, the path is: ${pdfPath}`);

    try {
      const cloudinaryResponse = await uploadOnCloudinary(pdfPath);
      const cloudinaryUrl = cloudinaryResponse?.secure_url;

      if (!cloudinaryUrl) {
        console.log("there is no clodinaryUrl");
        return;
      }

      const extractedText = await extractText(pdfPath);

      fs.unlinkSync(pdfPath);

      if (!extractedText) {
        res.status(500).json({ message: "Failed to extract text" });
        return;
      }

      const fetchedNlpDataAndJobs: fetchedNlpDataAndJobs = await fetchJobs(
        extractedText
      );

      if (!fetchedNlpDataAndJobs) {
        console.log("There is error occured while fetching jobs");
        return;
      }

      const uploadResumeData = await uploadResume(
        req,
        res,
        cloudinaryUrl,
        fetchedNlpDataAndJobs
      );

      res.status(200).json({
        message:
          "Jobs fetched and uploaded resume details on the cloud successfully",
        resumeDetails: uploadResumeData,
        data: fetchedNlpDataAndJobs,
      });
    } catch (error) {
      console.error("Error processing PDF:", error);
      res.status(500).json({ message: "Server error" });
      return;
    }
  });

export default routers;
