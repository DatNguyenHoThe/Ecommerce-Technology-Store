import CartSummary from "@/app/cart/components/cartSummary";
import OrderDetails from "@/app/cart/components/orderDetails";
import { useCartStore } from "@/stores/useCartStore";
import { createOrder } from "@/services/orders.service";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";
import { Dispatch, SetStateAction, useEffect, useMemo } from "react";

type SummaryData = {
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  tax: number;
  total: number;
};

export default function PaymentSection({
  goToSection,
  summary,
  setSummary,
}: {
  goToSection: (hash: string) => void;
  summary: SummaryData;
  setSummary: Dispatch<SetStateAction<SummaryData>>;
}) {
  const user = useAuthStore((state) => state.user);
  const {
    source,
    localItems,
    serverCart,
    formData,
    appliedCoupons,
    clearCart,
  } = useCartStore();

  const cartItems = useMemo(() => {
    return source === "local" ? localItems : serverCart?.items || [];
  }, [source, localItems, serverCart?.items]);

  useEffect(() => {
    if (!user || cartItems.length === 0) {
      window.location.href = "/cart";
    }
  }, [user, cartItems]);

  const handlePlaceOrder = async () => {
    try {
      if (cartItems.length === 0) {
        toast.warning("Giỏ hàng của bạn đang trống.");
        return;
      }
      const orderData = {
        user: user?._id || null,

        products: cartItems.map((item) => ({
          productId: item.product._id,
          name: item.product.product_name,
          price: item.currentPrice,
          salePrice: item.currentSalePrice,
          quantity: item.quantity,
          total: (item.currentSalePrice ?? item.currentPrice) * item.quantity,
          image: encodeURI(item.product.images[0]),
          slug: item.product.slug,
          promotion: item.product.promotion,
        })),

        shippingAddress: {
          street: formData.street,
          ward: formData.ward,
          wardName: formData.wardName,
          district: formData.district,
          districtName: formData.districtName,
          city: formData.city,
          cityName: formData.cityName,
        },

        shippingInfo: {
          recipientName: formData.fullname,
          phone: formData.phone,
          gender: formData.gender,
        },
        shippingMethod: formData.shippingMethod || "standard",
        shippingFee: summary.shippingFee || 0,

        paymentMethod: formData.paymentMethod || "cod",
        paymentStatus: "pending",

        discountCode: appliedCoupons.join(", ") || "",
        discountAmount: summary.discountTotal || 0,

        subTotal: summary.subtotal,
        tax: summary.tax,
        totalAmount: summary.total,

        status: "pending",
        notes: formData.note || "",

        invoice: formData.invoice && {
          companyName: formData.invoice.companyName,
          companyAddress: formData.invoice.companyAddress,
          taxCode: formData.invoice.taxCode,
          companyEmail: formData.invoice.companyEmail,
        },
      };
      console.log("🛒 Order Data", orderData);
      const result = await createOrder(orderData);

      clearCart();
      localStorage.setItem("latestOrderId", result.data._id);
      goToSection("success");
    } catch (err) {
      console.error(
        "Đã có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại: ",
        err
      );
      toast.error("Đã có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại");
    }
  };
  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold">Thông tin đặt hàng</h2>
      <div className="mb-5">
        <OrderDetails
          customerName={formData.fullname || ""}
          phoneNumber={formData.phone || ""}
          street={`${formData.street}, ${formData.wardName}, ${formData.districtName}, ${formData.cityName}`}
        />
      </div>
      <CartSummary
        cartItems={cartItems}
        onPlaceOrder={handlePlaceOrder}
        showPaymentMethod={true}
        orderButtonText="Thanh toán ngay"
        onSummaryChange={setSummary}
      />
    </div>
  );
}
