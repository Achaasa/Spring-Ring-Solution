import { Request, Response, NextFunction } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import HttpException from "./http-error";
import { HttpStatus } from "./http-status";
import { Role } from "@prisma/client";
import redisClient from "./redisClient";

export interface UserPayload {
  id: string;
  role: Role;
  issuedAt: number; // Timestamp of when the token was issued (in milliseconds)
}

declare global {
  namespace Express {
    interface Request {
      user: UserPayload;
    }
  }
}

// Middleware to authenticate JWT
export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.header("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return next(new HttpException(HttpStatus.FORBIDDEN, "No token found"));
  }

  if (await isBlacklisted(token)) {
    return next(new HttpException(HttpStatus.FORBIDDEN, "Token has expired"));
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) {
      return next(new HttpException(HttpStatus.FORBIDDEN, "Invalid token"));
    }

    if (decoded) {
      req.user = decoded as UserPayload;
    }

    next();
  });
};

// Function to sign a JWT token
export const signToken = (payload: UserPayload): string => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN;

  if (!jwtSecret || !jwtExpiresIn) {
    throw new HttpException(
      HttpStatus.INTERNAL_SERVER_ERROR,
      "JWT configuration is missing",
    );
  }

  return jwt.sign(payload, jwtSecret, {
    expiresIn: jwtExpiresIn, // Default expiration (could be longer than 1 ms)
  } as SignOptions);
};

// Function to set an invalid (logout) token with manual 1ms expiration
export const setInvalidToken = (): string => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new HttpException(
      HttpStatus.INTERNAL_SERVER_ERROR,
      "JWT secret is missing",
    );
  }

  const issuedAt = Date.now(); // Track the exact moment the token was created

  // Issue a logout token that includes the `issuedAt` timestamp
  return jwt.sign(
    { logout: "logout", issuedAt }, // Include issuedAt to track when token was created
    jwtSecret,
    {
      expiresIn: "3s", // Fallback expiration of 1 second
    } as SignOptions,
  );
};

// Middleware to authorize user roles (check if user has allowed roles)
export const authorizeRole = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user || !allowedRoles.includes(user.role)) {
      return next(new HttpException(HttpStatus.FORBIDDEN, "Access denied"));
    }

    next();
  };
};

// Add token to Redis blacklist with expiration
export const addToBlacklist = async (token: string, exp: number) => {
  const ttl = exp - Math.floor(Date.now() / 1000); // seconds until token expires
  if (ttl > 0) {
    await redisClient.set(`bl_${token}`, "1", { EX: ttl });
  }
};

// Check if token is blacklisted
export const isBlacklisted = async (token: string) => {
  const result = await redisClient.get(`bl_${token}`);
  return result === "1";
};
