"use client";
import { Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import CartSummary from "@/app/cart/components/cartSummary";
import QuantityInput from "@/app/cart/components/quantityInput";
import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import Link from "next/link";
import ClickBuyDialog from "@/app/ui/cart/ClickBuyDialog";
import { useRouter } from "next/navigation";
import Image from "next/image";

type SummaryData = {
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  tax: number;
  total: number;
};

export default function CartSection({
  goToSection,
  setSummary,
}: {
  goToSection: (hash: string) => void;
  setSummary: Dispatch<SetStateAction<SummaryData>>;
}) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [openDialog, setOpenDialog] = useState(false);
  const {
    source,
    setSource,
    localItems,
    serverCart,
    fetchServerCart,
    removeItem,
  } = useCartStore();
  useEffect(() => {
    if (user && source !== "server") {
      setSource("server", user._id);
    } else if (!user && source !== "local") {
      setSource("local");
    }
  }, [user, source, setSource]);
  const items = source === "server" ? serverCart?.items ?? [] : localItems;
  useEffect(() => {
    if (source === "server" && user?._id && !serverCart) {
      fetchServerCart(user._id);
    }
  }, [source, user?._id, serverCart, fetchServerCart]);
  return (
    <div className="section-order mt-2 p-4">
      {items.length === 0 ? (
        <div className="text-center text-[14px]">
          <p>Giỏ hàng của bạn đang trống</p>
          <Link
            className="inline-block text-[#1982F9] uppercase border border-[#1982F9] rounded mt-5 py-2.5 px-6 cursor-pointer font-semibold hover:text-blue-600 hover:border-blue-600 transition-all"
            href="/"
          >
            Tiếp tục mua hàng
          </Link>
        </div>
      ) : (
        <>
          {items.map((item) => (
            <div key={item.product._id} className="item flex py-6">
              <div className="left mr-2">
                <Link
                  href={`/products/${item.product.slug || item.product._id}`}
                  className="item-img w-22 h-22 border border-[#CFCFCF] cursor-pointer block overflow-hidden shrink-0"
                >
                  <Image
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                    src={item.product.images[0]}
                    alt={item.product.product_name}
                    width={88} // tương đương w-22
                    height={88} // tương đương h-22
                    unoptimized // tuỳ chọn nếu dùng ảnh từ external chưa cấu hình
                  />
                </Link>
              </div>
              <div className="right w-full flex justify-between">
                <div className="item-info pr-5 w-[70%] leading-5">
                  <h4 className="w-fit font-bold text-[#333] mb-2">
                    <Link
                      href={`/products/${
                        item.product.slug || item.product._id
                      }`}
                      className=" hover:text-blue-600 transition-all"
                    >
                      {item.product.product_name}
                    </Link>
                  </h4>

                  {item.product.promotion && (
                    <div className="line-gift text-sm">
                      <h3 className="font-bold">Quà tặng khuyến mãi</h3>
                      <div className="flex relative">
                        <span className="absolute top-2 left-2 w-1 h-1 bg-[#6D6E72] rounded-full"></span>
                        <span className="text-[#6d6e72] pl-5">
                          Tặng: <strong>{item.product.promotion}</strong>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="item-meta flex flex-col w-[30%] text-right">
                  {item.currentSalePrice > 0 &&
                  item.currentSalePrice !== item.currentPrice ? (
                    <div className="flex flex-col">
                      <span className="text-[#E30019] font-bold text-[18px]">
                        {item.currentSalePrice.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })}
                      </span>
                      <span className="text-[#6d6e72] text-sm line-through">
                        {item.currentPrice.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[#E30019] font-bold text-[18px]">
                      {item.currentPrice.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </span>
                  )}
                  <div className="item-quantity mt-4">
                    <QuantityInput item={item} />
                  </div>
                  <div className="item-remove mt-2 flex basis-1/3 justify-end items-center">
                    <button
                      onClick={() => {
                        const confirmed = confirm(
                          "Bạn có chắc muốn xoá sản phẩm này?"
                        );
                        if (confirmed) {
                          removeItem(item.product._id);
                        }
                      }}
                      className="flex text-[#6d6e72] text-sm hover:text-[#E30019] cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Xoá
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <CartSummary
            cartItems={items}
            onPlaceOrder={() => {
              if (!user) {
                setOpenDialog(true); // mở dialog nếu chưa đăng nhập
              } else {
                goToSection("info"); // tiếp tục nếu đã đăng nhập
              }
            }}
            onSummaryChange={setSummary}
          />
        </>
      )}
      <ClickBuyDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onAddToCart={() => router.push("/login?redirect=/cart")}
      />
    </div>
  );
}
