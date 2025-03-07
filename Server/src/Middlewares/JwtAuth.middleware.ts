import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface AuthReq extends Request {
  user?: string | object;
}

const authUser = (req: AuthReq, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({ message: "Unauthrized" });
    }
    const token = authHeader.split(" ")[1];
    const secretKey = process.env.ACCESS_TOKEN_SECRET;
    if (!secretKey) {
      throw new Error(
        "ACCESS_TOKEN_SECRET is not set in environment variables"
      );
    }
    const verify = jwt.verify(token, secretKey) as JwtPayload;
    req.user = verify;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Invaid or expired token" });
  }
};

export default authUser;
