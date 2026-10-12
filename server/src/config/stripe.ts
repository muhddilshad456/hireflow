import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const secretKey = process.env.STRIPE_SECRET_KEY;
const priceId = process.env.STRIPE_PRICE_ID;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!secretKey) throw new Error("STRIPE_SECRET_KEY is not set");
if (!priceId) throw new Error("STRIPE_PRICE_ID is not set");
if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");

export const stripe = new Stripe(secretKey);
export const STRIPE_PRICE_ID = priceId;
export const STRIPE_WEBHOOK_SECRET = webhookSecret;

// Hard-coded for now (move to env / CLIENT_URL later)
export const CHECKOUT_SUCCESS_URL =
  "http://localhost:5173/company/admin/subscription/success?session_id={CHECKOUT_SESSION_ID}";
export const CHECKOUT_CANCEL_URL =
  "http://localhost:5173/company/admin/subscription/cancel";
