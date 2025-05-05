import axios from "axios";
import crypto from "crypto";
import HttpException from "./http-error";
import { ErrorResponse } from "./types";

const PAYSTACK_BASE_URL = "https://api.paystack.co";
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_KEY || "";

if (!PAYSTACK_SECRET_KEY) {
  throw new Error("PAYSTACK_SECRET_KEY must be set in environment variables");
}

interface PaystackService {
  initializeTransaction: (
    email: string,
    amount: number,
    metadata?: any,
  ) => Promise<any>;
  verifyTransaction: (reference: string) => Promise<any>;
  verifyWebhookSignature: (body: string, signature: string) => boolean;
}

const paystack: PaystackService = {
  initializeTransaction: async (
    email: string,
    amount: number,
    metadata?: any,
  ) => {
    try {
      const response = await axios.post(
        `${PAYSTACK_BASE_URL}/transaction/initialize`,
        {
          email,
          amount: amount * 100, // Convert to kobo
          metadata,
          callback_url: `${process.env.BASE_URL}/api/payment/verify`,
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );
      return response.data;
    } catch (error) {
      const err = error as ErrorResponse;
      throw new Error(
        `Paystack initialization error: ${
          (error as any).response?.data?.message || err.message
        }`,
      );
    }
  },

  verifyTransaction: async (reference: string) => {
    try {
      const response = await axios.get(
        `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      const err = error as ErrorResponse;
      throw new Error(
        `Paystack verification error: ${
          (error as any).response?.data?.message || err.message
        }`,
      );
    }
  },

  verifyWebhookSignature: (body: string, signature: string): boolean => {
    const hmac = crypto.createHmac("sha512", PAYSTACK_SECRET_KEY);
    const computedSignature = hmac.update(body).digest("hex");
    return computedSignature === signature;
  },
};

export default paystack;
