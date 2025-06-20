"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import OrderDetails from "@/app/cart/components/orderDetails";
import { getOrderById } from "@/services/orders.service";
import { IOrder } from "@/app/types/types";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";

export default function SuccessSection() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId =
    searchParams.get("orderId") || localStorage.getItem("latestOrderId");

  const [order, setOrder] = useState<IOrder | null>(null);

  useEffect(() => {
    if (!user) {
      window.location.href = "/cart";
    }
  }, [user]);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const res = await getOrderById(orderId);
        setOrder(res);
        localStorage.removeItem("latestOrderId");
      } catch (err) {
        console.error("Không thể lấy thông tin đơn hàng: ", err);
        toast.error("Không thể lấy thông tin đơn hàng");
      }
    };

    fetchOrder();
  }, [orderId]);

  if (!order) return null;

  return (
    <div className="mt-2 py-4 px-16 text-center">
      <p className="p-4 ml-1 mb-6 flex items-center justify-center text-lg text-[#1E9800] font-bold bg-[#D5F7E0] rounded">
        <BadgeCheck className="mr-1" /> Đặt hàng thành công
      </p>
      <p className="mb-6 text-left text-[16px]">
        Cảm ơn quý khách đã cho GEARVN có cơ hội được phục vụ.
        <br />
        Nhân viên GEARVN sẽ liên hệ với quý khách trong thời gian sớm nhất.
      </p>

      <div className="bg-[#ECECEC] p-4 rounded">
        <div className="border-b border-[#CFCFCF] pb-4 flex justify-between items-center">
          <span>
            ĐƠN HÀNG #<strong>{order.orderNumber}</strong>
          </span>
          <span
            onClick={() => router.push(`/account/orders/${order._id}`)}
            className="text-[#1982F9] cursor-pointer"
          >
            Quản lý đơn hàng
          </span>
        </div>

        <div className="bg-[#ECECEC] rounded text-left">
          <OrderDetails
            customerName={order.shippingInfo.recipientName}
            phoneNumber={order.shippingInfo.phone}
            email={user?.email}
            street={`${order.shippingAddress.street}, ${order.shippingAddress.wardName}, ${order.shippingAddress.districtName}, ${order.shippingAddress.cityName}`}
            total={order.totalAmount}
            paymentMethod={
              order.paymentMethod as "e_wallet" | "cod" | "credit_card"
            }
          />
          <p className="mt-3 mb-3 text-sm italic text-[#E30019] text-left">
            * Tuyệt đối không chuyển khoản cho Shipper trước khi nhận hàng.
          </p>
          <p className="p-3 text-[16px] text-[#FF7A00] text-center bg-[FFF6ED] border border-dashed border-[#FF7A00] rounded">
            {order.paymentStatus === "paid"
              ? "Đơn hàng đã được thanh toán"
              : "Đơn hàng chưa được thanh toán"}
          </p>
        </div>
      </div>

      <div className="block mt-6">
        <a
          href="https://m.me/283371581835998"
          className="block p-3 mb-4 font-semibold text-lg text-[#1982f9] leading-5 outline-none border border-[#1982f9] text-center rounded hover:opacity-90 transition-all"
        >
          Chat với GEARVN
        </a>
        <button
          onClick={() => router.push("/")}
          className="block w-full p-3 font-semibold text-lg text-[#1982f9] leading-5 border border-[#1982f9] text-center rounded cursor-pointer hover:opacity-90 transition-all"
        >
          Tiếp tục mua hàng
        </button>
      </div>
    </div>
  );
}
