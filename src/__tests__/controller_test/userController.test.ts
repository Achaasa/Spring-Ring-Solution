import { Request, Response } from "express";
import {
  signUpUser,
  getAllUsers,
  getUserByEmail,
  getUserById,
  updateUser,
  deleteUser,
  userLogIn,
  getUserProfile,
  logout,
} from "../../controller/userController";
import * as userHelper from "../../helper/userHelper";
import cloudinary from "../../utils/cloudinary";
import { jwtDecode } from "jwt-decode";
import { HttpStatus } from "../../utils/http-status";
import { Readable } from "stream";
import * as jwt from "../../utils/jsonwebtoken";
import HttpException from "../../utils/http-error";

jest.mock("../../helper/userHelper");
jest.mock("../../utils/cloudinary", () => ({
  __esModule: true,
  default: {
    uploader: {
      upload: jest.fn(),
    },
  },
}));
jest.mock("jwt-decode");
jest.mock("../../utils/jsonwebtoken");

describe("User Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnThis();
    mockNext = jest.fn();
    mockRequest = {
      body: {},
      params: {},
      headers: {},
      header: jest.fn(),
    };
    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };
  });

  describe("signUpUser", () => {
    it("should create user successfully with photo", async () => {
      const mockStream = new Readable();
      mockStream.push(null); // End the stream

      const mockFile = {
        fieldname: "photo",
        originalname: "test.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        destination: "/tmp",
        filename: "test123.jpg",
        path: "test/path.jpg",
        size: 12345,
        buffer: Buffer.from("test"),
        stream: mockStream,
      };

      mockRequest.file = mockFile as Express.Multer.File;
      mockRequest.body = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };

      const mockCloudinaryResponse = {
        secure_url: "https://test.com/image.jpg",
        public_id: "test123",
      };

      const mockUser = {
        id: "1",
        name: "Test User",
        email: "test@example.com",
      };

      (cloudinary.uploader.upload as jest.Mock).mockResolvedValue(
        mockCloudinaryResponse,
      );
      (userHelper.createUser as jest.Mock).mockResolvedValue(mockUser);

      await signUpUser(
        mockRequest as Request,
        mockResponse as Response,
        jest.fn(),
      );

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockJson).toHaveBeenCalledWith({
        message: "user created successfully",
        user: mockUser,
      });
    });
  });

  describe("getAllUsers", () => {
    it("should return all users successfully", async () => {
      const mockUsers = [
        { id: "1", name: "User 1" },
        { id: "2", name: "User 2" },
      ];

      (userHelper.getUsers as jest.Mock).mockResolvedValue(mockUsers);

      await getAllUsers(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockJson).toHaveBeenCalledWith(mockUsers);
    });

    it("should handle errors properly", async () => {
      const mockError = new Error("Failed to fetch users");
      (userHelper.getUsers as jest.Mock).mockRejectedValue(mockError);

      await getAllUsers(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockStatus).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
        }),
      );
    });
  });

  describe("getUserByEmail", () => {
    it("should return user by email successfully", async () => {
      const mockUser = { id: "1", email: "test@example.com" };
      mockRequest.body = { email: "test@example.com" };

      (userHelper.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);

      await getUserByEmail(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockJson).toHaveBeenCalledWith(mockUser);
    });

    it("should handle errors properly", async () => {
      mockRequest.body = { email: "test@example.com" };
      const mockError = new Error("User not found");
      (userHelper.getUserByEmail as jest.Mock).mockRejectedValue(mockError);

      await getUserByEmail(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockStatus).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
        }),
      );
    });
  });

  describe("getUserById", () => {
    it("should return user by ID successfully", async () => {
      const mockUser = { id: "1", name: "Test User" };
      mockRequest.params = { userId: "1" };

      (userHelper.getUserById as jest.Mock).mockResolvedValue(mockUser);

      await getUserById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockJson).toHaveBeenCalledWith(mockUser);
    });

    it("should handle errors properly", async () => {
      mockRequest.params = { userId: "1" };
      const mockError = new Error("User not found");
      (userHelper.getUserById as jest.Mock).mockRejectedValue(mockError);

      await getUserById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockStatus).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
        }),
      );
    });
  });

  describe("updateUser", () => {
    it("should update user successfully with photo", async () => {
      const mockStream = new Readable();
      mockStream.push(null);

      const mockFile = {
        fieldname: "photo",
        originalname: "test.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        destination: "/tmp",
        filename: "test123.jpg",
        path: "test/path.jpg",
        size: 12345,
        buffer: Buffer.from("test"),
        stream: mockStream,
      };

      mockRequest.params = { userId: "1" };
      mockRequest.file = mockFile as Express.Multer.File;
      mockRequest.body = { name: "Updated Name" };

      const mockCloudinaryResponse = {
        secure_url: "https://test.com/image.jpg",
        public_id: "test123",
      };

      const mockUpdatedUser = {
        id: "1",
        name: "Updated Name",
        imageUrl: mockCloudinaryResponse.secure_url,
      };

      (cloudinary.uploader.upload as jest.Mock).mockResolvedValue(
        mockCloudinaryResponse,
      );
      (userHelper.updateUser as jest.Mock).mockResolvedValue(mockUpdatedUser);

      await updateUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockJson).toHaveBeenCalledWith({
        message: "user updated successfully",
        user: mockUpdatedUser,
      });
    });

    it("should handle errors properly", async () => {
      mockRequest.params = { userId: "1" };
      mockRequest.body = { name: "Updated Name" };
      const mockError = new Error("Failed to update user");
      (userHelper.updateUser as jest.Mock).mockRejectedValue(mockError);

      await updateUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockStatus).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
        }),
      );
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      mockRequest.params = { userId: "1" };

      await deleteUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockJson).toHaveBeenCalledWith({
        message: "user deleted successfully: 1",
      });
    });

    it("should handle errors properly", async () => {
      mockRequest.params = { userId: "1" };
      const mockError = new Error("Failed to delete user");
      (userHelper.deleteUser as jest.Mock).mockRejectedValue(mockError);

      await deleteUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockStatus).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
        }),
      );
    });
  });

  describe("getUserProfile", () => {
    it("should return user profile successfully", async () => {
      const mockToken = "valid.jwt.token";
      const mockDecodedToken = { id: "1" };
      const mockUser = {
        id: "1",
        name: "Test User",
        email: "test@example.com",
        password: "hashedPassword",
      };

      (mockRequest.header as jest.Mock).mockReturnValue(`Bearer ${mockToken}`);
      (jwtDecode as jest.Mock).mockReturnValue(mockDecodedToken);
      (userHelper.getUserById as jest.Mock).mockResolvedValue(mockUser);

      await getUserProfile(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      const { password, ...restofUser } = mockUser;
      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockJson).toHaveBeenCalledWith({ restofUser });
    });

    it("should handle missing token", async () => {
      (mockRequest.header as jest.Mock).mockReturnValue(null);

      await getUserProfile(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(mockJson).toHaveBeenCalledWith({
        message: "No token found",
      });
    });

    it("should handle user not found", async () => {
      const mockToken = "valid.jwt.token";
      const mockDecodedToken = { id: "1" };

      (mockRequest.header as jest.Mock).mockReturnValue(`Bearer ${mockToken}`);
      (jwtDecode as jest.Mock).mockReturnValue(mockDecodedToken);
      (userHelper.getUserById as jest.Mock).mockResolvedValue(null);

      await getUserProfile(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockJson).toHaveBeenCalledWith({
        message: "user not found",
      });
    });
  });

  describe("logout", () => {
    beforeEach(() => {
      process.env.JWT_SECRET = "test-secret";
    });

    afterEach(() => {
      delete process.env.JWT_SECRET;
    });

    it("should logout successfully", async () => {
      (jwt.setInvalidToken as jest.Mock).mockReturnValue("invalid.token");

      await logout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockJson).toHaveBeenCalledWith({
        message: "Logout successful",
      });
    });

    it("should handle errors properly", async () => {
      const mockError = new HttpException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Failed to logout",
      );
      (jwt.setInvalidToken as jest.Mock).mockImplementation(() => {
        throw mockError;
      });

      await logout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(mockError.status);
      expect(mockJson).toHaveBeenCalledWith({
        message: mockError.message,
      });
    });
  });

  describe("userLogIn", () => {
    beforeEach(() => {
      process.env.JWT_SECRET = "test-secret";
      (mockRequest.header as jest.Mock).mockReturnValue(
        "Bearer valid.jwt.token",
      );
    });

    afterEach(() => {
      delete process.env.JWT_SECRET;
    });

    it("should login successfully with valid token", async () => {
      const mockToken = "valid.jwt.token";
      const mockDecodedToken = {
        id: "1",
        role: "USER",
        exp: Math.floor(Date.now() / 1000) + 3600, // Token expires in 1 hour
      } as jwt.UserPayload & { exp: number };

      const mockUser = {
        id: "1",
        email: "test@example.com",
        password: "hashedPassword",
        role: "USER",
        name: "Test User",
        imageKey: "",
        imageUrl: "",
        phoneNumber: "1234567890",
      };

      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`,
      };
      mockRequest.body = {
        email: "test@example.com",
        password: "password123",
      };

      (jwtDecode as jest.Mock).mockReturnValue(mockDecodedToken);
      (userHelper.getUserById as jest.Mock).mockResolvedValue(mockUser);

      await userLogIn(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockJson).toHaveBeenCalledWith({
        message: "success logging in",
        userId: mockUser.id,
        token: mockToken,
      });
    });
  });
});
