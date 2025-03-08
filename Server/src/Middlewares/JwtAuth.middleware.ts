import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface AuthReq extends Request {
  user?: string | JwtPayload;
}

const authUser = (req: AuthReq, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(400).json({ message: "Unauthorized: No token provided" });
      return;
    }
    const token = authHeader.split(" ")[1];
    const secretKey = process.env.ACCESS_TOKEN_SECRET;
    if (!secretKey) {
      throw new Error(
        "ACCESS_TOKEN_SECRET is not set in environment variables"
      );
    }
    const verifiedUser = jwt.verify(token, secretKey) as JwtPayload;
    req.user = verifiedUser;
    next();
  } catch (error) {
    console.log(error);

    res.status(401).json({
      message: `Error authenticating user ${(error as Error).message}`,
    });
    return;
  }
};

export default authUser;
