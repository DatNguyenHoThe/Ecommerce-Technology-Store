"use client";

import { X } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { IAddress } from "@/app/types/types";
import AddressSelector from "@/app/cart/components/addressSelector";
import { useEffect } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedAddress: IAddress | null;
  isEditMode: boolean;
  onSubmit: (data: IAddress) => void;
  userId: string;
}

export default function AddressModal({
  isOpen,
  onClose,
  selectedAddress,
  isEditMode,
  onSubmit,
  userId,
}: Props) {
  const methods = useFormContext<IAddress>();
  const selectedType = methods.watch("type");
  const { reset, handleSubmit } = methods;

  const handleClose = () => {
    if (methods.formState.isDirty) {
      if (confirm("Bạn có chắc muốn huỷ chỉnh sửa?")) onClose();
    } else {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (selectedAddress && isEditMode) {
        reset({
          fullName: selectedAddress.fullName,
          phoneNumber: selectedAddress.phoneNumber,
          type: selectedAddress.type,
          city: selectedAddress.city,
          district: selectedAddress.district,
          ward: selectedAddress.ward,
          street: selectedAddress.street,
          isDefault: selectedAddress.isDefault,
        });
      } else {
        reset({
          fullName: "",
          phoneNumber: "",
          type: "",
          city: "",
          district: "",
          ward: "",
          street: "",
          isDefault: false,
          country: "Việt Nam",
          user: userId,
        });
      }
    }
  }, [isOpen, selectedAddress, isEditMode, reset, userId]);
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[#11111180] z-50 flex justify-center items-center"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-[500px] bg-white rounded-2xl shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between p-6 items-center border-b border-[#CFCFCF]">
          <h2 className="text-base text-[#333] font-semibold leading-5">
            {isEditMode ? "CHỈNH SỬA ĐỊA CHỈ" : "ĐỊA CHỈ MỚI"}
          </h2>
          <button
            className="text-[#6D6E72] cursor-pointer"
            onClick={handleClose}
          >
            <X />
          </button>
        </div>

        <form className="p-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <p className="text-base text-[#333] font-semibold">
            Thông tin khách hàng
          </p>
          <div className="mt-4 w-full h-10 relative flex rounded bg-white border border-[#CFCFCF]">
            <input
              className="peer w-full px-4 outline-none"
              required
              id="fullName"
              type="text"
              {...methods.register("fullName", {
                required: "Vui lòng nhập họ tên",
              })}
            />
            {methods.formState.errors.fullName && (
              <p className="absolute h-full flex items-center ml-[249px] text-red-500 text-sm pointer-events-none select-none">
                {methods.formState.errors.fullName.message?.toString()}
              </p>
            )}
            <label
              className="absolute top-1/2 left-4 translate-y-[-50%] px-2 bg-white text-[#535353] peer-focus:top-0 peer-focus:left-3 peer-focus:text-sm peer-focus:font-light peer-valid:-top-0 peer-valid:left-3 peer-valid:text-sm pointer-events-none duration-150"
              htmlFor="fullName"
            >
              Nhập họ tên
            </label>
          </div>

          <div className="mt-4 w-full h-10 relative flex rounded bg-white border border-[#CFCFCF]">
            <input
              className="peer w-full px-4 outline-none"
              required
              id="phoneNumber"
              type="tel"
              inputMode="numeric" // hiện bàn phím số trên mobile
              onInput={(e) => {
                const input = e.target as HTMLInputElement;
                input.value = input.value.replace(/[^\d+]/g, "");
              }}
              {...methods.register("phoneNumber", {
                required: "Vui lòng nhập số điện thoại",
                pattern: {
                  value: /^\+?\d{9,15}$/,
                  message: "Số điện thoại không hợp lệ",
                },
              })}
            />
            {methods.formState.errors.phoneNumber && (
              <p className="absolute h-full flex items-center ml-[249px] text-red-500 text-sm pointer-events-none select-none">
                {methods.formState.errors.phoneNumber.message?.toString()}
              </p>
            )}
            <label
              htmlFor="phoneNumber"
              className="absolute top-1/2 left-4 translate-y-[-50%] px-2 bg-white text-[#535353] peer-focus:top-0 peer-focus:left-3 peer-focus:text-sm peer-focus:font-light peer-valid:-top-0 peer-valid:left-3 peer-valid:text-sm pointer-events-none duration-150"
            >
              Nhập số điện thoại
            </label>
          </div>

          <p className="text-base text-[#333] font-semibold">Địa chỉ</p>
          <AddressSelector key={selectedAddress?._id || "new"} />

          <p className="text-base text-[#333] font-semibold">Loại địa chỉ</p>
          <div className="relative flex w-full">
            <input
              className="hidden peer"
              id="office"
              type="radio"
              value="billing"
              {...methods.register("type", {
                required: "Vui lòng chọn loại địa chỉ",
              })}
            />
            <label
              className={`h-10 px-4 py-1 mr-4 flex flex-1/2 items-center justify-center text-base border rounded cursor-pointer ${
                selectedType === "billing"
                  ? "bg-[#FFEDED] text-[#E30019] border-[#E30019]"
                  : "text-[#535353] border-[#CFCFCF]"
              }`}
              htmlFor="office"
            >
              Văn phòng
            </label>

            <input
              className="hidden peer"
              id="home"
              type="radio"
              value="shipping"
              {...methods.register("type", {
                required: "Vui lòng chọn loại địa chỉ",
              })}
            />
            <label
              className={`h-10 px-4 py-1 flex flex-1/2 items-center justify-center text-base border rounded cursor-pointer ${
                selectedType === "shipping"
                  ? "bg-[#FFEDED] text-[#E30019] border-[#E30019]"
                  : "text-[#535353] border-[#CFCFCF]"
              }`}
              htmlFor="home"
            >
              Nhà riêng
            </label>
            {methods.formState.errors.type && (
              <p className="absolute ml-62.5 -mt-4.5 text-red-500 text-sm pointer-events-none select-none">
                {methods.formState.errors.type.message?.toString()}
              </p>
            )}
          </div>

          <button
            className="flex w-full items-center justify-center py-2 bg-[#E30019] text-white hover:opacity-90 transition-all rounded cursor-pointer"
            type="submit"
          >
            HOÀN THÀNH
          </button>
        </form>
      </div>
    </div>
  );
}
