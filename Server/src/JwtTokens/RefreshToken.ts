import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

interface user {
  _id: ObjectId;
  email: string;
}

const generateRefreshToken = (user: user) => {
  const secretKey = process.env.REFRESH_TOKEN_SECRET as string;

  if (!secretKey) {
    throw new Error(
      "REFRESH_TOKEN_SECRET is not defined in environment variables"
    );
  }

  const expiresIn = process.env.REFRESH_TOKEN_LIFE
    ? parseInt(process.env.REFRESH_TOKEN_LIFE, 10)
    : "1d";

  const options: jwt.SignOptions = { expiresIn };

  return jwt.sign(
    {
      id: user._id,
    },
    secretKey,
    options
  );
};

export default generateRefreshToken;
