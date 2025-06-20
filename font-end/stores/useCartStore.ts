import { create } from "zustand";
import { persist } from "zustand/middleware";
import { axiosClient } from "@/libs/axiosClient";
import { env } from "@/libs/env.helper";
import type { ICart, ICartItem, ICheckoutForm } from "@/app/types/types";

interface CartState {
  source: "local" | "server";
  userId?: string;

  localItems: ICartItem[];
  serverCart: ICart | null;
  itemQty: number;

  formData: ICheckoutForm;
  setFormData: (
    data:
      | Partial<ICheckoutForm>
      | ((prev: ICheckoutForm) => Partial<ICheckoutForm>)
  ) => void;

  appliedCoupons: string[];
  setAppliedCoupons: (codes: string[]) => void;

  setSource: (source: "local" | "server", userId?: string) => Promise<void>;
  addItem: (item: ICartItem) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;

  fetchServerCart: (userId: string) => Promise<void>;
  syncLocalCartToServer: (userId: string) => Promise<void>;
  getCartItems: () => ICartItem[];
}

const calculateItemQty = (items: ICartItem[]) =>
  items.reduce((acc, item) => acc + item.quantity, 0);
const defaultFormData: ICheckoutForm = {
  gender: "male",
  fullname: "",
  phone: "",
  street: "",
  ward: "",
  wardName: "",
  district: "",
  districtName: "",
  city: "",
  cityName: "",
  paymentMethod: "cod",
  shippingMethod: "standard",
  note: "",
  invoice: {
    companyName: "",
    taxCode: "",
    companyAddress: "",
    companyEmail: "",
  },
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      source: "local",
      userId: undefined,
      localItems: [],
      serverCart: null,
      itemQty: 0,
      formData: defaultFormData,
      setFormData: (data) =>
        set((state) => ({
          formData:
            typeof data === "function"
              ? { ...state.formData, ...data(state.formData) }
              : { ...state.formData, ...data },
        })),

      appliedCoupons: [],
      setAppliedCoupons: (codes) => set({ appliedCoupons: codes }),

      setSource: async (source, userId) => {
        const prevSource = get().source;

        // Không làm gì nếu source không thay đổi
        if (source === prevSource) return;

        set({ source, userId });

        if (source === "server" && userId) {
          await get().syncLocalCartToServer(userId);
          await get().fetchServerCart(userId);
        }

        if (source === "local" && prevSource !== "local") {
          set({
            localItems: [],
            itemQty: 0,
            appliedCoupons: [],
            formData: defaultFormData,
          });
        }
      },

      addItem: async (item) => {
        const { source, localItems, userId } = get();

        if (source === "local") {
          const existing = localItems.find(
            (i) => i.product._id === item.product._id
          );
          const totalAmount =
            (item.currentSalePrice ?? item.currentPrice) * item.quantity;
          const updated = existing
            ? localItems.map((i) =>
                i.product._id === item.product._id
                  ? {
                      ...i,
                      quantity: i.quantity + item.quantity,
                      totalAmount:
                        (i.currentSalePrice ?? i.currentPrice) *
                        (i.quantity + item.quantity),
                    }
                  : i
              )
            : [...localItems, { ...item, totalAmount }];
          set({ localItems: updated, itemQty: calculateItemQty(updated) });
        } else if (source === "server") {
          if (!userId)
            throw new Error("Missing userId for server cart operations");
          const totalAmount =
            (item.currentSalePrice ?? item.currentPrice) * item.quantity;
          await axiosClient.post(`${env.API_URL}/carts/user/${userId}`, {
            product: item.product._id,
            quantity: item.quantity,
            currentPrice: item.currentPrice,
            currentSalePrice: item.currentSalePrice,
            totalAmount: totalAmount,
          });
          await get().fetchServerCart(userId);
        }
      },

      updateItem: async (productId, quantity) => {
        const { source, localItems, userId, serverCart } = get();

        if (source === "local") {
          const updated =
            quantity <= 0
              ? localItems.filter((i) => i.product._id !== productId)
              : localItems.map((i) =>
                  i.product._id === productId
                    ? {
                        ...i,
                        quantity,
                        totalAmount:
                          (i.currentSalePrice ?? i.currentPrice) * quantity,
                      }
                    : i
                );
          set({ localItems: updated, itemQty: calculateItemQty(updated) });
        } else if (source === "server") {
          if (!userId)
            throw new Error("Missing userId for server cart operations");
          if (!serverCart) return;

          const updatedItems = serverCart.items.map((item) => {
            const newQuantity =
              item.product._id === productId ? quantity : item.quantity;
            const totalAmount =
              (item.currentSalePrice ?? item.currentPrice) * newQuantity;
            return {
              ...item,
              quantity: newQuantity,
              totalAmount,
            };
          });

          const totalAmount = updatedItems.reduce(
            (acc, i) => acc + i.totalAmount,
            0
          );

          await axiosClient.put(`${env.API_URL}/carts/user/${userId}`, {
            items: updatedItems.map((i) => ({
              product: i.product._id,
              quantity: i.quantity,
              currentPrice: i.currentPrice,
              currentSalePrice: i.currentSalePrice,
              totalAmount: i.totalAmount,
            })),
            totalAmount,
          });

          await get().fetchServerCart(userId);
        }
      },
      removeItem: async (productId) => {
        const { source, localItems, userId, serverCart } = get();

        if (source === "local") {
          const updated = localItems.filter((i) => i.product._id !== productId);
          set({ localItems: updated, itemQty: calculateItemQty(updated) });
        } else if (source === "server") {
          if (!userId)
            throw new Error("Missing userId for server cart operations");
          const item = serverCart?.items?.find(
            (item) => item.product._id === productId
          );
          if (!item) {
            console.error("Item not found in server cart", productId);
            throw new Error("Sản phẩm không tồn tại trong giỏ hàng");
          }

          try {
            const response = await axiosClient.delete(
              `${env.API_URL}/carts/user/${userId}/item/${item._id}`
            );
            if (response.status === 200) {
              await get().fetchServerCart(userId);
            } else {
              throw new Error("Không thể xóa sản phẩm");
            }
          } catch (err: any) {
            throw new Error(
              err.response?.data?.message ||
                "Không thể xóa sản phẩm. Vui lòng thử lại sau"
            );
          }
        }
      },

      clearCart: async () => {
        const { source, userId, serverCart } = get();

        if (source === "local") {
          set({
            localItems: [],
            itemQty: 0,
            appliedCoupons: [], // reset mã giảm giá
            formData: defaultFormData,
          });
        } else if (source === "server") {
          if (!userId)
            throw new Error("Missing userId for server cart operations");

          const itemIds = serverCart?.items
            ?.map((item) => item._id)
            .filter(Boolean); // lọc null/undefined

          if (itemIds && itemIds.length > 0) {
            try {
              await axiosClient.delete(
                `${env.API_URL}/carts/user/${userId}/items`,
                {
                  data: { itemIds }, // axios DELETE với body cần truyền qua `data`
                }
              );
              await get().fetchServerCart(userId);
            } catch (err) {
              console.error("❌ Lỗi xoá nhiều item", err);
            }
          }

          set({ appliedCoupons: [], formData: defaultFormData });
        }
      },

      fetchServerCart: async (userId: string) => {
        try {
          const res = await axiosClient.get(
            `${env.API_URL}/carts/user/${userId}`
          );
          const cart = res.data?.data;
          set({
            serverCart: cart,
            itemQty: calculateItemQty(cart?.items || []),
          });
        } catch (err) {
          console.error("Error fetching server cart", err);
        }
      },

      syncLocalCartToServer: async (userId: string) => {
<<<<<<< HEAD
        const { localItems } = get();

        if (!localItems.length) return;

        // 🟢 Fetch mới nhất từ server
        let serverItems: ICartItem[] = [];
        try {
          const res = await axiosClient.get(
            `${env.API_URL}/carts/user/${userId}`
          );
          serverItems = res.data?.data?.items || [];
        } catch (err) {
          console.error("Failed to fetch server cart before syncing", err);
        }

        const mergedItemsMap = new Map<string, ICartItem>();

        // Thêm sản phẩm server vào map
=======
        const { localItems, serverCart } = get();
        if (!localItems.length) return;

        const serverItems = serverCart?.items || [];
        const mergedItemsMap = new Map<string, ICartItem>();

        // 1. Thêm sản phẩm server vào map
>>>>>>> Nhiem
        for (const item of serverItems) {
          mergedItemsMap.set(item.product._id, { ...item });
        }

<<<<<<< HEAD
        // Merge local vào
=======
        // 2. Merge local vào
>>>>>>> Nhiem
        for (const localItem of localItems) {
          const existing = mergedItemsMap.get(localItem.product._id);
          if (existing) {
            existing.quantity += localItem.quantity;
            existing.totalAmount =
              (existing.currentSalePrice ?? existing.currentPrice) *
              existing.quantity;
          } else {
            mergedItemsMap.set(localItem.product._id, { ...localItem });
          }
        }

<<<<<<< HEAD
=======
        // 3. Convert về array
>>>>>>> Nhiem
        const mergedItems = Array.from(mergedItemsMap.values());

        const totalAmount = mergedItems.reduce(
          (acc, i) => acc + i.totalAmount,
          0
        );

<<<<<<< HEAD
        // Cập nhật server cart
=======
        // 4. Gửi toàn bộ merged lên server
>>>>>>> Nhiem
        await axiosClient.put(`${env.API_URL}/carts/user/${userId}`, {
          items: mergedItems.map((i) => ({
            product: i.product._id,
            quantity: i.quantity,
            currentPrice: i.currentPrice,
            currentSalePrice: i.currentSalePrice,
            totalAmount: i.totalAmount,
          })),
          totalAmount,
        });

<<<<<<< HEAD
        set({ localItems: [] }); // clear local sau khi sync
        await get().fetchServerCart(userId); // cập nhật lại cart ở Zustand
=======
        set({ localItems: [] }); // clear local sau khi merge
        await get().fetchServerCart(userId);
>>>>>>> Nhiem
      },

      getCartItems: () => {
        const { source, localItems, serverCart } = get();
        return source === "local" ? localItems : serverCart?.items ?? [];
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        localItems: state.localItems,
        source: state.source,
        itemQty: state.itemQty,
      }),
    }
  )
);
