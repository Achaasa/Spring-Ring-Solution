import { RequestHandler } from "express";
import { confirmPayment } from "../helper/paymentHelper";
import paystack from "./paystack";
import prisma from "./prisma";
import { formatPrismaError } from "../utils/formatPrisma";

export const handlePaystackWebhook: RequestHandler = async (req, res) => {
  const signature = req.headers["x-paystack-signature"] as string;
  const rawBody = (req as any).rawBody;

  // Verify signature first
  if (!paystack.verifyWebhookSignature(rawBody, signature)) {
    res.status(401).send("Unauthorized");
    return;
  }

  try {
    const body = JSON.parse(rawBody);

    if (body.event === "charge.success") {
      const reference = body.data.reference;

      // Find the payment record
      const payment = await prisma.payment.findFirst({
        where: {
          reference,
        },
        include: {
          booking: true, 
        },
      });

      if (!payment) {
        res.status(404).send("Payment not found");
        return;
      }

      // Confirm the payment
      await confirmPayment(reference);

      res.sendStatus(200);
      return;
    }

    // Handle other events
    res.sendStatus(200);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};
