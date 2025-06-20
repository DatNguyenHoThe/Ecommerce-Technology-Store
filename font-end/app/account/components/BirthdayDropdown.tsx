"use client";

import React, { useEffect, useState } from "react";
import {
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  FieldErrors,
  FieldValues,
  Path,
  PathValue,
} from "react-hook-form";

type BirthdayDropdownProps<T extends FieldValues> = {
  register: UseFormRegister<T>;
  watch: UseFormWatch<T>;
  setValue: UseFormSetValue<T>;
  errors: FieldErrors<T>;
};

export default function BirthdayDropdown<T extends FieldValues>({
  register,
  watch,
  setValue,
  errors,
}: BirthdayDropdownProps<T>) {
  const selectedDay = watch("birthDayDay" as Path<T>);
  const selectedMonth = watch("birthDayMonth" as Path<T>);
  const selectedYear = watch("birthDayYear" as Path<T>);

  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const years = Array.from({ length: 100 }, (_, i) =>
    (new Date().getFullYear() - i).toString()
  );

  const [days, setDays] = useState<string[]>([]);

  useEffect(() => {
    const month = parseInt(selectedMonth as string);
    const year = parseInt(selectedYear as string);

    const getDaysInMonth = (month: number, year: number): number => {
      return new Date(year, month, 0).getDate(); // tháng 1–12
    };

    if (!isNaN(month) && !isNaN(year)) {
      const daysInMonth = getDaysInMonth(month, year);
      const newDays = Array.from({ length: daysInMonth }, (_, i) =>
        (i + 1).toString()
      );
      setDays(newDays);

      // Nếu ngày hiện tại > số ngày tối đa trong tháng đó, reset lại
      if (selectedDay && parseInt(selectedDay as string) > daysInMonth) {
        setValue("birthDayDay" as Path<T>, "" as PathValue<T, Path<T>>);
      }
    } else {
      setDays(Array.from({ length: 31 }, (_, i) => (i + 1).toString()));
    }
  }, [selectedDay, selectedMonth, selectedYear, setValue]);

  return (
    <div className="flex gap-4">
      <div className="relative flex flex-1/3">
        <select
          className="w-full h-10 px-4 border border-[#CFCFCF] rounded outline-none appearance-none"
          value={selectedDay || ""}
          {...register("birthDayDay" as Path<T>)}
        >
          <option value="">Ngày</option>
          {days.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <div className="absolute h-full w-55 flex items-center ml-100.75">
          {(errors.birthDayDay ||
            errors.birthDayMonth ||
            errors.birthDayYear) && (
            <p className="text-sm text-red-500">
              Vui lòng chọn đủ ngày tháng năm
            </p>
          )}
        </div>
        <i className="bi bi-caret-down-fill pointer-events-none text-xs absolute right-3 top-1/2 -translate-y-1/2"></i>
      </div>
      <div className="relative flex flex-1/3">
        <select
          className="w-full h-10 px-4 border border-[#CFCFCF] rounded outline-none appearance-none"
          value={selectedMonth || ""}
          {...register("birthDayMonth" as Path<T>)}
        >
          <option value="">Tháng</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <i className="bi bi-caret-down-fill pointer-events-none text-xs absolute right-3 top-1/2 -translate-y-1/2"></i>
      </div>

      <div className="relative flex flex-1/3">
        <select
          className="w-full h-10 px-4 border border-[#CFCFCF] rounded outline-none appearance-none"
          value={selectedYear || ""}
          {...register("birthDayYear" as Path<T>)}
        >
          <option value="">Năm</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <i className="bi bi-caret-down-fill pointer-events-none text-xs absolute right-3 top-1/2 -translate-y-1/2"></i>
      </div>
    </div>
  );
}
