"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronLeft,
  CreditCard,
  IdCard,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";

import CartSection from "@/app/cart/sections/CartSection";
import InfoSection from "@/app/cart/sections/InfoSection";
import PaymentSection from "@/app/cart/sections/PaymentSection";
import SuccessSection from "@/app/cart/sections/SuccessSection";

type SummaryData = {
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  tax: number;
  total: number;
};

export default function CartPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [section, setSection] = useState("cart");
  const [summary, setSummary] = useState<SummaryData>({
    subtotal: 0,
    discountTotal: 0,
    shippingFee: 0,
    tax: 0,
    total: 0,
  });

  useEffect(() => {
    const updateSectionFromHash = () => {
      const hash = window.location.hash.replace("#", "") || "cart";
      setSection(hash);
    };
    updateSectionFromHash();
    window.addEventListener("hashchange", updateSectionFromHash);
    return () =>
      window.removeEventListener("hashchange", updateSectionFromHash);
  }, []);

  const goToSection = (hash: string) => {
    router.push(`${pathname}#${hash}`);
    setSection(hash);
  };

  return (
    <div className="wrapper-content w-dvw pb-6 bg-[#ECECEC]">
      <div className="container w-[600px] mx-auto">
        {/* Breadcrumb */}
        {section !== "success" ? (
          <div className="breadcrumb-wrap text-[#1982F9]">
            <a
              className="flex p-4 outline-none items-center"
              href={
                section === "cart"
                  ? "/"
                  : section === "info"
                  ? "#cart"
                  : section === "payment"
                  ? "#info"
                  : ""
              }
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {section === "cart" ? "Mua thêm sản phẩm khác" : "Trở về"}
            </a>
          </div>
        ) : (
          <div className="h-14"></div>
        )}

        {/* Steps */}
        <div className="container-fluid p-2 bg-white">
          <div className="section-steps">
            <div className="cart-content relative flex place-content-center py-5 rounded bg-[#FFEDED]">
              {(() => {
                const steps = [
                  { icon: ShoppingBag, label: "Giỏ hàng", key: "cart" },
                  { icon: IdCard, label: "Thông tin đặt hàng", key: "info" },
                  { icon: CreditCard, label: "Thanh toán", key: "payment" },
                  { icon: ShieldCheck, label: "Hoàn tất", key: "success" },
                ];
                const currentStepIndex = steps.findIndex(
                  (s) => s.key === section
                );

                return steps.map(({ icon: Icon, label, key }, index) => {
                  const isActive = index <= currentStepIndex;
                  const isClickable =
                    index < currentStepIndex && section !== "success";

                  return (
                    <button
                      key={key}
                      onClick={isClickable ? () => goToSection(key) : undefined}
                      className={`relative checkout-step flex flex-col items-center w-32 text-[#535353] text-[15px] ${
                        isActive ? "text-[#E30019]" : ""
                      } ${!isClickable ? "cursor-default" : "cursor-pointer"}`}
                      disabled={!isClickable || key === "success"}
                    >
                      {index < steps.length - 1 && (
                        <div className="absolute border border-t-[#535353] border-x-transparent border-b-transparent border-dashed w-24 h-4 translate-y-3.5 left-20"></div>
                      )}
                      <div
                        className={`flex items-center justify-center w-7 h-7 mb-[6px] rounded-full border border-[#535353] ${
                          isActive ? "bg-[#E30019] text-white border-none" : ""
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <p>{label}</p>
                    </button>
                  );
                });
              })()}
            </div>
          </div>

          {/* Section rendering */}
          {section === "cart" && (
            <CartSection goToSection={goToSection} setSummary={setSummary} />
          )}
          {section === "info" && (
            <InfoSection goToSection={goToSection} setSummary={setSummary} />
          )}
          {section === "payment" && (
            <PaymentSection
              goToSection={goToSection}
              summary={summary}
              setSummary={setSummary}
            />
          )}
          {section === "success" && <SuccessSection />}
        </div>
      </div>
    </div>
  );
}
