import User from "../Models/user.model";
import { Request, Response } from "express";
import generateAccessToken from "../JwtTokens/AccessToken";
import generateRefreshToken from "../JwtTokens/RefreshToken";

interface SignupReqBody {
  fullName: string;
  email: string;
  password: string;
}

const signupUser = async (
  req: Request<{}, {}, SignupReqBody>,
  res: Response
): Promise<void> => {
  try {
    const { fullName, email, password } = req.body;

    //check if any field is empty
    if ([fullName, email, password].some((field) => field?.trim() === "")) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    //Check if the user already exists
    const existedUser = await User.findOne({ email });
    if (existedUser) {
      res.status(400).json({ message: "The user with email is already exist" });
      return;
    }

    //Create new user
    const newUser = await User.create({
      fullName,
      email,
      password,
    });

    //Retrieve created user without password and refreshToken from DB
    const createdUser = await User.findById(newUser._id).select(
      "-password -refreshToken"
    );
    if (!createdUser) {
      res.status(400).json({ message: "User not found" });
      return;
    }

    const accessToken = generateAccessToken(createdUser);
    const refreshToken = generateRefreshToken(createdUser);

    res.status(201).json({
      message: `New user created successfully`,
      createdUser,
      accessToken,
      refreshToken,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({
        message: `There is some error in creating the user: ${error.message}`,
      });
    } else {
      res.status(500).json({
        message: "There is some error in creating the user",
      });
    }
  }
};

export default signupUser;
