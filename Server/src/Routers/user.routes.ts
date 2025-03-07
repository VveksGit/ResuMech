import { Router } from "express";
import signupUser from "../Controllers/userSignup.controller";
import signinUser from "../Controllers/userSignin.controller";

const routers = Router();

routers.route("/sign/up").post(signupUser);
routers.route("/sign/in").post(signinUser);

export default routers;
