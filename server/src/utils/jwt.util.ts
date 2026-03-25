import jwt from "jsonwebtoken";

export const genarateAccessToken = (payload: object) => {
  const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: "15m",
  });
};

export const genarateRefreshToken = (payload: object) => {
  const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: "7d",
  });
};
