import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

interface user {
  _id: ObjectId;
  email: string;
}

const generateAccessToken = (user: user) => {
  const secretKey = process.env.ACCESS_TOKEN_SECRET as string;
  if (!secretKey) {
    throw new Error(
      "ACCESS_TOKEN_SECRET is not defined in environment variables"
    );
  }
  const expiresIn = process.env.ACCESS_TOKEN_LIFE
    ? parseInt(process.env.ACCESS_TOKEN_LIFE, 10)
    : "10m";

  const options: jwt.SignOptions = { expiresIn };

  return jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    secretKey,
    options
  );
};

export default generateAccessToken;
