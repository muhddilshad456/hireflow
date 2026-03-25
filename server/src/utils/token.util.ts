import crypto from "crypto";

export const genarateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};
