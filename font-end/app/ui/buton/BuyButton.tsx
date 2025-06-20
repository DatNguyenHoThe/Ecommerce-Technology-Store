"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/useCartStore";
import { ICartItem, IProduct } from "@/app/types/types";
import { toast } from "sonner";

interface BuyButtonProps {
  product: IProduct;
}

export default function BuyButton({ product }: BuyButtonProps) {
  const { user } = useAuthStore();
  const { getCartItems, addItem, setSource } = useCartStore();

  const handleAddToCart = async () => {
    const cartItems = getCartItems();

    const alreadyInCart = cartItems.some(
      (item: ICartItem) => item.product._id === product._id
    );

    if (alreadyInCart) {
      toast.warning("Sản phẩm đã có trong giỏ hàng");
      return;
    }

    const item: ICartItem = {
      product,
      quantity: 1,
      currentPrice: product.price,
      currentSalePrice: product.salePrice,
      totalAmount: product.salePrice,
    };

    try {
      // ✅ Nếu chưa đăng nhập => dùng local cart
      if (!user) {
        await setSource("local");
        await addItem(item);
        toast.success("Đã thêm vào giỏ hàng thành công");
        return;
      }

      // ✅ Nếu đã đăng nhập => chuyển sang server cart
      await setSource("server", user._id);
      await addItem(item);
      toast.success("Đã thêm vào giỏ hàng thành công");
    } catch (err) {
      console.error("❌ Lỗi khi thêm vào giỏ hàng:", err);
      toast.error("Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.");
    }
  };

  return (
    <div className="mt-8">
      <button
        className="w-full py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-300 cursor-pointer"
        onClick={handleAddToCart}
      >
        <h1 className="text-[15px]">MUA NGAY</h1>
        <h2 className="text-[10px]">Giao tận nơi hoặc nhận tại cửa hàng</h2>
      </button>
    </div>
  );
}
