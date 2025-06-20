"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { changePassword } from "@/services/passwords.service";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";
import { AxiosError } from "axios";

const schema = yup.object({
  currentPassword: yup.string().required("Vui lòng nhập mật khẩu hiện tại"),
  newPassword: yup
    .string()
    .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự")
    .required("Vui lòng nhập mật khẩu mới"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Mật khẩu xác nhận không khớp")
    .required("Vui lòng xác nhận mật khẩu mới"),
});

type FormValues = yup.InferType<typeof schema>;

export default function PasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });
  const { user } = useAuthStore();
  const onSubmit = async (data: FormValues) => {
    try {
      if (!user?._id) {
        throw new Error("Người dùng chưa đăng nhập");
      }
      const payload = {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      };
      await changePassword(payload);
      toast.success("Đổi mật khẩu thành công!");
      reset();
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const message = error.response?.data?.message;
      if (message === "Mật khẩu cũ không đúng") {
        toast.error("Mật khẩu cũ không đúng");
      } else if (message === "Không tìm thấy người dùng") {
        toast.error("Tài khoản không tồn tại");
      } else {
        console.error("Đã có lỗi xảy ra, vui lòng thử lại: ", err);
        toast.error("Đã có lỗi xảy ra, vui lòng thử lại");
      }
    }
  };

  return (
    <div className="px-6">
      <div className="flex items-center h-25 text-2xl text-[#333] font-semibold">
        Đổi mật khẩu
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        {/* Mật khẩu hiện tại */}
        <div className="grid grid-cols-15 items-center gap-4">
          <label className="col-span-3 text-right" htmlFor="currentPassword">
            Mật khẩu hiện tại
          </label>
          <div className="col-span-7">
            <input
              className="w-full h-10 px-4 border border-[#CFCFCF] rounded outline-none"
              type="password"
              {...register("currentPassword")}
              id="currentPassword"
            />
          </div>
          <div className="col-span-5">
            {errors.currentPassword && (
              <p className="text-sm text-red-500">
                {errors.currentPassword.message}
              </p>
            )}
          </div>
        </div>
        {/* Mật khẩu mới */}
        <div className="grid grid-cols-15 items-center gap-4 mt-4">
          <label className="col-span-3 text-right" htmlFor="newPassword">
            Mật khẩu mới
          </label>
          <div className="col-span-7">
            <input
              className="w-full h-10 px-4 border border-[#CFCFCF] rounded outline-none"
              type="password"
              {...register("newPassword")}
              id="newPassword"
            />
          </div>
          <div className="col-span-5">
            {errors.newPassword && (
              <p className="text-sm text-red-500">
                {errors.newPassword.message}
              </p>
            )}
          </div>
        </div>
        {/* Xác nhận mật khẩu */}
        <div className="grid grid-cols-15 items-center gap-4 mt-4">
          <label className="col-span-3 text-right" htmlFor="confirmPassword">
            Xác nhận mật khẩu
          </label>
          <div className="col-span-7">
            <input
              className="w-full h-10 px-4 border border-[#CFCFCF] rounded outline-none"
              type="password"
              {...register("confirmPassword")}
              id="confirmPassword"
            />
          </div>
          <div className="col-span-5">
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-15 items-center gap-4 mt-4">
          <button
            className="col-start-8 col-span-3 px-7 py-2 text-sm text-white bg-[#E30019] hover:opacity-90 transition-all cursor-pointer rounded"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang xử lý..." : "LƯU THAY ĐỔI"}
          </button>
        </div>
      </form>
    </div>
  );
}
