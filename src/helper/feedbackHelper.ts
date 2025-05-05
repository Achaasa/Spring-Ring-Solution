import prisma from "../utils/prisma";
import HttpException from "../utils/http-error";
import { HttpStatus } from "../utils/http-status";
import {
  feedbackSchema,
  updateFeedbackSchema,
} from "../zodSchema/feedbackSchema";
import { formatPrismaError } from "../utils/formatPrisma";
import { Feedback } from "@prisma/client";

export const createFeedback = async (feedbackData: Feedback) => {
  try {
    const validateFeedback = feedbackSchema.safeParse(feedbackData);
    if (!validateFeedback.success) {
      const errors = validateFeedback.error.issues.map(
        ({ message, path }) => `${path}: ${message}`,
      );
      throw new HttpException(HttpStatus.BAD_REQUEST, errors.join(". "));
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: feedbackData.userId },
    });
    if (!user) {
      throw new HttpException(HttpStatus.NOT_FOUND, "User not found");
    }

    const newFeedback = await prisma.feedback.create({
      data: feedbackData,
      include: {
        user: true,
      },
    });
    return newFeedback;
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const getFeedbacks = async () => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      include: {
        user: true,
      },
    });
    return feedbacks;
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const getFeedbackById = async (id: string) => {
  try {
    const feedback = await prisma.feedback.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
    if (!feedback) {
      throw new HttpException(HttpStatus.NOT_FOUND, "Feedback not found.");
    }
    return feedback;
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const updateFeedback = async (
  id: string,
  feedbackData: Partial<Feedback>,
) => {
  try {
    const validateFeedback = updateFeedbackSchema.safeParse(feedbackData);
    if (!validateFeedback.success) {
      const errors = validateFeedback.error.issues.map(
        ({ message, path }) => `${path}: ${message}`,
      );
      throw new HttpException(HttpStatus.BAD_REQUEST, errors.join(". "));
    }

    const findFeedback = await prisma.feedback.findUnique({ where: { id } });
    if (!findFeedback) {
      throw new HttpException(HttpStatus.NOT_FOUND, "Feedback not found");
    }

    const updatedFeedback = await prisma.feedback.update({
      where: { id },
      data: feedbackData,
      include: {
        user: true,
      },
    });
    return updatedFeedback;
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const deleteFeedback = async (id: string) => {
  try {
    const findFeedback = await getFeedbackById(id);
    if (!findFeedback) {
      throw new HttpException(HttpStatus.NOT_FOUND, "Feedback does not exist");
    }

    await prisma.feedback.delete({ where: { id } });
  } catch (error) {
    throw formatPrismaError(error);
  }
};
