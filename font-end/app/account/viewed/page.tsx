"use client";
import React from "react";
import { useViewedStore } from "@/stores/useViewedStore";
import Link from "next/link";
import Image from "next/image";

export default function ViewedPage() {
  const products = useViewedStore((state) => state.products);

  if (!products.length) return null;

  return (
    <div className="px-6">
      <div className="flex items-center h-25 text-2xl text-[#333] font-semibold">
        Sản phẩm đã xem
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link href={`/products/${product.slug}`} key={product._id}>
            <div className="h-full bg-white shadow border border-[#CFCFCF] rounded p-4 hover:scale-105 transition-transform">
              <Image
                src={decodeURI(product.images[0])}
                alt={product.product_name}
                width={300}
                height={300}
                className="w-full h-40 object-contain mb-2 rounded"
              />
              <div className="text-sm font-medium text-gray-800 line-clamp-2">
                {product.product_name}
              </div>
              {product.salePrice > 0 && product.salePrice !== product.price ? (
                <div className="flex flex-col">
                  <span className="flex justify-end text-[#E30019] font-bold text-[18px]">
                    {product.salePrice.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </span>
                  <span className="flex justify-end text-[#6d6e72] text-sm line-through">
                    {product.price.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </span>
                </div>
              ) : (
                <span className="flex justify-end text-[#E30019] font-bold text-[18px]">
                  {product.price.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
