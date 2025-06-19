import { Request, Response } from "express";
import {
  MockRequest,
  MockResponse,
  createRequest,
  createResponse,
} from "node-mocks-http";
import {
  createFeedbackHandler,
  getFeedbacksHandler,
  getFeedbackByIdHandler,
  updateFeedbackHandler,
  deleteFeedbackHandler,
} from "../../controller/feedbackController";
import * as feedbackHelper from "../../helper/feedbackHelper";
import { HttpStatus } from "../../utils/http-status";

// Mock the dependencies
jest.mock("../../helper/feedbackHelper");

describe("Feedback Controller", () => {
  let mockRequest: MockRequest<Request>;
  let mockResponse: MockResponse<Response>;

  beforeEach(() => {
    mockRequest = createRequest();
    mockResponse = createResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createFeedbackHandler", () => {
    const mockFeedbackData = {
      userId: "user1",
      serviceId: "service1",
      rating: 5,
      comment: "Great service!",
    };

    it("should create feedback successfully", async () => {
      const mockCreatedFeedback = { id: "1", ...mockFeedbackData };
      mockRequest.body = mockFeedbackData;
      (feedbackHelper.createFeedback as jest.Mock).mockResolvedValue(
        mockCreatedFeedback,
      );

      await createFeedbackHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(HttpStatus.CREATED);
      expect(JSON.parse(mockResponse._getData())).toEqual(mockCreatedFeedback);
    });

    it("should handle creation errors", async () => {
      mockRequest.body = mockFeedbackData;
      const error = new Error("Creation failed");
      (feedbackHelper.createFeedback as jest.Mock).mockRejectedValue(error);

      await createFeedbackHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(JSON.parse(mockResponse._getData())).toHaveProperty("message");
    });
  });

  describe("getFeedbacksHandler", () => {
    it("should get all feedback successfully", async () => {
      const mockFeedbacks = [
        { id: "1", userId: "user1", serviceId: "service1", rating: 5 },
        { id: "2", userId: "user2", serviceId: "service1", rating: 4 },
      ];
      (feedbackHelper.getFeedbacks as jest.Mock).mockResolvedValue(
        mockFeedbacks,
      );

      await getFeedbacksHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(HttpStatus.OK);
      expect(JSON.parse(mockResponse._getData())).toEqual(mockFeedbacks);
    });

    it("should handle errors when getting feedback", async () => {
      const error = new Error("Failed to fetch feedback");
      (feedbackHelper.getFeedbacks as jest.Mock).mockRejectedValue(error);

      await getFeedbacksHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(JSON.parse(mockResponse._getData())).toHaveProperty("message");
    });
  });

  describe("getFeedbackByIdHandler", () => {
    const mockFeedback = {
      id: "1",
      userId: "user1",
      serviceId: "service1",
      rating: 5,
      comment: "Excellent!",
    };

    it("should get feedback by id successfully", async () => {
      mockRequest.params = { id: "1" };
      (feedbackHelper.getFeedbackById as jest.Mock).mockResolvedValue(
        mockFeedback,
      );

      await getFeedbackByIdHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(HttpStatus.OK);
      expect(JSON.parse(mockResponse._getData())).toEqual(mockFeedback);
    });

    it("should handle non-existent feedback", async () => {
      mockRequest.params = { id: "999" };
      const error = new Error("Feedback not found");
      (feedbackHelper.getFeedbackById as jest.Mock).mockRejectedValue(error);

      await getFeedbackByIdHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(JSON.parse(mockResponse._getData())).toHaveProperty("message");
    });
  });

  describe("updateFeedbackHandler", () => {
    const mockUpdateData = {
      rating: 4,
      comment: "Updated comment",
    };

    it("should update feedback successfully", async () => {
      const mockUpdatedFeedback = {
        id: "1",
        userId: "user1",
        serviceId: "service1",
        ...mockUpdateData,
      };
      mockRequest.params = { id: "1" };
      mockRequest.body = mockUpdateData;
      (feedbackHelper.updateFeedback as jest.Mock).mockResolvedValue(
        mockUpdatedFeedback,
      );

      await updateFeedbackHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(HttpStatus.OK);
      expect(JSON.parse(mockResponse._getData())).toEqual(mockUpdatedFeedback);
    });

    it("should handle update errors", async () => {
      mockRequest.params = { id: "1" };
      mockRequest.body = mockUpdateData;
      const error = new Error("Update failed");
      (feedbackHelper.updateFeedback as jest.Mock).mockRejectedValue(error);

      await updateFeedbackHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(JSON.parse(mockResponse._getData())).toHaveProperty("message");
    });
  });

  describe("deleteFeedbackHandler", () => {
    it("should delete feedback successfully", async () => {
      mockRequest.params = { id: "1" };
      (feedbackHelper.deleteFeedback as jest.Mock).mockResolvedValue(undefined);

      await deleteFeedbackHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(HttpStatus.NO_CONTENT);
    });

    it("should handle deletion errors", async () => {
      mockRequest.params = { id: "1" };
      const error = new Error("Deletion failed");
      (feedbackHelper.deleteFeedback as jest.Mock).mockRejectedValue(error);

      await deleteFeedbackHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(JSON.parse(mockResponse._getData())).toHaveProperty("message");
    });
  });
});
