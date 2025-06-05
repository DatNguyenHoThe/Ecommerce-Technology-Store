"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { axiosClient } from "@/libs/axiosClient";
import { env } from "@/libs/env.helper";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Separator } from "@/components/ui/Separator";
import { IOrder } from "@/app/types/types";
import { useAuthStore } from "@/stores/useAuthStore";

const statusColorMap: Record<string, string> = {
  pending: 'text-gray-500',
  processing: 'text-blue-500',
  shipped: 'text-orange-500',
  delivered: 'text-green-600',
  cancelled: 'text-red-500'
}

const statusLabelMap: Record<string, string> = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  shipped: 'Đang giao hàng',
  delivered: 'Đã giao hàng',
  cancelled: 'Đã hủy'
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<IOrder | null>(null);
  const {user} = useAuthStore();

  //lấy dữ liệu từ order về
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axiosClient.get(`${env.API_URL}/orders/${id}`);
        if (response.status === 200) {
          setOrder(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch order details", error);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  if (!order) return <div>Đang tải...</div>;

  //gọi handle cancelled order
  const handleCancelledOrder = async() => {
    try {
      const response = await axiosClient.put(`${env.API_URL}/orders/${id}`,
        {
          status: "cancelled"
        }
      );
      if (response.status === 200) {
        alert('Bạn đã hủy đơn hàng thành công')
      } else {
        alert('Bạn đã hủy đơn hàng thất bại, làm ơn chọn lý do hủy đơn hàng')
      }
    } catch (error) {
      console.error('Cancelled order is failed', error);
    }
  }

  return (
    <div className="w-[900px] min-h-[395px] max-h-full mx-auto">
      <Card className="mb-6 pl-6">
        <CardHeader>
          <h2 className="text-xl font-bold">
            Chi tiết đơn hàng #{order.orderNumber}
          </h2>
          <p className="text-gray-500">
            Ngày đặt hàng:{" "}
            {format(new Date(order.createdAt), "HH:mm dd/MM/yyyy")}
          </p>
          <p className={statusColorMap[order.status]}>Trạng thái: {statusLabelMap[order.status]}</p>
        </CardHeader>
        <CardContent>
          <h3 className="font-semibold text-lg mb-2">Thông tin người nhận</h3>
          <p>Tên: {order.shippingInfor.recipientName ?? user?.fullName}</p>
          <p>Số điện thoại: {order.shippingInfor.phone ?? user?.phone}</p>
          <p>Địa chỉ: {order.shippingAddress.street}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.city}, {order.shippingAddress.country}</p>
          <Separator className="my-4" />
          <h3 className="font-semibold text-lg mb-2">Danh sách sản phẩm</h3>
          {order.products.map((p) => (
            <div key={p._id} className="flex gap-4 mb-4">
              <Image
                src={p.product.images[0]}
                width={100}
                height={100}
                alt={p.product.product_name}
                className="rounded"
              />
              <div>
                <Link
                  href={`/products/${p.product.slug}`}
                  className="text-lg font-semibold hover:text-blue-600"
                >
                  {p.product.product_name}
                </Link>
                <p>Số lượng: {p.quantity}</p>
                <p>Giá: {p.product.salePrice.toLocaleString()} đ</p>
                <p>Tổng cộng: {p.totalAmount.toLocaleString()} đ</p>
              </div>
            </div>
          ))}
          <Separator className="my-4" />
          <h3 className="font-semibold text-lg mb-2">Tổng thanh toán</h3>
          <p>Tổng cộng: {order.totalAmount.toLocaleString()} đ</p>
          <p>Phí vận chuyển: {order.shippingFee.toLocaleString()} đ</p>
          <p className="text-xl font-bold mt-2">
            Tổng thanh toán:{" "}
            {(
              order.totalAmount +
              order.shippingFee
            ).toLocaleString()}{" "}
            đ
          </p>
        </CardContent>
      </Card>
      <div className="flex gap-4">
        <Button variant="outline" asChild>
          <Link href="/">Tiếp tục mua sắm</Link>
        </Button>
        {order?.status !== 'cancelled' ? (
          <Button 
          variant="destructive"
          onClick={handleCancelledOrder}
          >Hủy đơn hàng
          </Button>
        ) : (
          <Button 
          variant="destructive"
          disabled
          >Đơn hàng đã hủy
          </Button>
        )}
      </div>
    </div>
  );
}