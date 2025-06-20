import { NextFunction, Request, Response } from "express";
import { httpStatus, sendJsonSuccess } from "../helpers/response.helper";
import passwordsService from "../services/passwords.service";

const handleChangePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!req.user || !req.user._id) {
      res.status(401).json({ message: "Unauthorized: user not found" });
      return;
    }
    const userId = req.user._id;
    await passwordsService.changePassword(userId, currentPassword, newPassword);
    sendJsonSuccess(res, null, httpStatus.OK.statusCode, httpStatus.OK.message);
  } catch (error: any) {
    next(error);
  }
};
const handleResetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      res.status(400).json({ message: "Missing userId or newPassword" });
      return;
    }

    await passwordsService.resetPassword(userId, newPassword);

    sendJsonSuccess(res, null, httpStatus.OK.statusCode, "Password reset successfully");
  } catch (error) {
    next(error);
  }
};
export default {
  handleChangePassword,
  handleResetPassword
};
