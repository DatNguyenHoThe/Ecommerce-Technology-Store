import { axiosClient } from "@/libs/axiosClient";
import { env } from "@/libs/env.helper";
import { useCartStore } from "@/stores/useCartStore";

export const checkCoupon = async (
  code: string,
  cartItems = useCartStore.getState().localItems || []
): Promise<number> => {
  try {    const response = await axiosClient.post(`${env.API_URL}/coupons/check`, {
      code,
      items: cartItems.map((item) => ({
        productId: item._id,
        price:
          item.currentSalePrice && item.currentSalePrice > 0 ? item.currentSalePrice : item.currentPrice,
        salePrice: item.currentSalePrice ?? 0,
        quantity: item.quantity,
      })),
    });

    return response.data?.data?.discount || 0;
  } catch (err: any) {
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw err;
  }
};
