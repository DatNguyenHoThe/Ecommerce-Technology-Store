"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, Star } from "lucide-react";
import ProductGallery from "../../../components/SwiperClientComponent";
import BuyButton from "@/app/ui/buton/BuyButton";
import CollapsibleContentBlock from "@/components/CollapsibleContentBlock";
import SimpleProductSlider from "@/components/SimpleProductSlider";
import { useViewedStore } from "@/stores/useViewedStore";
import { env } from "@/libs/env.helper";
import Image from "next/image";

interface Product {
  _id: string;
  product_name: string;
  description: string;
  slug: string;
  price: number;
  salePrice: number;
  stock: number;
  images: string[];
  category: {
    _id: string;
    category_name: string;
  };
  attributes: (string | { name: string; value: string; time?: string })[];
  rating: number;
  brand: IBrand;
  contentBlock: Array<{
    type: "text" | "image";
    content?: string;
    src?: string;
    alt?: string;
    _id: string;
  }>;
  isActive: boolean;
  bestSale: boolean;
  flashSale: boolean;
  reviewCount: number;
  tags: string[];
}

interface ICategory {
  _id: string;
  category_name: string;
  slug: string;
}

interface IBrand {
  _id: string;
  brand_name: string;
  slug: string;
}

interface IUser {
  _id: string;
  fullName: string;
  avatarUrl: string;
}

interface IReview {
  _id: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVerified: boolean;
  product: string;
  user: IUser;
  createdAt: Date;
  updatedAt: Date;
}

export default function ClientProductDetail({ product }: { product: Product }) {
  const [category, setCategory] = useState<ICategory | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<IReview[]>([]);

  useEffect(() => {
    if (product) {
      useViewedStore.getState().addViewedProduct(product);
    }
  }, [product]);

  useEffect(() => {
    async function fetchAdditionalData() {
      try {
        // Category
        const categoryRes = await fetch(
          `${env.API_URL}/categories/${product.category}`,
          { cache: "no-store" }
        );
        if (categoryRes.ok) {
          const categoryData = await categoryRes.json();
          setCategory(categoryData.data);

          // Similar products
          const similarRes = await fetch(
            `${env.API_URL}/products?category_slug=${categoryData.data.slug}&limit=5`,
            {
              cache: "no-store",
            }
          );
          if (similarRes.ok) {
            const similarData = await similarRes.json();
            setSimilarProducts(
              similarData.data.products.filter(
                (p: Product) => p._id !== product._id
              )
            );
          }
        }

        // Reviews
        const reviewRes = await fetch(
          `${env.API_URL}/reviews?productId=${product._id}`,
          {
            cache: "no-store",
          }
        );
        if (reviewRes.ok) {
          const reviewData = await reviewRes.json();
          setReviews(reviewData.data.reviews || []);
        }
      } catch (error) {
        console.error("Lỗi khi fetch dữ liệu bổ sung:", error);
      }
    }

    fetchAdditionalData();
  }, [product]);

  const formatPrice = (price: number): string => {
    return price.toLocaleString("vi-VN") + "đ";
  };

  const originalPrice = product.price || product.salePrice * 1.25;
  const discountPercent = Math.round(
    100 - (product.salePrice / originalPrice) * 100
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-gray-600 mb-8 text-sm">
        <Home className="text-blue-500" />
        <Link className="hover:underline text-blue-600" href="/">
          Trang chủ
        </Link>
        <span>/</span>
        {category ? (
          <Link
            className="hover:underline text-blue-600"
            href={`/collections/${category.slug}`}
          >
            {category.category_name}
          </Link>
        ) : (
          <span>Danh mục</span>
        )}
        <span>/</span>
        <span className="font-medium capitalize">{product.product_name}</span>
      </div>

      <div className="max-w-5xl p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex justify-center mb-6 md:mb-0">
          <ProductGallery
            images={product.images}
            productName={product.product_name}
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-4 text-gray-900">
            {product.product_name}
          </h1>

          <div className="flex items-center space-x-2 mb-4 text-sm text-gray-600">
            <Star size={18} className="text-yellow-500" />
            <span>{product.rating.toFixed(1)}</span>
            <Link href="#reviews">
              <p className="text-blue-500 hover:underline cursor-pointer">
                Xem đánh giá
              </p>
            </Link>
          </div>

          <div className="mb-6 flex items-center space-x-4 text-lg">
            <span className="line-through text-gray-400">
              {formatPrice(originalPrice)}
            </span>
            <span className="text-red-600 font-bold text-xl">
              {formatPrice(product.salePrice)}
            </span>
            {discountPercent > 0 && (
              <span className="text-xs text-white bg-red-500 px-2 py-0.5 rounded-full">
                -{discountPercent}%
              </span>
            )}
          </div>

          <BuyButton product={product} />

          <div className="bg-gray-50 rounded-md text-sm p-4 mb-6 mt-6">
            <h3 className="font-semibold mb-2 text-gray-800">Mô tả sản phẩm</h3>
            <p className="text-gray-700">{product.description}</p>
          </div>

          {product.tags.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-sm text-gray-600 bg-gray-200 rounded-full px-3 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {similarProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Sản phẩm tương tự</h2>
          <SimpleProductSlider products={similarProducts} />
        </div>
      )}

      <div className="bg-gray-100 rounded-md text-sm p-4 mb-6 mt-8 w-[600px]">
        <h3 className="font-semibold mb-2 text-2xl">Thông số kỹ thuật</h3>
        <ul className="space-y-2 text-gray-700">
          {product.attributes.map((attr, index) => (
            <li key={index}>
              🔹{" "}
              {typeof attr === "string"
                ? attr
                : `${attr.name}: ${attr.value}${
                    attr.time ? ` (${attr.time})` : ""
                  }`}
            </li>
          ))}
        </ul>
        <CollapsibleContentBlock blocks={product.contentBlock} />
      </div>

      <div className="mt-12" id="reviews">
        <h2 className="text-2xl font-semibold mb-4">Đánh giá sản phẩm</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-600">
            Chưa có đánh giá nào cho sản phẩm này.
          </p>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
                key={review._id}
              >
                <div className="flex items-center mb-4">
                  <div className="text-yellow-500 flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        className={
                          i < review.rating
                            ? "fill-yellow-500"
                            : "fill-gray-300"
                        }
                        key={i}
                        size={18}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-xs text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <div className="flex items-center space-x-3 mb-3">
                  <Image
                    className="w-10 h-10 rounded-full object-cover"
                    src={
                      review.user.avatarUrl || "https://via.placeholder.com/40"
                    }
                    alt={review.user.fullName}
                    width={40}
                    height={40}
                  />
                  <div>
                    <h2 className="font-semibold text-lg text-gray-800">
                      {review.user.fullName}
                    </h2>
                  </div>
                </div>
                <h4 className="font-semibold text-md text-gray-900 mb-2">
                  {review.title}
                </h4>
                <p className="text-gray-700 text-sm mb-4">{review.comment}</p>
                {review.images?.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {review.images.map((img, idx) => (
                      <Image
                        className="w-24 h-24 object-cover rounded-md border border-gray-300"
                        key={idx}
                        src={img}
                        alt={`review-img-${idx}`}
                        width={96}
                        height={96}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
