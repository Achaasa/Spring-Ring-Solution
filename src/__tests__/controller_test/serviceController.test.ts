import { Request, Response } from "express";
import {
  MockRequest,
  MockResponse,
  createRequest,
  createResponse,
} from "node-mocks-http";
import {
  createServiceHandler,
  getServicesHandler,
  getServiceByIdHandler,
  updateServiceHandler,
  deleteServiceHandler,
} from "../../controller/serviceController";
import * as serviceHelper from "../../helper/serviceHelper";
import { HttpStatus } from "../../utils/http-status";

jest.mock("../../helper/serviceHelper");

describe("Service Controller", () => {
  let mockRequest: MockRequest<Request>;
  let mockResponse: MockResponse<Response>;

  beforeEach(() => {
    mockRequest = createRequest();
    mockResponse = createResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createServiceHandler", () => {
    const mockServiceData = {
      name: "Test Service",
      description: "Test Description",
      price: 100,
    };

    it("should create a new service successfully", async () => {
      const mockCreatedService = { id: "1", ...mockServiceData };
      mockRequest.body = mockServiceData;
      (serviceHelper.createService as jest.Mock).mockResolvedValue(
        mockCreatedService,
      );

      await createServiceHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(HttpStatus.CREATED);
      expect(JSON.parse(mockResponse._getData())).toEqual(mockCreatedService);
    });

    it("should handle errors properly", async () => {
      mockRequest.body = mockServiceData;
      const error = new Error("Database error");
      (serviceHelper.createService as jest.Mock).mockRejectedValue(error);

      await createServiceHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(JSON.parse(mockResponse._getData())).toHaveProperty("message");
    });
  });

  describe("getServicesHandler", () => {
    it("should return all services", async () => {
      const mockServices = [
        { id: "1", name: "Service 1", price: 100 },
        { id: "2", name: "Service 2", price: 200 },
      ];
      (serviceHelper.getServices as jest.Mock).mockResolvedValue(mockServices);

      await getServicesHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(HttpStatus.OK);
      expect(JSON.parse(mockResponse._getData())).toEqual(mockServices);
    });

    it("should handle errors", async () => {
      const error = new Error("Database error");
      (serviceHelper.getServices as jest.Mock).mockRejectedValue(error);

      await getServicesHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(JSON.parse(mockResponse._getData())).toHaveProperty("message");
    });
  });

  describe("getServiceByIdHandler", () => {
    const mockService = {
      id: "1",
      name: "Test Service",
      description: "Test Description",
      price: 100,
    };

    it("should return a service by id", async () => {
      mockRequest.params = { id: "1" };
      (serviceHelper.getServiceById as jest.Mock).mockResolvedValue(
        mockService,
      );

      await getServiceByIdHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(HttpStatus.OK);
      expect(JSON.parse(mockResponse._getData())).toEqual(mockService);
    });

    it("should handle non-existent service", async () => {
      mockRequest.params = { id: "999" };
      const error = new Error("Service not found");
      (serviceHelper.getServiceById as jest.Mock).mockRejectedValue(error);

      await getServiceByIdHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(JSON.parse(mockResponse._getData())).toHaveProperty("message");
    });
  });

  describe("updateServiceHandler", () => {
    const mockUpdateData = {
      name: "Updated Service",
      price: 150,
    };

    it("should update a service successfully", async () => {
      const mockUpdatedService = { id: "1", ...mockUpdateData };
      mockRequest.params = { id: "1" };
      mockRequest.body = mockUpdateData;
      (serviceHelper.updateService as jest.Mock).mockResolvedValue(
        mockUpdatedService,
      );

      await updateServiceHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(HttpStatus.OK);
      expect(JSON.parse(mockResponse._getData())).toEqual(mockUpdatedService);
    });

    it("should handle update errors", async () => {
      mockRequest.params = { id: "1" };
      mockRequest.body = mockUpdateData;
      const error = new Error("Update failed");
      (serviceHelper.updateService as jest.Mock).mockRejectedValue(error);

      await updateServiceHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(JSON.parse(mockResponse._getData())).toHaveProperty("message");
    });
  });

  describe("deleteServiceHandler", () => {
    it("should delete a service successfully", async () => {
      mockRequest.params = { id: "1" };
      (serviceHelper.deleteService as jest.Mock).mockResolvedValue(undefined);

      await deleteServiceHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(HttpStatus.OK);
      expect(mockResponse._getData()).toBe("deleted successfully");
    });

    it("should handle deletion errors", async () => {
      mockRequest.params = { id: "1" };
      const error = new Error("Deletion failed");
      (serviceHelper.deleteService as jest.Mock).mockRejectedValue(error);

      await deleteServiceHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(JSON.parse(mockResponse._getData())).toHaveProperty("message");
    });
  });
});
