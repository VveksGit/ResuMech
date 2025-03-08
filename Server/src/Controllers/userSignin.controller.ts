import User from "../Models/user.model";
import { Request, Response } from "express";
import generateAccessToken from "../JwtTokens/AccessToken";
import generateRefreshToken from "../JwtTokens/RefreshToken";

interface signinReqBody {
  email: string;
  password: string;
}

const signinUser = async (
  req: Request<{}, {}, signinReqBody>,
  res: Response
) => {
  try {
    const { email, password } = req.body;
    if ([email, password].some((field) => field?.trim() === "")) {
      res.status(400).json({ messgae: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (!userExists) {
      res.status(400).json({ message: "User with this email does not exist!" });
      return;
    }

    const isPassMatch = await userExists.isPasswordMatch(password);
    if (!isPassMatch) {
      res.status(400).json({ message: "Wrong Password!" });
    }

    const accessToken = generateAccessToken(userExists);
    const refreshToken = generateRefreshToken(userExists);

    res.status(200).json({
      message: "User logged in successfully",
      userExists,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ message: `Can't login user: ${errorMessage}` });
  }
};
export default signinUser;
