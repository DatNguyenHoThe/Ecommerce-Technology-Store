import React, { useEffect, useState } from "react";
import { ChevronDown, TicketPercent, X } from "lucide-react";
import { checkCoupon } from "@/services/coupons.service";
import { getShippingFee } from "@/services/shipping.service";
import { ICartItem } from "@/app/types/types";
import { useCartStore } from "@/stores/useCartStore";
import { toast } from "sonner";

interface CartSummaryProps {
  cartItems: ICartItem[];
  onPlaceOrder?: () => void;
  orderButtonText?: string;
  showPaymentMethod?: boolean;
  onSummaryChange?: (summary: {
    subtotal: number;
    discountTotal: number;
    shippingFee: number;
    tax: number;
    total: number;
  }) => void;
  shippingMethod?: string;
}

const CartSummary = ({
  cartItems,
  onPlaceOrder,
  orderButtonText = "Tiến hành đặt hàng",
  showPaymentMethod,
  onSummaryChange,
}: CartSummaryProps) => {
  const [shippingFee, setShippingFee] = useState(0);
  const [couponInput, setCouponInput] = useState("");
  const [subtotal, setSubtotal] = useState(0);
  const [discountTotal, setDiscountTotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [showCouponDetail, setShowCouponDetail] = useState(false);
  const appliedCoupons = useCartStore((state) => state.appliedCoupons);
  const setAppliedCoupons = useCartStore((state) => state.setAppliedCoupons);
  const { formData, setFormData } = useCartStore();
  const selectedProvince = formData?.city || "";
  const taxRate = 0.08;

  const handleCouponToggle = () => {
    setShowCouponDetail((prev) => !prev);
  };

  // Tính phí vận chuyển khi chọn tỉnh
  useEffect(() => {
    if (!selectedProvince) return;
    const fetchShippingFee = async () => {
      try {
        const fee = await getShippingFee(selectedProvince);
        setShippingFee(fee);
      } catch (err) {
        console.error("Không lấy được phí vận chuyển: ", err);
        toast.error("Không lấy được phí vận chuyển");
      }
    };
    fetchShippingFee();
  }, [selectedProvince]);

  // Tính tổng tiền
  useEffect(() => {
    const calculateTotal = async () => {
      try {
        let discount = 0;
        for (const code of appliedCoupons) {
          const res = await checkCoupon(code, cartItems);
          discount += res; // server trả về số tiền giảm cho mã đó
        }

        const subtotal = cartItems.reduce((acc, item) => {
          const price =
            item.currentSalePrice && item.currentSalePrice > 0
              ? item.currentSalePrice
              : item.currentPrice;
          return acc + price * item.quantity;
        }, 0);
        setSubtotal(subtotal);

        setDiscountTotal(discount);
        let finalShippingFee = shippingFee;
        if (formData.shippingMethod === "express") {
          finalShippingFee += 30000;
        }
        const taxAmount = (subtotal - discount) * taxRate;
        const finalTotal = subtotal - discount + taxAmount + finalShippingFee;
        const totalValue = finalTotal > 0 ? finalTotal : 0;
        setTax(taxAmount);
        setTotal(totalValue);
        // Gửi dữ liệu lên component cha
        if (onSummaryChange) {
          onSummaryChange({
            subtotal,
            shippingFee: finalShippingFee,
            tax: taxAmount,
            discountTotal: discount,
            total: totalValue,
          });
        }
      } catch (err) {
        console.error("Lỗi khi tính tổng đơn: ", err);
        toast.error("Lỗi khi tính tổng đơn");
      }
    };

    calculateTotal();
  }, [
    cartItems,
    appliedCoupons,
    shippingFee,
    onSummaryChange,
    formData.shippingMethod,
  ]);

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    if (appliedCoupons.includes(code)) {
      toast.success("Mã giảm giá này đã được áp dụng!");
      return;
    }

    try {
      const discount = await checkCoupon(code, cartItems);
      if (discount > 0) {
        setAppliedCoupons([...appliedCoupons, code]);
        setCouponInput("");
      } else {
        toast.warning("Mã giảm giá không áp dụng được cho đơn hàng này");
      }
    } catch (err) {
      console.error("Mã giảm giá không hợp lệ hoặc đã hết hạn: ", err);
      toast.warning("Mã giảm giá không hợp lệ hoặc đã hết hạn");
    }
  };

  const handleRemoveCoupon = (code: string) => {
    setAppliedCoupons(appliedCoupons.filter((c) => c !== code));
  };

  return (
    <div>
      <div className="section-info-coupon border-y-1 py-6">
        {/* Mã giảm giá */}
        <div
          className="card-coupon flex items-center justify-between w-56 leading-5 text-[#1982f9] p-[10px] border border-[#CFCFCF] rounded cursor-pointer"
          onClick={handleCouponToggle}
        >
          <TicketPercent className="flex w-4 h-4"></TicketPercent>
          <span className="flex">Sử dụng mã giảm giá</span>
          <ChevronDown
            className={`flex w-4 h-4 transform transition-transform duration-300 ${
              showCouponDetail ? "rotate-180" : "rotate-0"
            }`}
          />
        </div>
        {showCouponDetail && (
          <div className="coupon-detail w-full mt-3 p-2 bg-[#ECECEC] rounded flex justify-between items-center">
            <input
              className="peer w-[calc(100%-104px)] h-10 outline-none px-4 rounded bg-white border border-[#CFCFCF]"
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleApplyCoupon();
                }
              }}
              placeholder="Nhập mã giảm giá/Phiếu mua hàng"
            />
            <button
              className="w-24 h-10 p-2 bg-[#1982F9] text-white text-center rounded font-semibold cursor-pointer hover:opacity-90 items-center"
              type="button"
              onClick={handleApplyCoupon}
            >
              Áp dụng
            </button>
          </div>
        )}
      </div>
      {/* Hình thức thanh toán */}
      {showPaymentMethod && (
        <div className="w-full py-6 border-b-1">
          <p className="text-2xl font-semibold">Chọn hình thức thanh toán</p>
          <div className="w-fit flex items-center mt-4 py-2 cursor-pointer leading-5">
            <input
              className="cursor-pointer"
              type="radio"
              name="paymentMethod"
              id="cod"
              checked={formData.paymentMethod === "cod"}
              onChange={() => setFormData({ paymentMethod: "cod" })}
            />
            <label
              className="flex items-center ml-4 font-light cursor-pointer"
              htmlFor="cod"
            >
              <i className="bi bi-truck mr-4 text-3xl"></i>
              Thanh toán khi giao hàng (COD)
            </label>
          </div>
          <div className="w-fit flex items-center mt-4 py-2 cursor-pointer leading-5">
            <input
              className="cursor-pointer"
              type="radio"
              name="paymentMethod"
              id="e_wallet"
              checked={formData.paymentMethod === "e_wallet"}
              onChange={() => setFormData({ paymentMethod: "e_wallet" })}
            />
            <label
              className="flex items-center ml-4 font-light cursor-pointer"
              htmlFor="e_wallet"
            >
              <i className="bi bi-wallet-fill mr-4 text-3xl"></i>
              Ví điện tử
            </label>
          </div>
          <div className="w-fit flex items-center mt-4 py-2 cursor-pointer leading-5">
            <input
              className="cursor-pointer"
              type="radio"
              name="paymentMethod"
              id="credit_card"
              checked={formData.paymentMethod === "credit_card"}
              onChange={() => setFormData({ paymentMethod: "credit_card" })}
            />
            <label
              className="flex items-center ml-4 font-light cursor-pointer"
              htmlFor="credit_card"
            >
              <i className="bi bi-credit-card-fill mr-4 text-3xl"></i>
              Thẻ tín dụng
            </label>
          </div>
        </div>
      )}

      <div className="section-info-total font-bold">
        {/* Tạm tính */}
        <div className="w-full h-8 flex justify-between items-center mt-6">
          <span>Tạm tính:</span>
          <span>
            {subtotal.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </span>
        </div>

        {/* Giảm giá */}
        {appliedCoupons.length > 0 && (
          <div className="summary-discount w-full flex items-center justify-between">
            <div className="flex items-center">
              <span>Giảm giá:</span>
              <div className="grid grid-cols-2 gap-2 flex-grow max-w-[80%]">
                {appliedCoupons.map((code) => (
                  <div
                    className="relative w-fit flex items-center ml-2"
                    key={code}
                  >
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[5px] h-2.5 bg-white z-[1] border border-[#005EC9] rounded-tr-[8px] rounded-br-[8px] border-l-0"></span>
                    <span className="flex items-center text-[#005EC9] relative rounded bg-[#E7F2FF] border border-[#005EC9] px-3 py-1 text-sm">
                      {code}
                      <X
                        className="w-4 h-4 ml-1 rounded-[50%] text-white bg-[#6D6E72] cursor-pointer"
                        onClick={() => handleRemoveCoupon(code)}
                      />
                    </span>
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-[5px] h-2.5 bg-white z-[1] border border-[#005EC9] rounded-tl-[8px] rounded-bl-[8px] border-r-0"></span>
                  </div>
                ))}
              </div>
            </div>
            <span>
              -
              {discountTotal.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </span>
          </div>
        )}

        {/* Phí vận chuyển */}
        {selectedProvince && (
          <div className="w-full h-8 flex justify-between items-center">
            <span>
              {formData.shippingMethod === "express"
                ? "Phí vận chuyển (Hoả tốc):"
                : "Phí vận chuyển:"}
            </span>
            <span>
              {shippingFee === 0
                ? "Miễn phí"
                : (formData.shippingMethod === "express"
                    ? shippingFee + 30000
                    : shippingFee
                  ).toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
            </span>
          </div>
        )}

        {/* Thuế */}
        <div className="w-full h-8 flex justify-between items-center">
          <span>Thuế:</span>
          <span>
            {tax.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </span>
        </div>

        {/* Tổng tiền */}
        <div className="w-full h-9 flex justify-between items-center text-lg">
          <span>Tổng tiền:</span>
          <span className="text-2xl text-[#E30019]">
            {total.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </span>
        </div>

        {/* Đặt hàng */}
        <button
          className="w-full p-5 mt-6 bg-[#E30019] text-lg text-white text-center rounded cursor-pointer uppercase hover:opacity-90 transition-all"
          type="submit"
          onClick={onPlaceOrder}
        >
          {orderButtonText || "Đặt hàng ngay"}
        </button>
      </div>
    </div>
  );
};

export default CartSummary;
