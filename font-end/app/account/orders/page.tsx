"use client";

import { Search } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";
import { getOrdersByUser } from "@/services/orders.service";
import { IOrder } from "@/app/types/types";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

const STATUS_OPTIONS: Record<string, { label: string; colorClass?: string }> = {
  all: { label: "Tất cả" },
  pending: {
    label: "Mới",
    colorClass: "bg-yellow-100 text-yellow-600",
  },
  processing: {
    label: "Đang xử lý",
    colorClass: "bg-orange-100 text-orange-600",
  },
  shipped: {
    label: "Đang vận chuyển",
    colorClass: "bg-blue-100 text-blue-600",
  },
  delivered: {
    label: "Hoàn thành",
    colorClass: "bg-green-100 text-green-600",
  },
  canceled: {
    label: "Huỷ",
    colorClass: "bg-gray-100 text-gray-600",
  },
};

export default function OrdersPage() {
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState("all");
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ordersPerPage = 5;
  const router = useRouter();

  const fetchOrders = useCallback(
    async (page = 1) => {
      if (!user?._id) {
        toast.warning("Chưa đăng nhập nên không thể lấy danh sách đơn hàng.");
        return;
      }
      try {
        const res = await getOrdersByUser(
          user._id,
          page,
          ordersPerPage,
          statusFilter === "all" ? undefined : statusFilter,
          searchTerm || undefined
        );
        if (res?.data) {
          setOrders(res.data.data);
          setTotalPages(res.data.pagination.totalPages);
        }
      } catch (err) {
        console.error("Lỗi khi lấy danh sách đơn hàng: ", err);
        toast.error("Lỗi khi lấy danh sách đơn hàng");
      }
    },
    [user?._id, statusFilter, searchTerm]
  );

  useEffect(() => {
    if (!user?._id) return;
    const timeout = setTimeout(() => {
      fetchOrders(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [fetchOrders, user?._id, statusFilter, searchTerm]);

  useEffect(() => {
    if (!user?._id) return;
    fetchOrders(currentPage);
  }, [fetchOrders, currentPage, user?._id]);

  return (
    <div className="min-h-[433px]">
      <div className="flex items-center h-25 px-6 text-2xl text-[#333] font-semibold">
        Quản lí đơn hàng
      </div>

      {/* Tabs */}
      <ul className="w-full flex items-center">
        {Object.entries(STATUS_OPTIONS).map(([key, option]) => (
          <li
            key={key}
            className={`flex-auto px-8 py-2 text-base font-semibold uppercase cursor-pointer ${
              statusFilter === key
                ? "text-[#535353] border-b-[3px] border-b-[#E30019]"
                : "text-[#535353]"
            }`}
            onClick={() => setStatusFilter(key)}
          >
            {option.label}
          </li>
        ))}
      </ul>

      {/* Search */}
      <div className="py-4 bg-[#ECECEC]">
        <div className="relative flex h-10 bg-white border border-[#CFCFCF] rounded">
          <Search className="absolute w-5 h-5 text-[#6D6E72] top-1/2 -translate-y-1/2 ml-4" />
          <input
            className="w-5/6 px-10 bg-white rounded outline-none"
            type="text"
            placeholder="Tìm đơn hàng theo Mã đơn hàng"
            maxLength={40}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="flex m-auto w-[2px] h-5 bg-[#CFCFCF]"></span>
          <button
            className="flex-auto px-4 text-[#1982F9] bg-white rounded cursor-pointer"
            type="button"
            onClick={() => {
              setCurrentPage(1);
              fetchOrders(1);
            }}
          >
            Tìm đơn hàng
          </button>
        </div>
      </div>

      {/* Order list */}
      <div className="p-4 bg-white rounded">
        {orders.length === 0 ? (
          <p className="min-h-45 flex items-center justify-center text-gray-500 py-4">
            Không có đơn hàng nào
          </p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                className="flex items-center justify-between p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-[#E30019] hover:bg-[#FFF0F0]"
                key={order._id}
                onClick={() => router.push(`/account/orders/${order._id}`)}
              >
                <div>
                  <div className="text-[#333] font-semibold">
                    {order.orderNumber}
                  </div>
                  <div className="mb-2 text-sm text-[#555]">
                    {dayjs(order.createdAt).format("DD/MM/YYYY HH:mm:ss")}
                  </div>
                  <div
                    className={`w-fit px-3 py-1 text-sm font-semibold rounded ${
                      STATUS_OPTIONS[order.status].colorClass
                    }`}
                  >
                    {STATUS_OPTIONS[order.status].label}
                  </div>
                </div>
                <div className="text-[#111] font-semibold">
                  {order.totalAmount.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
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
