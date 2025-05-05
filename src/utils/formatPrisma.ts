// error-formatter.ts
import { Prisma } from "@prisma/client";
import { HttpStatus } from "./http-status";
import HttpException from "./http-error";

export const formatPrismaError = (error: unknown): HttpException => {
  if (error instanceof Error) {
    // Handle Prisma known errors
    if ("code" in error) {
      const prismaError = error as {
        code: string;
        meta?: any;
        message: string;
      };

      // Helper function to clean error messages
      const cleanMessage = (message: string) => {
        return message
          .replace(/\\n/g, "\n")
          .replace(/\s+at\s+.*\.ts:\d+:\d+/g, "")
          .replace(/Invocation:\n\n/, "")
          .replace(/Error in invocation: /, "")
          .replace(/Argument `[^`]+` of type \S+/, "")
          .trim();
      };

      // Helper function to format field names
      const formatFieldNames = (fields: string[] | undefined) => {
        if (!fields) return "unknown field";
        return fields.map((field) => `\`${field}\``).join(", ");
      };

      switch (prismaError.code) {
        case "P2002": {
          const fields = formatFieldNames(prismaError.meta?.target);
          return new HttpException(
            HttpStatus.CONFLICT,
            `Duplicate entry error: The value(s) for ${fields} already exist(s) in the database. Please use a unique value.`,
          );
        }

        case "P2025": {
          const model = prismaError.meta?.model || "record";
          const cause =
            prismaError.meta?.cause || "The requested resource does not exist";
          return new HttpException(
            HttpStatus.NOT_FOUND,
            `Not found error: ${cause}. Please check if the ${model} exists and try again.`,
          );
        }

        case "P2003": {
          const field = prismaError.meta?.field_name || "unknown field";
          const relation = prismaError.meta?.relation_name || "related record";
          return new HttpException(
            HttpStatus.BAD_REQUEST,
            `Foreign key error: The value for \`${field}\` does not exist in the ${relation}. Please provide a valid reference.`,
          );
        }

        case "P2014": {
          const relation = prismaError.meta?.relation_name || "relationship";
          return new HttpException(
            HttpStatus.BAD_REQUEST,
            `Invalid ID error: The provided ID for the ${relation} is invalid. Please check the ID format and try again.`,
          );
        }

        case "P2016": {
          const field = prismaError.meta?.field_name || "field";
          return new HttpException(
            HttpStatus.BAD_REQUEST,
            `Required field error: The \`${field}\` field is required but was not provided. Please include this field in your request.`,
          );
        }

        default:
          return new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Database error: ${cleanMessage(prismaError.message)}`,
          );
      }
    }

    // Handle validation errors
    if (error.message.includes("Invalid `prisma.")) {
      const cleanMessage = error.message
        .replace(/Invalid `prisma\.[^`]+`/, "")
        .replace(/invocation:\n\n/, "")
        .trim();

      return new HttpException(
        HttpStatus.BAD_REQUEST,
        `Validation error: ${cleanMessage}`,
      );
    }

    // Handle connection errors
    if (error.message.includes("Could not connect to database")) {
      return new HttpException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Database connection error: Unable to establish connection to the database. Please check your database configuration and try again.",
      );
    }

    // Handle timeout errors
    if (error.message.includes("timeout")) {
      return new HttpException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Database timeout error: The operation took too long to complete. Please try again later.",
      );
    }
  }

  // Fallback for unknown errors
  return new HttpException(
    HttpStatus.INTERNAL_SERVER_ERROR,
    "An unexpected error occurred. Please check the server logs for more details.",
  );
};
