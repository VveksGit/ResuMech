import { Router } from "express";
import signupUser from "../Controllers/userSignup.controller";
import signinUser from "../Controllers/userSignin.controller";
import { upload } from "../Middlewares/multer.middleware";
import authUser from "../Middlewares/JwtAuth.middleware";
const routers = Router();

routers.route("/sign/up").post(signupUser);
routers.route("/sign/in").post(signinUser);
routers
  .route("/upload/resume")
  .post(authUser, upload.single("myResume"), (req, res) => {
    if (!req.file) {
      res.status(400).json({ message: "Resume upload failed" });
      return;
    }

    res.status(200).json({
      message: "Resume uploaded successfully",
      file: req.file, // This will return file details
    });
  });

export default routers;
