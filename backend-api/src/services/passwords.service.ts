import { User } from "../models/users.model";
import createError from "http-errors";
import bcrypt from "bcrypt";
const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw createError(404, "Không tìm thấy người dùng");
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw createError(400, "Mật khẩu cũ không đúng");
  }
  user.password = newPassword;
  await user.save();
};

const resetPassword = async (userId: string, newPassword: string) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(userId, { password: hashedPassword });
};
export default {
  changePassword,
  resetPassword
};
