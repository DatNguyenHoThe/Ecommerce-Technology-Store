"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { env } from "@/libs/env.helper";
import axios from "axios";

const schema = yup
  .object({
    email: yup
      .string()
      .max(100)
      .required("Email is required")
      .matches(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Email address is invalid"
      ),
  })
  .required();

export default function ForgotPasswordButton() {
  const [open, setOpen] = useState(false);
  //khai báo form
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<{email: string}>({
    resolver: yupResolver(schema) as unknown as Resolver<{email: string}>,
    mode: "onChange",
  });

  const passwordRecovery = async (
    values: {email: string}
  ): Promise<{email: string} | undefined> => {
    try {
      // Thực hiện gọi API để thêm địa chỉ
      console.log("Submitting user data:", values);
      const response = await axios.post(`${env.API_URL}/forgot-password`, values, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.status === 200) {
        alert("Lấy lại mật khẩu thành công, bạn hãy truy cập vào địa chỉ email của mình để lấy mật khẩu!");
        setOpen(false);
        return response?.data?.data;
      } else {
        alert("Lấy mật khẩu thất bại!");
      }
    } catch (error) {
      console.error("create new user failed", error);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="text-center mt-4">
            <span
              className="text-gray-500 text-sm cursor-pointer hover:underline"
              onClick={() => {
                // Chuyển hướng đến trang đăng ký
                // Ví dụ: window.location.href = '/register';
              }}
              >
                Quên mật khẩu email
            </span>
          </div>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader className="flex justify-center">
            <DialogTitle className="flex justify-center pb-4 border-b border-gray-300 font-bold text-red-500">
              Đăng ký tài khoản
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(passwordRecovery)}
            className="space-y-4 flex flex-col"
          >
            {/* email */}
            <div className="flex gap-x-5 items-center">
              <label htmlFor="email" className="font-bold w-[50px] text-start">
                Email
              </label>
              <div className="flex flex-1 flex-col">
                <input
                  id="email"
                  {...register("email")}
                  className="input border border-gray-700 px-4 py-2"
                />
                {errors.email && (
                  <span className="text-red-500 text-[12px]">
                    {errors.email.message}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-center mt-4">
              <Button type="submit" className="px-10 py-1 bg-red-500">
                KHÔI PHỤC MẬT KHẨU
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}