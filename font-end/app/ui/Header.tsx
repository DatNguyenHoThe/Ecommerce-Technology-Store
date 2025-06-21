"use client";

import Image from "next/image";
import React, { useRef } from "react";
import MenuHeader from "./MenuHeader";
import IconHeader from "./IconHeader";
import Link from "next/link";
import UserInfo from "./user/UserInfo";
import { useRouter } from "next/navigation";
import { buildSlug } from "@/libs/slugify.helper";
import { useCartStore } from "@/stores/useCartStore";

export default function Header() {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { itemQty } = useCartStore();

  // Xử lý tìm kiếm sản phẩm
  const handleSearch = () => {
    const value = inputRef.current?.value?.trim();
    if (value) {
      router.push(`/products?search=${buildSlug(value)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <>
      <div className="flex items-center justify-center w-full bg-[#1982F9]">
        <div className="relative w-[1200px] h-[47px]">
          <Image
            alt="banner-header"
            src="http://ecommerce-technology-store.onrender.com/uploads/banners/thang_04_laptop_gaming_banner_0087e9.webp"
            fill
            sizes="(max-width: 1200px) 100vw, 1200px"
            priority
          />
        </div>
      </div>

      <div className="h-18 bg-[#E30019] flex items-center justify-center sticky top-0 left-0 w-full z-50">
        <div className="w-[1200px] h-[42px] flex gap-x-3">
          <Link href="/" className="relative w-[140px] h-[42px] block">
            <Image
              alt="logo"
              src="http://ecommerce-technology-store.onrender.com/uploads/logos/logo_header.png"
              fill
              sizes="(max-width: 1200px) 100vw, 33vw"
              priority
            />
          </Link>

          <MenuHeader />

          <div className="flex items-center bg-white border border-gray-300 rounded-sm px-4 py-2 w-[365px] max-w-md shadow-sm">
            <input
              ref={inputRef}
              type="text"
              placeholder="Bạn cần tìm gì?"
              onKeyDown={handleKeyDown}
              className="w-full outline-none bg-transparent placeholder-gray-600 text-gray-800"
            />
            <i
              onClick={handleSearch}
              className="bi bi-search text-gray-600 cursor-pointer"
            />
          </div>

          <div className="flex gap-x-4 p-1">
            <IconHeader
              icon={<i className="bi bi-headset" />}
              title={
                <>
                  Hotline
                  <br />
                  1900.5301
                </>
              }
              url="/"
            />

            <IconHeader
              icon={<i className="bi bi-geo-alt" />}
              title={
                <>
                  Hệ thống
                  <br />
                  Showroom
                </>
              }
              url="/pages/he-thong-cua-hang"
            />

            <IconHeader
              icon={
                <div className="flex relative">
                  <i className="bi bi-clipboard2" />
                  <i
                    className="bi bi-clock-fill bottom-0 end-0 rounded-circle absolute"
                    style={{ fontSize: "0.75rem" }}
                  />
                </div>
              }
              title={
                <>
                  Tra cứu
                  <br />
                  đơn hàng
                </>
              }
              url="/account/orders"
            />

            <IconHeader
              icon={
                <div className="flex relative">
                  <i className="bi bi-cart3" />
                  {itemQty > 0 && (
                    <span className="rounded-full w-4 h-4 bg-yellow-500 text-black text-[10px] border-2 border-white absolute top-0 -end-1 flex justify-center items-center">
                      {itemQty}
                    </span>
                  )}
                </div>
              }
              title={
                <>
                  Giỏ
                  <br />
                  hàng
                </>
              }
              url="/cart"
            />
          </div>

          <div className="flex items-center text-white font-bold gap-x-1 px-2 bg-[#be0117] rounded-sm">
            <UserInfo />
          </div>
        </div>
      </div>
    </>
  );
}
