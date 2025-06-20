import { Request, Response, NextFunction } from "express";
import addressesService from "../services/addresses.service";
import { httpStatus, sendJsonSuccess } from "../helpers/response.helper";

// Get all addresses
const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await addressesService.getAll(req.query);
    sendJsonSuccess(res, result, httpStatus.OK.statusCode, httpStatus.OK.message);
  } catch (error) {
    next(error);
  }
};

// Get address by ID
const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await addressesService.getById(id);
    sendJsonSuccess(res, result, httpStatus.OK.statusCode, httpStatus.OK.message);
  } catch (error) {
    next(error);
  }
};

// Get addresses by user ID
const getByUserId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      res.status(400).json({ success: false, message: "Missing userId in params" });
      return;
    }

    const result = await addressesService.getByUserId(userId, req.query);
    sendJsonSuccess(res, result, httpStatus.OK.statusCode, httpStatus.OK.message);
  } catch (error) {
    next(error);
  }
};

// Create a new address
const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await addressesService.create(req.body);
    sendJsonSuccess(res, result, httpStatus.CREATED.statusCode, httpStatus.CREATED.message);
  } catch (error) {
    next(error);
  }
};

// Update address by ID
const updateById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await addressesService.updateById(id, req.body);
    sendJsonSuccess(res, result, httpStatus.OK.statusCode, httpStatus.OK.message);
  } catch (error) {
    next(error);
  }
};

// Delete address by ID
const deleteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await addressesService.deleteById(id);
    sendJsonSuccess(res, result, httpStatus.OK.statusCode, httpStatus.OK.message);
  } catch (error) {
    next(error);
  }
};

// Update isDefault address
const updateAddressDefault = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await addressesService.updateAddressDefault(id);
    sendJsonSuccess(res, result, httpStatus.OK.statusCode, httpStatus.OK.message);
  } catch (error) {
    next(error);
  }
};

export default {
  getAll,
  getById,
  getByUserId,
  create,
  updateById,
  deleteById,
  updateAddressDefault,
};
