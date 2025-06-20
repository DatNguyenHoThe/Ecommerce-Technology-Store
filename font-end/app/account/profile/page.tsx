"use client";

import { updateProfile } from "@/services/user.service";
import { useAuthStore } from "@/stores/useAuthStore";
import React, { useEffect, useState } from "react";
import BirthdayDropdown from "../components/BirthdayDropdown";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [isClientReady, setIsClientReady] = useState(false);
  const schema = yup.object({
    fullName: yup.string().required("Vui lòng nhập họ tên"),
    gender: yup
      .string()
      .oneOf(["male", "female"], "Vui lòng chọn giới tính")
      .required("Vui lòng chọn giới tính"),
    phone: yup
      .string()
      .matches(/^\+?\d{9,15}$/, "Số điện thoại không hợp lệ")
      .required("Vui lòng nhập số điện thoại"),
    email: yup
      .string()
      .email("Email không hợp lệ")
      .required("Vui lòng nhập email"),
    birthDayDay: yup.string().required("Vui lòng chọn ngày"),
    birthDayMonth: yup.string().required("tháng"),
    birthDayYear: yup.string().required("năm"),
  });

  type FormValues = yup.InferType<typeof schema>;
  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  useEffect(() => {
    if (!user) return;

    if (user.birthDay) {
      const date = new Date(user.birthDay);
      reset({
        fullName: user.fullName || "",
        gender:
          user.gender === "male" || user.gender === "female"
            ? user.gender
            : undefined,
        phone: user.phone || "",
        email: user.email || "",
        birthDayYear: date.getFullYear().toString(),
        birthDayMonth: (date.getMonth() + 1).toString(),
        birthDayDay: date.getDate().toString(),
      });
    } else {
      reset({
        fullName: user.fullName || "",
        gender:
          user.gender === "male" || user.gender === "female"
            ? user.gender
            : undefined,
        phone: user.phone || "",
        email: user.email || "",
        birthDayYear: "",
        birthDayMonth: "",
        birthDayDay: "",
      });
    }
  }, [user, reset]);

  if (!isClientReady) return null;

  const onSubmit = async (data: FormValues) => {
    if (!user?._id) return toast.error("Không tìm thấy thông tin người dùng");

    const fullBirthDay =
      data.birthDayYear && data.birthDayMonth && data.birthDayDay
        ? `${data.birthDayYear}-${data.birthDayMonth.padStart(
            2,
            "0"
          )}-${data.birthDayDay.padStart(2, "0")}`
        : "";

    try {
      const response = await updateProfile(user._id, {
        ...data,
        birthDay: fullBirthDay,
      });

      if (response?.data) {
        setUser(response.data);
        toast.success("Cập nhật thông tin thành công!");
      } else {
        console.warn("updateProfile không trả về dữ liệu.");
      }
    } catch (err) {
      console.error("Đã có lỗi xảy ra khi cập nhật. Vui lòng thử lại: ", err);
      toast.error("Đã có lỗi xảy ra khi cập nhật. Vui lòng thử lại");
    }
  };

  return (
    <div className="px-6">
      <div className="flex items-center h-25 text-2xl text-[#333] font-semibold">
        Thông tin tài khoản
      </div>
      <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-15 items-center gap-4">
          <label className="col-span-3 text-right" htmlFor="fullName">
            Họ Tên
          </label>
          <div className="col-span-7">
            <input
              className="w-full h-10 px-4 border border-[#CFCFCF] rounded outline-none"
              id="fullName"
              type="text"
              {...register("fullName")}
            />
          </div>
          <div className="col-span-5">
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-15 items-center gap-4 mt-4">
          <p className="col-span-3 text-right">Giới tính</p>
          <div className="col-span-7 flex gap-6">
            <label className="flex items-center gap-1">
              <input type="radio" value="male" {...register("gender")} /> Nam
            </label>
            <label className="flex items-center gap-1">
              <input type="radio" value="female" {...register("gender")} /> Nữ
            </label>
          </div>
          <div className="col-span-5">
            {errors.gender && (
              <p className="text-sm text-red-500">{errors.gender.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-15 items-center gap-4 mt-4">
          <label htmlFor="phone" className="col-span-3 text-right">
            Số điện thoại
          </label>
          <div className="col-span-7">
            <input
              className="w-full h-10 px-4 border border-[#CFCFCF] rounded outline-none"
              id="phone"
              type="tel"
              inputMode="numeric" // hiện bàn phím số trên mobile
              onInput={(e) => {
                const input = e.target as HTMLInputElement;
                input.value = input.value.replace(/[^\d+]/g, "");
              }}
              defaultValue={user?.phone}
              {...register("phone")}
            />
          </div>
          <div className="col-span-5">
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-15 items-center gap-4 mt-4">
          <label htmlFor="email" className="col-span-3 text-right">
            Email
          </label>
          <div className="col-span-7">
            <input
              className="w-full h-10 px-4 border border-[#CFCFCF] rounded outline-none"
              id="email"
              type="email"
              {...register("email")}
            />
          </div>
          <div className="col-span-5">
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-15 items-center gap-4 mt-4">
          <p className="col-span-3 text-right">Ngày sinh</p>
          <div className="col-span-7">
            <BirthdayDropdown<FormValues>
              register={register}
              watch={watch}
              setValue={setValue}
              errors={errors}
            />
          </div>
        </div>

        <div className="grid grid-cols-15 items-center gap-4 mt-4">
          <button
            type="submit"
            className="col-start-8 col-span-3 px-7 py-2 text-sm text-white bg-[#E30019] hover:opacity-90 transition-all cursor-pointer rounded"
          >
            LƯU THAY ĐỔI
          </button>
        </div>
      </form>
    </div>
  );
}
