import { Feedback } from "@prisma/client";
import * as feedbackHelper from "../../helper/feedbackHelper";
import prisma from "../../utils/prisma";
import HttpException from "../../utils/http-error";
import { HttpStatus } from "../../utils/http-status";

jest.mock("../../utils/prisma", () => ({
  feedback: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
}));

describe("Feedback Helper", () => {
  const mockFeedback: Partial<Feedback> = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    userId: "123e4567-e89b-12d3-a456-426614174001",
    rating: 5,
    message: "Great service!",
  };

  const mockUser = {
    id: "123e4567-e89b-12d3-a456-426614174001",
    email: "test@example.com",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
  });

  describe("createFeedback", () => {
    it("should create a feedback successfully", async () => {
      (prisma.feedback.create as jest.Mock).mockResolvedValue({
        ...mockFeedback,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await feedbackHelper.createFeedback(mockFeedback as Feedback);
      expect(result).toHaveProperty("id", mockFeedback.id);
      expect(result).toHaveProperty("rating", mockFeedback.rating);
      expect(prisma.feedback.create).toHaveBeenCalledWith({
        data: mockFeedback,
        include: { user: true },
      });
    });
  });

  describe("updateFeedback", () => {
    it("should update a feedback successfully", async () => {
      const updateData = { rating: 4, comment: "Updated comment" };
      (prisma.feedback.findUnique as jest.Mock).mockResolvedValue(mockFeedback);
      (prisma.feedback.update as jest.Mock).mockResolvedValue({
        ...mockFeedback,
        ...updateData,
      });

      const result = await feedbackHelper.updateFeedback(
        "123e4567-e89b-12d3-a456-426614174000",
        updateData,
      );
      expect(result).toHaveProperty("rating", 4);
      expect(result).toHaveProperty("comment", "Updated comment");
    });

    it("should throw an error if feedback not found", async () => {
      (prisma.feedback.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        feedbackHelper.updateFeedback("123e4567-e89b-12d3-a456-426614174000", { rating: 4 }),
      ).rejects.toThrow(
        new HttpException(HttpStatus.NOT_FOUND, "Feedback not found"),
      );
    });
  });

  describe("getFeedbacks", () => {
    it("should get all feedbacks", async () => {
      const mockFeedbacks = [mockFeedback];
      (prisma.feedback.findMany as jest.Mock).mockResolvedValue(mockFeedbacks);

      const result = await feedbackHelper.getFeedbacks();
      expect(result).toEqual(mockFeedbacks);
      expect(prisma.feedback.findMany).toHaveBeenCalledWith({
        include: { user: true },
      });
    });
  });

  describe("getFeedbackById", () => {
    it("should get feedback by id", async () => {
      (prisma.feedback.findUnique as jest.Mock).mockResolvedValue(mockFeedback);

      const result = await feedbackHelper.getFeedbackById("123e4567-e89b-12d3-a456-426614174000");
      expect(result).toEqual(mockFeedback);
      expect(prisma.feedback.findUnique).toHaveBeenCalledWith({
        where: { id: "123e4567-e89b-12d3-a456-426614174000" },
        include: { user: true },
      });
    });

    it("should throw an error if feedback not found", async () => {
      (prisma.feedback.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(feedbackHelper.getFeedbackById("123e4567-e89b-12d3-a456-426614174000")).rejects.toThrow(
        new HttpException(HttpStatus.NOT_FOUND, "Feedback not found"),
      );
    });
  });

  describe("deleteFeedback", () => {
    it("should delete feedback successfully", async () => {
      (prisma.feedback.findUnique as jest.Mock).mockResolvedValue(mockFeedback);
      (prisma.feedback.delete as jest.Mock).mockResolvedValue(mockFeedback);

      await feedbackHelper.deleteFeedback("123e4567-e89b-12d3-a456-426614174000");
      expect(prisma.feedback.delete).toHaveBeenCalledWith({
        where: { id: "123e4567-e89b-12d3-a456-426614174000" },
      });
    });

    it("should throw an error if feedback not found", async () => {
      (prisma.feedback.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(feedbackHelper.deleteFeedback("123e4567-e89b-12d3-a456-426614174000")).rejects.toThrow(
        new HttpException(HttpStatus.NOT_FOUND, "Feedback not found"),
      );
    });
  });
});
