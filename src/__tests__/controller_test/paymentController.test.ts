import { Request, Response } from "express";
import * as paymentHelper from "../../helper/paymentHelper";
import {
  initializePaymentHandler,
  confirmPaymentHandler,
  getPaymentByIdHandler,
  getPaymentsHandler,
  deletePaymentHandler,
} from "../../controller/paymentController";
import { HttpStatus } from "../../utils/http-status";

// Mock environment variables
process.env.PAYSTACK_KEY = "test_key";
process.env.PAYSTACK_SECRET_KEY = "test_secret_key";

// Mock paystack module
jest.mock("../../utils/paystack", () => ({
  __esModule: true,
  default: {
    initializeTransaction: jest.fn(),
    verifyTransaction: jest.fn(),
  },
}));

// Mock the payment helper functions
jest.mock("../../helper/paymentHelper");

describe("Payment Controller Tests", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any = {};

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((result) => {
        responseObject = result;
      }),
      send: jest.fn(),
    };
  });

  describe("initializePaymentHandler", () => {
    it("should initialize payment successfully", async () => {
      const mockPayment = {
        authorizationUrl: "https://test.url",
        paymentId: "123",
      };
      mockRequest.body = { bookingId: "123"};
      (paymentHelper.initializePayment as jest.Mock).mockResolvedValue(
        mockPayment,
      );

      await initializePaymentHandler(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(mockPayment);
    });

    it("should handle initialization errors", async () => {
      mockRequest.body = { bookingId: "123", amount: 1000 };
      const error = new Error("Initialization failed");
      (paymentHelper.initializePayment as jest.Mock).mockRejectedValue(error);

      await initializePaymentHandler(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe("confirmPaymentHandler", () => {
    it("should confirm payment successfully", async () => {
      const mockPayment = { id: "123", status: "SUCCESS" };
      mockRequest.body = { reference: "ref123" };
      (paymentHelper.confirmPayment as jest.Mock).mockResolvedValue(
        mockPayment,
      );

      await confirmPaymentHandler(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(mockPayment);
    });

    it("should handle confirmation errors", async () => {
      mockRequest.body = { reference: "ref123" };
      const error = new Error("Confirmation failed");
      (paymentHelper.confirmPayment as jest.Mock).mockRejectedValue(error);

      await confirmPaymentHandler(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe("getPaymentByIdHandler", () => {
    it("should get payment by id successfully", async () => {
      const mockPayment = { id: "123" };
      mockRequest.params = { paymentId: "123" };
      (paymentHelper.getPaymentById as jest.Mock).mockResolvedValue(
        mockPayment,
      );

      await getPaymentByIdHandler(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(mockPayment);
    });

    it("should handle get payment errors", async () => {
      mockRequest.params = { paymentId: "123" };
      const error = new Error("Payment not found");
      (paymentHelper.getPaymentById as jest.Mock).mockRejectedValue(error);

      await getPaymentByIdHandler(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe("getPaymentsHandler", () => {
    it("should get all payments successfully", async () => {
      const mockPayments = [{ id: "123" }, { id: "456" }];
      (paymentHelper.getPayments as jest.Mock).mockResolvedValue(mockPayments);

      await getPaymentsHandler(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(mockPayments);
    });

    it("should handle get payments errors", async () => {
      const error = new Error("Failed to get payments");
      (paymentHelper.getPayments as jest.Mock).mockRejectedValue(error);

      await getPaymentsHandler(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe("deletePaymentHandler", () => {
    it("should delete payment successfully", async () => {
      mockRequest.params = { id: "123" };
      (paymentHelper.deletePayment as jest.Mock).mockResolvedValue(undefined);

      await deletePaymentHandler(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NO_CONTENT);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it("should handle deletion errors", async () => {
      mockRequest.params = { id: "123" };
      const error = new Error("Failed to delete payment");
      (paymentHelper.deletePayment as jest.Mock).mockRejectedValue(error);

      await deletePaymentHandler(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });
});
