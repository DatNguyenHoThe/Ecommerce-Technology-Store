import React from "react";

const PAYMENT_METHOD_MAP = {
  e_wallet: "Ví điện tử",
  cod: "Thanh toán khi giao hàng (COD)",
  credit_card: "Thẻ tín dụng",
};

type PaymentMethod = keyof typeof PAYMENT_METHOD_MAP;

interface OrderDetailsProps {
  customerName: string;
  phoneNumber: string;
  email?: string;
  street: string;
  subtotal?: number;
  shippingFee?: number;
  total?: number;
  paymentMethod?: PaymentMethod;
}

const OrderDetails = ({
  customerName,
  phoneNumber,
  email,
  street,
  subtotal,
  shippingFee,
  total,
  paymentMethod,
}: OrderDetailsProps) => {
  const formatCurrency = (amount?: number) =>
    typeof amount === "number" ? amount.toLocaleString("vi-VN") + "₫" : "0₫";

  return (
    <div className="text-[16px]">
      <div className="mt-4 grid grid-cols-7 gap-4">
        <span className="font-semibold col-span-2">Khách hàng:</span>
        <span className="col-span-5">{customerName}</span>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-4">
        <span className="font-semibold col-span-2">Số điện thoại:</span>
        <span className="col-span-5">{phoneNumber}</span>
      </div>
      {email && (
        <div className="mt-4 grid grid-cols-7 gap-4">
          <span className="font-semibold col-span-2">Email:</span>
          <span className="col-span-5">{email}</span>
        </div>
      )}
      <div className="mt-4 grid grid-cols-7 gap-4">
        <span className="font-semibold col-span-2">Địa chỉ nhận hàng:</span>
        <span className="col-span-5">{street}</span>
      </div>
      {subtotal && (
        <div className="mt-4 grid grid-cols-7 gap-4">
          <span className="font-semibold col-span-2">Tạm tính:</span>
          <span className="col-span-5">{formatCurrency(subtotal)}</span>
        </div>
      )}
      {shippingFee && (
        <div className="mt-4 grid grid-cols-7 gap-4">
          <span className="font-semibold col-span-2">Phí vận chuyển:</span>
          <span className="col-span-5">
            {shippingFee === 0 ? "Miễn phí" : formatCurrency(shippingFee)}
          </span>
        </div>
      )}
      {total && (
        <div className="mt-4 grid grid-cols-7 gap-4">
          <span className="font-semibold col-span-2">Tổng tiền:</span>
          <span className="col-span-5 text-[#E30019] font-semibold">
            {formatCurrency(total)}
          </span>
        </div>
      )}
      {paymentMethod && (
        <div className="mt-4 grid grid-cols-7 gap-4">
          <span className="font-semibold col-span-2">
            Hình thức thanh toán:
          </span>
          <span className="col-span-5">
            {PAYMENT_METHOD_MAP[paymentMethod]}
          </span>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
