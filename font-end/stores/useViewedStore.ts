import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IProduct } from "@/app/types/types";

interface ViewedState {
  products: IProduct[];
  addViewedProduct: (product: IProduct) => void;
  clearViewedProducts: () => void;
}

export const useViewedStore = create<ViewedState>()(
  persist(
    (set, get) => ({
      products: [],

      addViewedProduct: (product) => {
        const existing = get().products.find((p) => p._id === product._id);
        let updated = existing
          ? get().products.filter((p) => p._id !== product._id)
          : get().products;

        updated = [product, ...updated].slice(0, 10); // Giới hạn 10 sản phẩm
        set({ products: updated });
      },

      clearViewedProducts: () => set({ products: [] }),
    }),
    {
      name: "viewed-products-storage",
    }
  )
);
