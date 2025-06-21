"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getOrderById, cancelOrder } from "@/services/orders.service";
import { IOrder } from "@/app/types/types";
import { toast } from "sonner";
import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";

const STATUS_OPTIONS: Record<string, { label: string; colorClass: string }> = {
  pending: { label: "Mới", colorClass: "text-yellow-600" },
  processing: { label: "Đang xử lý", colorClass: "text-orange-600" },
  shipped: { label: "Đang vận chuyển", colorClass: "text-blue-600" },
  delivered: { label: "Hoàn thành", colorClass: "text-green-600" },
  canceled: { label: "Huỷ", colorClass: "text-gray-600" },
};

const PAYMENT_STATUS: Record<string, { label: string; colorClass: string }> = {
  pending: { label: "Chưa thanh toán", colorClass: "text-blue-600" },
  paid: { label: "Đã thanh toán", colorClass: "text-green-600" },
  failed: { label: "Thất bại", colorClass: "text-gray-600" },
};

const PAYMENT_METHOD_MAP: Record<string, string> = {
  e_wallet: "Ví điện tử",
  cod: "Thanh toán khi giao hàng (COD)",
  credit_card: "Thẻ tín dụng",
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrder(id as string);
    }
  }, [id]);

  const fetchOrder = async (orderId: string) => {
    try {
      setLoading(true);
      const res = await getOrderById(orderId);
      setOrder(res);
    } catch (err) {
      console.error("Không thể tải chi tiết đơn hàng: ", err);
      toast.error("Không thể tải chi tiết đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order?._id) return;
    const confirmCancel = window.confirm("Bạn có chắc muốn huỷ đơn hàng này?");
    if (!confirmCancel) return;

    try {
      setCancelling(true);
      await cancelOrder(order._id);
      toast.success("Huỷ đơn hàng thành công");
      fetchOrder(order._id);
    } catch (err) {
      console.error("Huỷ đơn hàng thất bại: ", err);
      toast.error("Huỷ đơn hàng thất bại");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <p className="p-4">Đang tải đơn hàng...</p>;
  if (!order)
    return <p className="p-4 text-red-500">Không tìm thấy đơn hàng.</p>;

  return (
    <div className="min-h-[433px]">
      {/* Header */}
      <div className="flex items-center justify-between h-25 px-6">
        <p className="text-2xl text-[#333] font-semibold">Chi tiết đơn hàng</p>
        <div className="text-sm text-gray-600">
          Mã đơn: <span className="font-medium">{order.orderNumber}</span>
        </div>
      </div>

      {/* Thông tin đơn hàng */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border shadow rounded-lg p-4 mx-4 mb-6">
        <div>
          <p className="text-gray-500">Ngày đặt</p>
          <p>{dayjs(order.createdAt).format("DD/MM/YYYY HH:mm:ss")}</p>
        </div>
        <div>
          <p className="text-gray-500">Trạng thái đơn</p>
          <p
            className={`font-semibold ${
              STATUS_OPTIONS[order.status].colorClass
            }`}
          >
            {STATUS_OPTIONS[order.status].label}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Phương thức thanh toán</p>
          <p className="capitalize">
            {PAYMENT_METHOD_MAP[order.paymentMethod]}
          </p>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="bg-white border shadow rounded-lg mx-4 mb-6">
        <h2 className="text-lg font-semibold p-4">Danh sách sản phẩm</h2>

        {/* Header */}
        <div className="hidden md:grid grid-cols-15 gap-4 p-4 items-center bg-[#ECECEC] text-sm text-gray-600 font-semibold">
          <div className="col-span-7">Chi tiết sản phẩm</div>
          <div className="col-span-3 text-center">Giá</div>
          <div className="col-span-2 text-center">Số lượng</div>
          <div className="col-span-3 text-right">Tổng tiền</div>
        </div>

        {/* List */}
        <div className="divide-y">
          {order.products.map((item) => (
            <div
              key={item._id}
              className="grid grid-cols-15 gap-4 items-center p-4 text-sm"
            >
              {/* Product details */}
              <div className="col-span-15 md:col-span-7 flex gap-4">
                <Link
                  className="flex gap-4 items-start group"
                  href={`/products/${item.slug || item._id}`}
                >
                  <div className="w-16 h-16 border rounded overflow-hidden shrink-0">
                    <Image
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                    />
                  </div>
                  <div>
                    <p className="font-medium group-hover:text-blue-600 transition-all">
                      {item.name}
                    </p>
                    <div className="text-gray-500">
                      <h4 className="text-sm font-semibold mb-1">
                        Quà tặng khuyến mãi:
                      </h4>
                      <ul className="list-disc pl-5 text-xs text-[#6d6e72]">
                        {item.promotion?.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Item price */}
              <div className="col-span-6 md:col-span-3 text-center text-gray-700 h-full flex items-start justify-center">
                {item.salePrice && item.salePrice !== item.price ? (
                  <div className="flex flex-col items-center">
                    <span className="text-[#E30019] font-semibold">
                      {item.salePrice.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </span>
                    <span className="text-[#6d6e72] line-through text-sm">
                      {item.price.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </span>
                  </div>
                ) : (
                  <span>
                    {item.price.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </span>
                )}
              </div>

              {/* Quantity */}
              <div className="col-span-6 md:col-span-2 h-full flex items-start justify-center">
                {item.quantity}
              </div>

              {/* Total amount */}
              <div className="col-span-6 md:col-span-3 text-right font-semibold text-gray-900 h-full flex items-start justify-end">
                {item.total.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tổng kết đơn hàng */}
      <div className="bg-white border shadow rounded-lg p-4 mx-4 mb-6">
        <h3 className="text-md font-semibold mb-4">Tổng kết đơn hàng</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Tạm tính:</span>
            <span>
              {order.subTotal.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Giảm giá:</span>
            <span>
              -
              {order.discountAmount.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span>
              {order.shippingMethod === "express"
                ? "Phí vận chuyển (Hoả tốc):"
                : "Phí vận chuyển:"}
            </span>
            <span>
              {order.shippingFee === 0
                ? "Miễn phí"
                : order.shippingFee.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Thuế:</span>
            <span>
              {order.tax.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </span>
          </div>
          <div className="border-t pt-3 flex justify-between font-semibold text-base text-[#E30019]">
            <span>Tổng thanh toán:</span>
            <span>
              {order.totalAmount.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </span>
          </div>
        </div>
      </div>
      {/* Địa chỉ giao hàng và Thông tin xuất hoá đơn */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-4 mb-6">
        <div className="bg-white border shadow rounded-lg p-4">
          <h3 className="text-md font-semibold mb-3">Thông tin giao hàng</h3>
          <div className="space-y-1 text-sm">
            <p>
              <strong>Người nhận:</strong> {order.shippingInfo.recipientName}
            </p>
            <p>
              <strong>Số điện thoại:</strong> {order.shippingInfo.phone}
            </p>
            <p>
              <strong>Địa chỉ:</strong> {order.shippingAddress.street},{" "}
              {order.shippingAddress.ward}, {order.shippingAddress.district},{" "}
              {order.shippingAddress.city}
            </p>
          </div>
        </div>

        <div className="bg-white border shadow rounded-lg p-4">
          <h3 className="text-md font-semibold mb-3">Thông tin xuất hoá đơn</h3>
          {order.invoice ? (
            <div className="space-y-1 text-sm">
              <p>
                <strong>Công ty:</strong> {order.invoice.companyName}
              </p>
              <p>
                <strong>Mã số thuế:</strong> {order.invoice.taxCode}
              </p>
              <p>
                <strong>Địa chỉ:</strong> {order.invoice.companyAddress}
              </p>
              <p>
                <strong>Email:</strong> {order.invoice.companyEmail}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Không yêu cầu xuất hoá đơn.</p>
          )}
        </div>
      </div>
      {/* Trạng thái thanh toán và ghi chú */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-4 mb-6">
        <div className="bg-white border shadow rounded-lg p-4">
          <h3 className="text-md font-semibold mb-3">Trạng thái thanh toán</h3>
          <p
            className={`capitalize font-semibold ${
              PAYMENT_STATUS[order.paymentStatus].colorClass
            }`}
          >
            {PAYMENT_STATUS[order.paymentStatus].label}
          </p>
        </div>

        <div className="bg-white border shadow rounded-lg p-4">
          <h3 className="text-md font-semibold mb-3">Ghi chú đơn hàng</h3>
          <p className="text-sm text-gray-700">
            {order.notes || "Không có ghi chú."}
          </p>
        </div>
      </div>
      {/* Huỷ đơn */}
      {order.status === "pending" && (
        <div className="text-right mr-4 mb-4">
          <button
            className="px-3 py-1 bg-[#E30019] text-white hover:opacity-90 transition-all border rounded cursor-pointer"
            onClick={handleCancelOrder}
            disabled={cancelling}
          >
            {cancelling ? "Đang huỷ..." : "Huỷ đơn hàng"}
          </button>
        </div>
      )}
    </div>
  );
}
