import couponsService from "../services/coupons.service";
import { Request, Response, NextFunction } from "express";
import { httpStatus, sendJsonSuccess } from "../helpers/response.helper";

//Get All
const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupons = await couponsService.getAll(req.query);
    sendJsonSuccess(
      res,
      coupons,
      httpStatus.OK.statusCode,
      httpStatus.OK.message
    );
  } catch (error) {
    next(error);
  }
};
// get by id
const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const coupon = await couponsService.getById(id);
    sendJsonSuccess(
      res,
      coupon,
      httpStatus.OK.statusCode,
      httpStatus.OK.message
    );
  } catch (error) {
    next(error);
  }
};
//create
const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.body;
    const coupon = await couponsService.create(payload);
    sendJsonSuccess(
      res,
      coupon,
      httpStatus.CREATED.statusCode,
      httpStatus.CREATED.message
    );
  } catch (error) {
    next(error);
  }
};
// update by id
const updateById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const coupon = await couponsService.updateById(id, payload);
    sendJsonSuccess(
      res,
      coupon,
      httpStatus.OK.statusCode,
      httpStatus.OK.message
    );
  } catch (error) {
    next(error);
  }
};
// delete by id
const deleteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const coupon = await couponsService.deleteById(id);
    sendJsonSuccess(
      res,
      coupon,
      httpStatus.OK.statusCode,
      httpStatus.OK.message
    );
  } catch (error) {
    next(error);
  }
};
const checkCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, items } = req.body;
    const result = await couponsService.checkCoupon(code, items);
    sendJsonSuccess(
      res,
      result,
      httpStatus.OK.statusCode,
      httpStatus.OK.message
    ); // Trả về toàn bộ
  } catch (error) {
    next(error);
  }
};

export default {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
  checkCoupon,
};
