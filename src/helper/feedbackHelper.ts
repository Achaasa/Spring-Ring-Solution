import prisma from "../utils/prisma";
import HttpException from "../utils/http-error";
import { HttpStatus } from "../utils/http-status";
import { Feedback } from "@prisma/client";
import { feedbackSchema } from "../zodSchema/feedbackSchema";
import { formatPrismaError } from "../utils/formatPrisma";

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
    if (error instanceof HttpException) {
      throw error;
    }
    throw formatPrismaError(error);
  }
};

export const getFeedbacks = async () => {
  try {
    const feedbacks = await prisma.feedback.findMany({where: {delFlag: false},
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
      where: { id ,delFlag: false},
      include: {
        user: true,
      },
    });
    if (!feedback) {
      throw new HttpException(HttpStatus.NOT_FOUND, "Feedback not found");
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
    const validateFeedback = feedbackSchema.partial().safeParse(feedbackData);
    if (!validateFeedback.success) {
      const errors = validateFeedback.error.issues.map(
        ({ message, path }) => `${path}: ${message}`,
      );
      throw new HttpException(HttpStatus.BAD_REQUEST, errors.join(". "));
    }

    const findFeedback = await prisma.feedback.findUnique({
      where: { id ,delFlag: false},
    });
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
      throw new HttpException(HttpStatus.NOT_FOUND, "Feedback not found");
    }
    await prisma.feedback.update({
      where: { id },data: { delFlag: true }
    });
  } catch (error) {
    throw formatPrismaError(error);
  }
};
