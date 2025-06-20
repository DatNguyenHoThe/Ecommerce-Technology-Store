"use client";

import { useAddressSelector } from "@/hooks/useAddressSelector";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useCartStore } from "@/stores/useCartStore";

type AddressSelectorProps = {
  customLabelClass?: string;
};

export default function AddressSelector({
  customLabelClass = "bg-white",
}: AddressSelectorProps) {
  const {
    watch,
    setValue,
    register,
    formState: { errors },
  } = useFormContext();

  const { formData, setFormData } = useCartStore();
  const city = watch("city");
  const district = watch("district");
  const ward = watch("ward");
  const { provinces, districts, wards } = useAddressSelector(city, district);
  const handleChange = (field: string, value: string) => {
    setValue(field, value);
    if (field === "city") {
      setValue("district", "");
      setValue("ward", "");
      setFormData({ ...formData, city: value, district: "", ward: "" });
    } else if (field === "district") {
      setValue("ward", "");
    }
  };
  useEffect(() => {
    if (provinces.length && city) {
      setValue("city", city);
    }
  }, [provinces, city, setValue]);

  useEffect(() => {
    if (districts.length && district) {
      setValue("district", district);
    }
  }, [districts, district, setValue]);

  useEffect(() => {
    if (wards.length && ward) {
      setValue("ward", ward);
    }
  }, [wards, ward, setValue]);
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="relative w-full">
        <select
          className="w-full border px-4 py-2 rounded bg-white border-[#CFCFCF] appearance-none"
          {...register("city", {
            required: "Vui lòng chọn tỉnh/thành phố",
          })}
          onChange={(e) => handleChange("city", e.target.value)}
        >
          <option value="">Chọn Tỉnh/Thành Phố</option>
          {provinces.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name}
            </option>
          ))}
        </select>
        {errors.city && (
          <p className="absolute -mt-15 ml-4 text-red-500 text-sm pointer-events-none select-none">
            {errors.city.message?.toString()}
          </p>
        )}
        <i className="bi bi-caret-down-fill pointer-events-none text-xs absolute right-3 top-1/2 -translate-y-1/2"></i>
      </div>

      <div className="relative w-full">
        <select
          className="w-full border px-4 py-2 rounded bg-white border-[#CFCFCF] appearance-none"
          {...register("district", { required: "Vui lòng chọn quận/huyện" })}
          onChange={(e) => handleChange("district", e.target.value)}
          disabled={!districts.length}
        >
          <option value="">Chọn Quận/Huyện</option>
          {districts.map((d) => (
            <option key={d.code} value={d.code}>
              {d.name}
            </option>
          ))}
        </select>
        {errors.district && (
          <p className="absolute -mt-15 ml-4 text-red-500 text-sm pointer-events-none select-none">
            {errors.district.message?.toString()}
          </p>
        )}
        <i className="bi bi-caret-down-fill pointer-events-none text-xs absolute right-3 top-1/2 -translate-y-1/2"></i>
      </div>

      <div className="relative w-full">
        <select
          className="w-full border px-4 py-2 rounded bg-white border-[#CFCFCF] appearance-none"
          {...register("ward", { required: "Vui lòng chọn phường/xã" })}
          onChange={(e) => handleChange("ward", e.target.value)}
          disabled={!wards.length}
        >
          <option value="">Chọn Phường/Xã</option>
          {wards.map((w) => (
            <option key={w.code} value={w.code}>
              {w.name}
            </option>
          ))}
        </select>
        {errors.ward && (
          <p className="absolute -mt-0.5 ml-4 text-red-500 text-sm pointer-events-none select-none">
            {errors.ward.message?.toString()}
          </p>
        )}
        <i className="bi bi-caret-down-fill pointer-events-none text-xs absolute right-3 top-1/2 -translate-y-1/2"></i>
      </div>
      <div className="relative w-full flex border rounded bg-white border-[#CFCFCF]">
        <input
          required
          className="peer w-full px-4 outline-none"
          id="street"
          type="text"
          {...register("street", { required: "Vui lòng nhập địa chỉ" })}
        />
        {errors.street && (
          <p className="absolute mt-9.75 ml-3.75 text-red-500 text-sm pointer-events-none select-none">
            {errors.street.message?.toString()}
          </p>
        )}
        <label
          htmlFor="street"
          className={`${customLabelClass} absolute top-1/2 left-4 translate-y-[-50%] px-2 text-[#535353] peer-focus:top-0 peer-focus:left-3 peer-focus:text-sm peer-focus:font-light peer-valid:-top-0 peer-valid:left-3 peer-valid:text-sm pointer-events-none select-none duration-150`}
        >
          Số nhà, tên đường
        </label>
      </div>
    </div>
  );
}
