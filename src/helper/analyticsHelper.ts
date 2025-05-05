import prisma from "../utils/prisma";
import HttpException from "../utils/http-error";
import { HttpStatus } from "../utils/http-status";
import { formatPrismaError } from "../utils/formatPrisma";


export const getBookingAnalytics = async () => {
  try {
    const totalBookings = await prisma.booking.count();
    const pendingBookings = await prisma.booking.count({
      where: { status: "PENDING" },
    });
    const acceptedBookings = await prisma.booking.count({
      where: { status: "ACCEPTED" },
    });
    const rejectedBookings = await prisma.booking.count({
      where: { status: "REJECTED" },
    });

    // Get bookings by service
    const bookingsByService = await prisma.booking.groupBy({
      by: ["serviceId"],
      _count: true,
      orderBy: {
        _count: {
          serviceId: "desc",
        },
      },
    });

    // Get bookings by month
    const bookingsByMonth = await prisma.booking.groupBy({
      by: ["createdAt"],
      _count: true,
      where: {
        createdAt: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 12)),
        },
      },
    });

    return {
      totalBookings,
      pendingBookings,
      acceptedBookings,
      rejectedBookings,
      bookingsByService,
      bookingsByMonth,
    };
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const getPaymentAnalytics = async () => {
  try {
    const totalPayments = await prisma.payment.count();
    const totalRevenue = await prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
    });
    const successfulPayments = await prisma.payment.count({
      where: { status: "SUCCESS" },
    });
    const failedPayments = await prisma.payment.count({
      where: { status: "FAILED" },
    });
    const pendingPayments = await prisma.payment.count({
      where: { status: "PENDING" },
    });

    // Get payments by month
    const paymentsByMonth = await prisma.payment.groupBy({
      by: ["paidAt"],
      _sum: {
        amount: true,
      },
      where: {
        paidAt: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 12)),
        },
      },
    });

    return {
      totalPayments,
      totalRevenue: totalRevenue._sum.amount || 0,
      successfulPayments,
      failedPayments,
      pendingPayments,
      paymentsByMonth,
    };
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const getUserAnalytics = async () => {
  try {
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: { status: "ACTIVE" },
    });
    const bannedUsers = await prisma.user.count({
      where: { status: "BANNED" },
    });
    const deletedUsers = await prisma.user.count({
      where: { status: "DELETED" },
    });

    // Get users by role
    const usersByRole = await prisma.user.groupBy({
      by: ["role"],
      _count: true,
    });

    // Get new users by month
    const newUsersByMonth = await prisma.user.groupBy({
      by: ["createdAt"],
      _count: true,
      where: {
        createdAt: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 12)),
        },
      },
    });

    return {
      totalUsers,
      activeUsers,
      bannedUsers,
      deletedUsers,
      usersByRole,
      newUsersByMonth,
    };
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const getServiceAnalytics = async () => {
  try {
    const totalServices = await prisma.service.count();

    // Get services with most bookings
    const popularServices = await prisma.service.findMany({
      include: {
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: {
        bookings: {
          _count: "desc",
        },
      },
      take: 5,
    });

    return {
      totalServices,
      popularServices,
    };
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const getFeedbackAnalytics = async () => {
  try {
    const totalFeedbacks = await prisma.feedback.count();
    const averageRating = await prisma.feedback.aggregate({
      _avg: {
        rating: true,
      },
    });

    // Get feedback distribution by rating
    const feedbackByRating = await prisma.feedback.groupBy({
      by: ["rating"],
      _count: true,
    });

    return {
      totalFeedbacks,
      averageRating: averageRating._avg.rating || 0,
      feedbackByRating,
    };
  } catch (error) {
    throw formatPrismaError(error);
  }
};
