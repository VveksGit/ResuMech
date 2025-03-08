import { Router } from "express";
import signupUser from "../Controllers/userSignup.controller";
import signinUser from "../Controllers/userSignin.controller";
import { upload } from "../Middlewares/multer.middleware";
import authUser from "../Middlewares/JwtAuth.middleware";
import uploadResume from "../Controllers/uploadResume.controller";
const routers = Router();

routers.route("/sign/up").post(signupUser);
routers.route("/sign/in").post(signinUser);
routers
  .route("/upload/resume")
  .post(authUser, upload.single("myResume"), uploadResume);

export default routers;
