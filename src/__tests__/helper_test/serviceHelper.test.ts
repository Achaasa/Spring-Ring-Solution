import { Service, ServiceType } from "@prisma/client";
import * as serviceHelper from "../../helper/serviceHelper";
import prisma from "../../utils/prisma";
import HttpException from "../../utils/http-error";

jest.mock("../../utils/prisma", () => ({
  service: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(), // <-- Add this line
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("Service Helper", () => {
  const mockService: Partial<Service> = {
    id: "1",
    name: "Test Service",
    description: "Test Description",
    type: "HOSTEL" as ServiceType,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createService", () => {
    it("should create a service successfully", async () => {
      (prisma.service.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.service.create as jest.Mock).mockResolvedValue({
        ...mockService,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await serviceHelper.createService(mockService as Service);
      expect(result).toHaveProperty("id", mockService.id);
      expect(result).toHaveProperty("name", mockService.name);
      expect(prisma.service.create).toHaveBeenCalledWith({
        data: mockService,
      });
    });

    it("should throw error if service with same name and type exists", async () => {
      (prisma.service.findFirst as jest.Mock).mockResolvedValue(mockService);

      await expect(
        serviceHelper.createService(mockService as Service)
      ).rejects.toThrow(HttpException);
      expect(prisma.service.create).not.toHaveBeenCalled();
    });
  });

  describe("getServices", () => {
    it("should get all services", async () => {
      const mockServices = [mockService];
      (prisma.service.findMany as jest.Mock).mockResolvedValue(mockServices);

      const result = await serviceHelper.getServices();
      expect(result).toEqual(mockServices);
      expect(prisma.service.findMany).toHaveBeenCalled();
    });
  });

  describe("getServiceById", () => {
    it("should get service by id", async () => {
      (prisma.service.findUnique as jest.Mock).mockResolvedValue(mockService);

      const result = await serviceHelper.getServiceById("1");
      expect(result).toEqual(mockService);
      expect(prisma.service.findUnique).toHaveBeenCalledWith({
        where: { id: "1", delFlag: false },
      });
    });

    it("should throw error if service not found", async () => {
      (prisma.service.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(serviceHelper.getServiceById("1")).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe("updateService", () => {
    it("should update a service successfully", async () => {
      const updateData = {
        name: "Updated Service Name",
        description: "Updated Description",
      };

      (prisma.service.findUnique as jest.Mock).mockResolvedValue(mockService);
      (prisma.service.update as jest.Mock).mockResolvedValue({
        ...mockService,
        ...updateData,
      });

      const result = await serviceHelper.updateService("1", updateData);
      expect(result).toHaveProperty("name", updateData.name);
      expect(result).toHaveProperty("description", updateData.description);
      expect(prisma.service.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: updateData,
      });
    });

    it("should throw error if service not found", async () => {
      (prisma.service.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        serviceHelper.updateService("1", { name: "Updated Name" }),
      ).rejects.toThrow(HttpException);
    });
  });

  describe("deleteService", () => {
    it("should delete service successfully", async () => {
      (prisma.service.findUnique as jest.Mock).mockResolvedValue(mockService);
      (prisma.service.update as jest.Mock).mockResolvedValue({
        ...mockService,
        delFlag: true,
      });

      await serviceHelper.deleteService("1");
      expect(prisma.service.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: { delFlag: true },
      });
    });

    it("should throw error if service not found", async () => {
      (prisma.service.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(serviceHelper.deleteService("1")).rejects.toThrow(
        HttpException,
      );
    });
  });
});
