import { env } from "@/libs/env.helper";
import ClientProductDetail from "./ClientProductDetail";
interface Product {
  _id: string;
  product_name: string;
  description: string;
  slug: string;
  price: number;
  salePrice: number;
  stock: number;
  images: string[];
  category: ICategory;
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

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const res = await fetch(`${env.API_URL}/products/${slug}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return <div className="p-6">Không thể tải dữ liệu sản phẩm.</div>;
  }

  const data = await res.json();
  const product: Product = data.data;

  return <ClientProductDetail product={product} />;
}
