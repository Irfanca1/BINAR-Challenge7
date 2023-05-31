const ApplicationController = require('./ApplicationController');
const NotFoundError = require('../errors/NotFoundError');
const ApplicationError = require('../errors/ApplicationError');

describe('ApplicationController', () => {
  describe('#handleGetRoot', () => {
    it('should call res.status(200) and res.Json with status and message', () => {
      const mockRequest = {};

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const controller = new ApplicationController();
      controller.handleGetRoot(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'OK',
        message: 'BCR API is up and running!',
      });
    });
  });

  describe('#handleNotFound', () => {
    it('should call res.status(200) and res.Json with status and message', () => {
      const mockRequest = {
        method: 'get',
        url: 'google.co.id',
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const err = new NotFoundError(mockRequest.method, mockRequest.url);
      const controller = new ApplicationController();
      controller.handleNotFound(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          name: err.name,
          message: err.message,
          details: err.details,
        },
      });
    });
  });

  describe('#handleError', () => {
    it('should call res.status(500) and res.Json with status and message', () => {
      const mockRequest = {
        method: 'get',
        url: 'google.co.id',
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const mockNext = {};

      const err = new NotFoundError(mockRequest.method, mockRequest.url);

      const controller = new ApplicationController();
      controller.handleError(err, mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          name: err.name,
          message: err.message,
          details: err.details || null,
        },
      });
    });
  });

  describe('#getOffsetFromRequest', () => {
    it('should return the offset from request', () => {
      const mockRequest = {
        query: {
          page: 1,
          pageSize: 10,
        },
      };
      const controller = new ApplicationController();
      const offset = controller.getOffsetFromRequest(mockRequest);

      expect(offset).toEqual(0);
    });
  });

  describe('#buildPaginationObject', () => {
    it('should return the Pagination from request', () => {
      const mockRequest = {
        query: {
          page: 1,
          pageSize: 10,
        },
      };
      const count = 1;

      const controller = new ApplicationController();
      const result = controller.buildPaginationObject(mockRequest, count);

      expect(result).toEqual({
        page: 1,
        pageCount: 1,
        pageSize: 10,
        count: 1,
      });
    });
  });
});
