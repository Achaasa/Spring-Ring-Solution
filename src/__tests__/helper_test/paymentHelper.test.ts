import { Payment } from "@prisma/client";
import * as paymentHelper from "../../helper/paymentHelper";
import prisma from "../../utils/prisma";
import HttpException from "../../utils/http-error";
import paystack from "../../utils/paystack";

jest.mock("../../utils/prisma", () => ({
  payment: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  booking: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock("../../utils/paystack", () => ({
  initializeTransaction: jest.fn(),
  verifyTransaction: jest.fn(),
}));

describe("Payment Helper", () => {
  const mockPayment: Partial<Payment> = {
    id: "1",
    bookingId: "booking1",
  
    status: "PENDING",
  };

  const mockBooking = {
    id: "booking1",
    user: {
      email: "user@example.com",
    },
    service: {
      name: "Test Service",
    },
    status: "ACCEPTED",
    price: 1000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("initializePayment", () => {
    it("should initialize payment successfully", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
      (prisma.payment.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.payment.create as jest.Mock).mockResolvedValue(mockPayment);
      (paystack.initializeTransaction as jest.Mock).mockResolvedValue({
        data: {
          authorization_url: "https://paystack.com/pay/123",
        },
      });

      const result = await paymentHelper.initializePayment(
        mockBooking.id,
        
      );
      expect(result).toHaveProperty("authorizationUrl");
      expect(result).toHaveProperty("paymentId");
    });

    it("should throw error if booking not found", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        paymentHelper.initializePayment("nonexistent", ),
      ).rejects.toThrow(HttpException);
    });
  });

  describe("confirmPayment", () => {
    const mockReference = "ref123";
    const mockVerificationResponse = {
      data: {
        status: "success",
        metadata: {
          bookingId: mockPayment.bookingId,
        },
      },
    };

    it("should confirm payment successfully", async () => {
      (paystack.verifyTransaction as jest.Mock).mockResolvedValue(
        mockVerificationResponse,
      );
      (prisma.payment.findFirst as jest.Mock).mockResolvedValue(mockPayment);
      (prisma.payment.update as jest.Mock).mockResolvedValue({
        ...mockPayment,
        status: "SUCCESS",
      });

      const result = await paymentHelper.confirmPayment(mockReference);
      expect(result.status).toBe("SUCCESS");
      expect(prisma.payment.update).toHaveBeenCalled();
      expect(prisma.booking.update).toHaveBeenCalled();
    });

    it("should throw error if payment verification fails", async () => {
      (paystack.verifyTransaction as jest.Mock).mockResolvedValue({
        data: { status: "failed" },
      });

      await expect(paymentHelper.confirmPayment(mockReference)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe("getPaymentById", () => {
    it("should get payment by id", async () => {
      (prisma.payment.findUnique as jest.Mock).mockResolvedValue(mockPayment);

      const result = await paymentHelper.getPaymentById("1");
      expect(result).toEqual(mockPayment);
      expect(prisma.payment.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
        include: {
          booking: {
            include: {
              user: true,
              service: true,
            },
          },
        },
      });
    });

    it("should throw error if payment not found", async () => {
      (prisma.payment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(paymentHelper.getPaymentById("1")).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe("getPayments", () => {
    it("should get all payments", async () => {
      const mockPayments = [mockPayment];
      (prisma.payment.findMany as jest.Mock).mockResolvedValue(mockPayments);

      const result = await paymentHelper.getPayments();
      expect(result).toEqual(mockPayments);
      expect(prisma.payment.findMany).toHaveBeenCalledWith({
        include: {
          booking: true,
        },
      });
    });
  });

  describe("deletePayment", () => {
    it("should delete payment successfully", async () => {
      (prisma.payment.findUnique as jest.Mock).mockResolvedValue(mockPayment);
      (prisma.payment.delete as jest.Mock).mockResolvedValue(mockPayment);

      await paymentHelper.deletePayment("1");
      expect(prisma.payment.delete).toHaveBeenCalledWith({
        where: { id: "1" },
      });
    });

    it("should throw error if payment not found", async () => {
      (prisma.payment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(paymentHelper.deletePayment("1")).rejects.toThrow(
        HttpException,
      );
    });
  });
});
