"use client";
import Link from "next/link";
import type React from "react";

import { Star } from "lucide-react";
import Image from "next/image";

interface ProductCardProps {
  product: {
    _id: string;
    product_name: string;
    description: string;
    slug: string;
    price: number;
    stock: number;
    salePrice: number;
    images: string[];
    category: {
      _id: string;
      category_name: string;
    };
    attributes: (string | { name: string; value: string })[];
    rating: number;
    brand: {
      _id: string;
      brand_name: string;
    };
    reviewCount: number;
    tags: string[];
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const originalPrice = product.price || product.salePrice * 1.25;
  const discountPercent = Math.round(
    100 - (product.salePrice / originalPrice) * 100
  );

  return (
    <Link href={`/products/${product.slug}`}>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition duration-200 h-full flex flex-col hover:border-none">
        {/* Product Image */}
        <div className="p-4 flex-grow flex items-center justify-center">
          <Image
            className="w-full h-48 object-contain"
            src={product.images[0] || "/placeholder.svg"}
            alt={product.product_name}
            width={300}
            height={192}
            loading="lazy"
          />
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Product Title */}
          <h2 className="text-lg font-medium text-gray-800 mb-2 line-clamp-2">
            {product.product_name}
          </h2>

          {/* Spec Badges */}
          <div className="bg-gray-100 rounded-md p-2 mb-4 flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
            {/* Key Specs */}
          </div>

          {/* Pricing */}
          <div className="mt-auto">
            <div className="text-gray-500 line-through text-sm">
              {originalPrice.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-600 font-bold text-1xl">
                {product.salePrice.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </span>
              <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded">
                -{discountPercent}%
              </span>
            </div>
          </div>
          {/* Rating */}
          <div className="flex items-center mt-2 text-sm text-gray-600">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="ml-1">
              {product.rating.toFixed(1)} ({product.reviewCount} đánh giá)
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
