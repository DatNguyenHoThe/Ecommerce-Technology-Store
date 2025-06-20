"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Pencil, Star, StarOff, Trash2 } from "lucide-react";
import { IAddress } from "@/app/types/types";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  createAdresses,
  deleteAddressById,
  getAddressesByUser,
  setDefaultAddress,
  updateAddressById,
} from "@/services/addresses.service";
import AddressModal from "../components/AddressModal";
import { useAddressSelector } from "@/hooks/useAddressSelector";
import { toast } from "sonner";

export default function AddressesPage() {
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<IAddress | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [addresses, setAddresses] = useState<IAddress[]>([]);
  const methods = useForm<IAddress>({});
  const cityCode = methods.watch("city");
  const districtCode = methods.watch("district");
  const wardCode = methods.watch("ward");
  const { getProvinceName, getDistrictName, getWardName } = useAddressSelector(
    cityCode,
    districtCode
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const addressesPerPage = 5;

  const fetchAddresses = useCallback(
    async (page = 1) => {
      if (!user?._id) {
        toast.warning("Chưa đăng nhập nên không thể lấy danh sách địa chỉ.");
        return;
      }
      try {
        const res = await getAddressesByUser(user._id, page, addressesPerPage);
        if (res?.data?.data) {
          setAddresses(res.data.data);
          setTotalPages(res.data.pagination.totalPages);
        }
      } catch (err) {
        console.error("Lỗi khi lấy danh sách địa chỉ: ", err);
        toast.error("Lỗi khi lấy danh sách địa chỉ");
      }
    },
    [user?._id]
  );

  useEffect(() => {
    if (!user?._id) return;
    fetchAddresses(currentPage);
  }, [fetchAddresses, currentPage, user?._id]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xoá địa chỉ này không?")) return;
    try {
      await deleteAddressById(id);
      toast.success("Xoá địa chỉ thành công");
      fetchAddresses(currentPage);
    } catch (err) {
      console.error("Xoá địa chỉ thất bại: ", err);
      toast.error("Xoá địa chỉ thất bại");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress(id);
      fetchAddresses(currentPage);
      toast.success("Đặt làm địa chỉ mặc định thành công");
    } catch (err) {
      console.error("Không thể đặt làm mặc định: ", err);
      toast.error("Không thể đặt làm mặc định");
    }
  };

  const handleEditAddress = (address: IAddress) => {
    setSelectedAddress(address);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const onSubmit: SubmitHandler<IAddress> = async (data) => {
    const payload = {
      ...data,
      cityName: getProvinceName(cityCode),
      districtName: getDistrictName(districtCode),
      wardName: getWardName(wardCode),
    };

    try {
      if (!user?._id) throw new Error("Không tìm thấy thông tin người dùng");
      if (isEditMode && selectedAddress?._id) {
        await updateAddressById(selectedAddress._id, payload);
        toast.success("Cập nhật địa chỉ thành công");
      } else {
        await createAdresses(payload);
        toast.success("Thêm địa chỉ mới thành công");
      }
      fetchAddresses(currentPage);
      setIsModalOpen(false);
      setIsEditMode(false);
      setSelectedAddress(null);
    } catch (err) {
      console.error("Lưu địa chỉ thất bại: ", err);
      toast.error("Lưu địa chỉ thất bại");
    }
  };

  return (
    <div className="px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center h-25 text-2xl text-[#333] font-semibold">
          Sổ địa chỉ
        </div>
        <button
          className="h-fit px-3 py-2 text-sm text-white bg-[#005EC9] hover:opacity-90 transition-all rounded cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          <i className="bi bi-plus-circle mr-1"></i>Thêm địa chỉ mới
        </button>
      </div>

      {isModalOpen && (
        <FormProvider {...methods}>
          <AddressModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedAddress(null);
              setIsEditMode(false);
            }}
            selectedAddress={selectedAddress}
            isEditMode={isEditMode}
            onSubmit={onSubmit}
            userId={user?._id || ""}
          />
        </FormProvider>
      )}
      <div className="pb-4">
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className={`flex justify-between items-center p-4 border rounded-lg ${
                addr.isDefault
                  ? "border-[#E30019] bg-[#FFF0F0]"
                  : "border-gray-300"
              }`}
            >
              <div>
                <div className="font-semibold text-[#333]">{addr.fullName}</div>
                <div className="text-sm text-[#555]">{addr.phoneNumber}</div>
                <div className="text-sm text-[#555]">
                  {`${addr.street}, ${addr.wardName}, ${addr.districtName}, ${addr.cityName}`}
                </div>
                <div className="text-xs mt-1 text-[#888] italic">
                  {addr.type === "billing" ? "Văn phòng" : "Nhà riêng"}
                </div>
                {addr.isDefault && (
                  <div className="mt-1 inline-block px-2 py-1 text-xs bg-[#E30019] text-white rounded-full">
                    Mặc định
                  </div>
                )}
              </div>
              <div className="space-x-2 flex items-center">
                <button
                  className="relative group text-[#6D6E72] hover:text-[#E30019] transition-all"
                  onClick={() => {
                    if (!addr.isDefault) {
                      handleSetDefault(addr._id!);
                    }
                  }}
                >
                  {addr.isDefault ? (
                    <Star className="w-5 h-5 text-[#E30019]" />
                  ) : (
                    <>
                      <StarOff className="w-5 h-5 cursor-pointer" />
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-[#333] text-[#ECECEC] text-sm rounded px-2 py-1 transition-opacity duration-150 whitespace-nowrap">
                        Đặt làm địa chỉ mặc định
                      </div>
                    </>
                  )}
                </button>
                <button
                  className="relative group text-[#6D6E72] hover:text-[#E30019] transition-all cursor-pointer"
                  onClick={() => handleEditAddress(addr)}
                >
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-[#333] text-[#ECECEC] text-sm rounded px-2 py-1 transition-opacity duration-150 whitespace-nowrap">
                    Chỉnh sửa địa chỉ
                  </div>
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  className="relative group text-[#6D6E72] hover:text-[#E30019] transition-all cursor-pointer"
                  onClick={() => handleDelete(addr._id!)}
                >
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-[#333] text-[#ECECEC] text-sm rounded px-2 py-1 transition-opacity duration-150 whitespace-nowrap">
                    Xoá địa chỉ
                  </div>
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center my-4 space-x-2">
          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded cursor-pointer hover:opacity-90 transition-all ${
                  currentPage === page
                    ? "bg-[#E30019] text-white"
                    : "bg-white text-[#333] border-gray-300"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
