import prisma from "../utils/prisma";
import HttpException from "../utils/http-error";
import { HttpStatus } from "../utils/http-status";
import { updateUserSchema, userSchema } from "../zodSchema/userSchema";
import { hashPassword } from "../utils/bcrypt";
import cloudinary from "../utils/cloudinary";
import { generatePassword } from "../utils/generatepass";
import { sendEmail } from "../utils/nodeMailer";
import { jwtDecode } from "jwt-decode";
import { UserPayload } from "../utils/jsonwebtoken";
import { formatPrismaError } from "../utils/formatPrisma";
import { User } from "@prisma/client";
import { generateResetPasswordEmail } from "../services/generateResetPasswword";

export const createUser = async (
  UserData: User,
  picture: { imageUrl: string; imageKey: string },
) => {
  try {
    const validateUser = userSchema.safeParse(UserData);
    if (!validateUser.success) {
      const errors = validateUser.error.issues.map(
        ({ message, path }) => `${path}: ${message}`,
      );
      throw new HttpException(HttpStatus.BAD_REQUEST, errors.join(". "));
    }

    const { email } = UserData;
    const findUser = await prisma.user.findUnique({ where: { email } });
    if (findUser) {
      throw new HttpException(HttpStatus.CONFLICT, "Email already exists");
    }

    const hashedPassword = await hashPassword(UserData.password);
    const newUser = await prisma.user.create({
      data: {
        ...UserData,
        password: hashedPassword,
        imageKey: picture.imageKey,
        imageUrl: picture.imageUrl,
      },
    });
    const { password, ...restOfUser } = newUser;
    return restOfUser as User;
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const getUsers = async () => {
  try {
    const users = await prisma.user.findMany({
      include: {
        bookings: true,
        notifications: true,
        feedbacks: true,
        handledBookings: true,
      },
    });
    return users as User[];
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new HttpException(HttpStatus.NOT_FOUND, "User not found");
    }

    return user;
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user;
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const deleteUser = async (id: string) => {
  try {
    const findUser = await getUserById(id);
    if (!findUser) {
      throw new HttpException(HttpStatus.NOT_FOUND, "User not found");
    }

    await prisma.user.delete({ where: { id } });
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const updateUser = async (
  id: string,
  UserData: Partial<User>,
  picture?: { imageUrl: string; imageKey: string },
) => {
  try {
    const validateUser = updateUserSchema.safeParse(UserData);
    if (!validateUser.success) {
      const errors = validateUser.error.issues.map(
        ({ message, path }) => `${path}: ${message}`,
      );
      throw new HttpException(HttpStatus.BAD_REQUEST, errors.join(". "));
    }
    const findUser = await prisma.user.findUnique({ where: { id } });
    if (!findUser) {
      throw new HttpException(HttpStatus.NOT_FOUND, "User not found");
    }

    if (picture && picture.imageKey && picture.imageUrl) {
      // Delete the existing photo from Cloudinary if it exists
      if (findUser.imageKey) {
        await cloudinary.uploader.destroy(findUser.imageKey);
      }

      // Update tutorData with new picture details
      UserData.imageKey = picture.imageKey;
      UserData.imageUrl = picture.imageUrl;
    }

    if (UserData.password) {
      const hashedpassword = await hashPassword(UserData.password);
      if (!hashedpassword) {
        throw new HttpException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          "Error Hashing Password",
        );
      }
      UserData.password = hashedpassword;
    }
    const { role, ...restOfUser } = UserData;
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { ...restOfUser },
    });
    const { password, ...restOfUpdate } = updatedUser;
    return restOfUpdate as User;
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const getUserProfileHelper = async (authHeader: string) => {
  try {
    if (!authHeader) {
      throw new HttpException(HttpStatus.FORBIDDEN, "No token provided");
    }

    const token = authHeader.split(" ")[1]; // Extract the token from 'Bearer <token>'
    if (!token) {
      throw new HttpException(HttpStatus.FORBIDDEN, "Invalid token format");
    }

    let decoded: UserPayload & { exp: number };
    try {
      decoded = jwtDecode<UserPayload & { exp: number }>(token); // Decode the token
    } catch (error) {
      throw new HttpException(HttpStatus.UNAUTHORIZED, "Invalid token");
    }

    const currentTime = Date.now() / 1000;
    if (decoded?.exp < currentTime) {
      throw new HttpException(HttpStatus.UNAUTHORIZED, "Token expired");
    }

    // Fetch the user profile from DB using the user ID
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      throw new HttpException(HttpStatus.NOT_FOUND, "User not found");
    }

    return user; // Return the found user
  } catch (error) {
    throw formatPrismaError(error);
  }
};


export const resetPassword = async (email: string) => {
  if (!email) {
    throw new HttpException(HttpStatus.BAD_REQUEST, "Email is required");
  }
  try {
    const user = await prisma.user.findFirst({
      where: { email, delFlag: false },
    });

    if (!user) {
      throw new HttpException(HttpStatus.NOT_FOUND, "User not found");
    }

    const newPassword = generatePassword();
    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, changedPassword: false },
    });

    const htmlContent = generateResetPasswordEmail(email, newPassword);
    await sendEmail(email, "Password Reset", htmlContent);

    return { message: "Password reset successfully. Check your email." };
  } catch (error) {
    throw formatPrismaError(error);
  }
};