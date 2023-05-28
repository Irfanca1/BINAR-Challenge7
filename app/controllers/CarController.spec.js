const { Car } = require('../models');
const CarController = require('./CarController');

describe('CarController', () => {
  describe('#handleListCars', () => {
    it('should call res.status(200) and res.json with list of car instances', async () => {
      // Persiapan pengujian
      const name = 'Honda';
      const price = 200000;
      const size = 'small';
      const image = 'honda.png';

      const mockRequest = {
        query: {
          page: 1,
          pageSize: 10,
        },
      };

      const cars = [];

      for (let i = 0; i < 10; i++) {
        const car = new Car({ name, price, size, image });
        cars.push(car);
      }

      const mockCarModel = {
        findAll: jest.fn().mockReturnValue(cars),
        count: jest.fn().mockReturnValue(10),
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const carController = new CarController({ carModel: mockCarModel });

      // Panggil metode yang diuji
      await carController.handleListCars(mockRequest, mockResponse);

      // Asersi
      expect(mockCarModel.findAll).toHaveBeenCalledWith({
        where: {},
        include: { model: undefined, as: 'userCar', required: false },
        offset: 0,
        limit: 10,
      });
      expect(mockCarModel.count).toHaveBeenCalledWith({
        where: {},
        include: { model: undefined, as: 'userCar', required: false },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        cars,
        meta: {
          pagination: {
            page: 1,
            pageSize: 10,
            count: 10,
            pageCount: 1,
          },
        },
      });
    });
  });

  describe('#handleCreateCar', () => {
    it('should call res.status(201) and res.json with car instance', async () => {
      const name = 'Honda';
      const price = 200000;
      const size = 'small';
      const image = 'honda.png';

      const mockRequest = {
        body: {
          name,
          price,
          size,
          image,
          isCurrentlyRented: false,
        },
      };

      const car = new Car({ name, price, size, image });
      const mockCarModel = { create: jest.fn().mockReturnValue(car) };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const carController = new CarController({ carModel: mockCarModel });

      await carController.handleCreateCar(mockRequest, mockResponse);

      expect(mockCarModel.create).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(car);
    });

    it('should call res.status(422) and res.json with car instance', async () => {
      const err = new Error('Something');
      const name = 'Honda';
      const price = 200000;
      const size = 'small';
      const image = 'honda.png';

      const mockRequest = {
        body: {
          name,
          price,
          size,
          image,
          isCurrentlyRented: false,
        },
      };

      const mockCarModel = {
        create: jest.fn().mockReturnValue(Promise.reject(err)),
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const carController = new CarController({ carModel: mockCarModel });

      await carController.handleCreateCar(mockRequest, mockResponse);

      expect(mockCarModel.create).toHaveBeenCalledWith({
        name,
        price,
        size,
        image,
        isCurrentlyRented: false,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          name: err.name,
          message: err.message,
        },
      });
    });
  });

  describe('#handleGetCar', () => {
    it('should call res.status(200) and res.json with car instance', async () => {
      const name = 'Honda';
      const price = 300000;
      const size = 'small';
      const image = 'honda.png';

      const mockRequest = {
        params: {
          id: 1,
        },
      };

      const mockCar = new Car({ name, price, size, image });
      const mockCarModel = { findByPk: jest.fn().mockResolvedValue(mockCar) };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const carController = new CarController({ carModel: mockCarModel });
      await carController.handleGetCar(mockRequest, mockResponse);

      expect(mockCarModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCar);
    });
  });

  describe('#handleUpdateCar', () => {
    it('should call car.update and res.status(200) and res.json with updated car instance', async () => {
      const name = 'Updated Honda';
      const price = 400000;
      const size = 'medium';
      const image = 'updated_honda.png';

      const mockRequest = {
        body: { name, price, size, image },
      };

      const car = new Car({
        id: 1,
        name: 'Honda',
        price: 300000,
        size: 'small',
        image: 'honda.png',
      });
      const mockUpdate = jest.fn().mockResolvedValue(car);

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const carController = new CarController({});
      carController.getCarFromRequest = jest.fn().mockReturnValue(car);
      car.update = mockUpdate;

      await carController.handleUpdateCar(mockRequest, mockResponse);

      expect(carController.getCarFromRequest).toHaveBeenCalledWith(mockRequest);
      expect(car.update).toHaveBeenCalledWith({
        name,
        price,
        size,
        image,
        isCurrentlyRented: false,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(car);
    });

    it('should call res.status(422) and res.json with error instance', async () => {
      const error = new Error('Validation Error');
      const mockRequest = {
        body: {},
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const carController = new CarController({});
      carController.getCarFromRequest = jest.fn().mockImplementation(() => {
        throw error;
      });

      await carController.handleUpdateCar(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          name: error.name,
          message: error.message,
        },
      });
    });
  });

  describe('#handleDeleteCar', () => {
    it('should call carModel.destroy and res.status(204)', async () => {
      const mockRequest = {
        params: {
          id: 1,
        },
      };

      const mockDestroy = jest.fn();

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        end: jest.fn(),
      };

      const carController = new CarController({ carModel: { destroy: mockDestroy } });

      await carController.handleDeleteCar(mockRequest, mockResponse);

      expect(mockDestroy).toHaveBeenCalledWith(mockRequest.params.id);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.end).toHaveBeenCalled();
    });
  });
});
