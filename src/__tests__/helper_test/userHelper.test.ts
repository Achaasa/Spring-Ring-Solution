import { User } from "@prisma/client";
import * as userHelper from "../../helper/userHelper";
import prisma from "../../utils/prisma";
import HttpException from "../../utils/http-error";
import { HttpStatus } from "../../utils/http-status";

jest.mock("../../utils/prisma", () => ({
  user: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn((callback) => callback()),
}));

jest.mock("../../utils/bcrypt", () => ({
  hashPassword: jest.fn().mockResolvedValue("hashedPassword123"),
}));

describe("User Helper Tests", () => {
  const mockUser: Partial<User> = {
    id: "123e4567-e89b-12d3-a456-426614174001",
    email: "test@example.com",
    name: "Test User",
    password: "password123",
    role: "USER",
  };

  const picture = {
    imageUrl: "http://example.com/image.jpg",
    imageKey: "image123",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    it("should create a new user successfully", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        ...mockUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await userHelper.createUser(mockUser as User, picture);
      expect(result).toHaveProperty("email", mockUser.email);
      expect(result).toHaveProperty("name", mockUser.name);
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it("should throw an error if email already exists", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        userHelper.createUser(mockUser as User, picture),
      ).rejects.toThrow(
        new HttpException(HttpStatus.CONFLICT, "Email already exists"),
      );
    });
  });

  describe("getUsers", () => {
    it("should return all users", async () => {
      const mockUsers = [mockUser];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const result = await userHelper.getUsers();
      expect(result).toEqual(mockUsers);
      expect(prisma.user.findMany).toHaveBeenCalled();
    });
  });

  describe("getUserById", () => {
    it("should return user by id", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await userHelper.getUserById(
        "123e4567-e89b-12d3-a456-426614174001",
      );
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "123e4567-e89b-12d3-a456-426614174001" },
      });
    });

    it("should throw error if user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        userHelper.getUserById("123e4567-e89b-12d3-a456-426614174001"),
      ).rejects.toThrow(
        new HttpException(HttpStatus.NOT_FOUND, "User not found"),
      );
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.delete as jest.Mock).mockResolvedValue(mockUser);

      await userHelper.deleteUser("123e4567-e89b-12d3-a456-426614174001");
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: "123e4567-e89b-12d3-a456-426614174001" },
      });
    });

    it("should throw error if user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        userHelper.deleteUser("123e4567-e89b-12d3-a456-426614174001"),
      ).rejects.toThrow(
        new HttpException(HttpStatus.NOT_FOUND, "User not found"),
      );
    });
  });

  describe("getUserByEmail", () => {
    it("should return user by email", async () => {
      const mockUser = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Test User",
        email: "test@example.com",
        password: "hashedPassword",
        phoneNumber: "1234567890",
        role: "USER",
        imageKey: "",
        imageUrl: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        status: "ACTIVE",
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await userHelper.getUserByEmail("test@example.com");
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
    });

    it("should return null if user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await userHelper.getUserByEmail("nonexistent@example.com");
      expect(result).toBeNull();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "nonexistent@example.com" },
      });
    });
  });

  describe("updateUser", () => {
    it("should update user successfully without picture", async () => {
      const updateData: Partial<User> = {
        name: "Updated User",
        phoneNumber: "1234567890",
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        ...updateData,
      });

      const result = await userHelper.updateUser("123", updateData);
      expect(result).toHaveProperty("name", "Updated User");
      expect(result).toHaveProperty("phoneNumber", "1234567890");
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "123" },
        data: updateData,
      });
    });

    it("should update user with picture", async () => {
      const updateData: Partial<User> = {
        name: "Updated User",
      };
      const newPicture = {
        imageUrl: "http://new-image.com/image.jpg",
        imageKey: "new-image123",
      };

      const mockUserWithImage = {
        ...mockUser,
        imageKey: "old-image123",
        imageUrl: "http://old-image.com/image.jpg",
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(
        mockUserWithImage,
      );
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUserWithImage,
        ...updateData,
        ...newPicture,
      });

      const result = await userHelper.updateUser("123", updateData, newPicture);
      expect(result).toHaveProperty("name", "Updated User");
      expect(result).toHaveProperty("imageUrl", newPicture.imageUrl);
      expect(result).toHaveProperty("imageKey", newPicture.imageKey);
    });

    it("should update user password", async () => {
      const updateData: Partial<User> = {
        password: "newPassword123",
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        password: "hashedPassword123", // This comes from the mocked hashPassword
      });

      const result = await userHelper.updateUser("123", updateData);
      expect(prisma.user.update).toHaveBeenCalled();
      expect(result).not.toHaveProperty("password"); // Password should be excluded from response
    });

    it("should throw error if user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        userHelper.updateUser("123", { name: "Updated User" }),
      ).rejects.toThrow(
        new HttpException(HttpStatus.NOT_FOUND, "User not found"),
      );
    });

    it("should throw error if validation fails", async () => {
      const invalidData: Partial<User> = {
        email: "invalid-email",
      };

      await expect(userHelper.updateUser("123", invalidData)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe("getUserProfileHelper", () => {
    const mockToken =
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsInJvbGUiOiJVU0VSIiwiZXhwIjoxOTk5OTk5OTk5fQ.signature";

    it("should get user profile successfully", async () => {
      const mockDecodedToken = {
        id: "123",
        role: "USER",
        exp: Date.now() / 1000 + 3600, // Token expires in 1 hour
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await userHelper.getUserProfileHelper(mockToken);
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockDecodedToken.id },
      });
    });

    it("should throw error if no token provided", async () => {
      await expect(userHelper.getUserProfileHelper("")).rejects.toThrow(
        new HttpException(HttpStatus.FORBIDDEN, "No token provided"),
      );
    });

    it("should throw error if invalid token format", async () => {
      await expect(
        userHelper.getUserProfileHelper("Invalid-Token"),
      ).rejects.toThrow(
        new HttpException(HttpStatus.FORBIDDEN, "Invalid token format"),
      );
    });

    it("should throw error if user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(userHelper.getUserProfileHelper(mockToken)).rejects.toThrow(
        new HttpException(HttpStatus.NOT_FOUND, "User not found"),
      );
    });
  });
});
