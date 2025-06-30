
import prisma from "../../utils/prisma";
import * as bcrypt from "../../utils/bcrypt";
import { createAdminUser } from "../../controller/adminPanel";

// Mock dependencies
jest.mock("../../utils/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
}));

jest.mock("../../utils/bcrypt", () => ({
  hashPassword: jest.fn(),
}));

describe("Admin Panel Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ADMIN_EMAIL = "admin@test.com";
    process.env.ADMIN_PASSWORD = "testpassword";
  });

  afterEach(() => {
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD;
  });

  describe("createAdminUser", () => {
    it("should create admin user when one does not exist", async () => {
      // Mock dependencies
      const hashedPassword = "hashedpassword123";
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: "1",
        name: "Admin",
        email: "admin@test.com",
        role: "SUPER_ADMIN",
      });

      // Run the function
      await createAdminUser();

      // Verify the admin user creation flow
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "admin@test.com" },
      });
      expect(bcrypt.hashPassword).toHaveBeenCalledWith("testpassword");
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: "Admin",
          email: "admin@test.com",
          password: hashedPassword,
          phoneNumber: "1234567890",
          role: "ADMIN",
          imageKey: "",
          imageUrl: "",
        },
      });
      expect(prisma.$disconnect).toHaveBeenCalled();
    });

    it("should not create admin user when one already exists", async () => {
      // Mock existing admin
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "1",
        name: "Admin",
        email: "admin@test.com",
        role: "ADMIN",
      });

      // Run the function
      await createAdminUser();

      // Verify no creation attempt was made
      expect(prisma.user.findUnique).toHaveBeenCalled();
      expect(bcrypt.hashPassword).not.toHaveBeenCalled();
      expect(prisma.user.create).not.toHaveBeenCalled();
      expect(prisma.$disconnect).toHaveBeenCalled();
    });

    it("should handle errors properly", async () => {
      // Mock an error
      const mockError = new Error("Database connection failed");
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(mockError);

      // Verify error handling
      await expect(createAdminUser()).rejects.toThrow();
      expect(prisma.$disconnect).toHaveBeenCalled();
    });
  });
});
