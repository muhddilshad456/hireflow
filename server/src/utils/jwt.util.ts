import jwt, { SignOptions } from "jsonwebtoken";

export const genarateAccessToken = (payload: object) => {
  const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES as SignOptions["expiresIn"],
  });
};

export const genarateRefreshToken = (payload: object) => {
  const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES as SignOptions["expiresIn"],
  });
};
