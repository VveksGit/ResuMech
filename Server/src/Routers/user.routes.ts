import { Router } from "express";
import signupUser from "../Controllers/userSignup.controller";
import signinUser from "../Controllers/userSignin.controller";
import { upload } from "../Middlewares/multer.middleware";
import authUser from "../Middlewares/JwtAuth.middleware";
import { extractText } from "../Controllers/extract.controller";
import fs from "fs";

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
      const extractedText = await extractText(pdfPath);
      fs.unlinkSync(pdfPath);

      if (extractedText) {
        res.status(200).json({
          message: "Text extracted successfully",
          text: extractedText,
        });
        return;
      } else {
        res.status(500).json({
          message: "Failed to extract text",
        });
        return;
      }
    } catch (error) {
      console.error("Error processing PDF:", error);
      res.status(500).json({ message: "Server error" });
      return;
    }
  });

export default routers;
