import { NextApiRequest } from "next";
import jwt from "jsonwebtoken";

interface DecodedToken {
  userId: string;
  username: string;
}

export function getUserFromToken(req: NextApiRequest): DecodedToken | null {
  const token = req.cookies?.auth_token;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    return decoded;
  } catch (error) {
    console.error('[JWT Verify Error]', error);
    return null;
  }
}
