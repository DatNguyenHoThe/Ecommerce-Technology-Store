export interface IProduct {
  _id: string;
  product_name: string;
  slug: string;
  price: number;
  salePrice: number;
  images: string[];
  promotion?: string;
}

export interface ICartItem {
  _id?: string;
  product: IProduct;
  quantity: number;
  currentPrice: number;
  currentSalePrice: number;
  totalAmount: number;
}

export interface ICart {
  _id: string;
  items: ICartItem[];
  totalAmount: number;
  user: string;
}

export interface ICheckoutForm {
  gender: string;
  fullname: string;
  phone: string;
  shippingMethod: string;
  ward: string;
  wardName: string;
  district: string;
  districtName: string;
  city: string;
  cityName: string;
  street: string;
  note: string;
  paymentMethod: string;
  invoice?: {
    companyName: string;
    companyAddress: string;
    taxCode: string;
    companyEmail: string;
  };
}

export interface IAddress {
  _id: string;
  type: string;
  fullName: string;
  phoneNumber: string;
  country: string;
  ward: string;
  wardName: string;
  district: string;
  districtName: string;
  city: string;
  cityName: string;
  street: string;
  isDefault: boolean;
  user: string;
}

export interface IShippingAddress {
  street: string;
  ward: string;
  wardName: string;
  district: string;
  districtName: string;
  city: string;
  cityName: string;
  country?: string;
}

export interface IShippingInfo {
  recipientName: string;
  phone: string;
  gender?: string;
}

export interface IOrderItem {
  _id?: string;
  productId: string;
  name: string;
  image: string;
  slug: string;
  price: number;
  salePrice: number;
  quantity: number;
  total: number;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  orderDate?: Date;
  products: IOrderItem[];
  totalAmount: number;
  subTotal: number;
  shippingFee: number;
  tax: number;
  trackingNumber?: string;
  discountCode?: string;
  discountAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  paidAt?: Date;
  shippingMethod: string;
  shippingAddress: IShippingAddress;
  shippingInfo: IShippingInfo;
  createdAt: Date;
  status: string;
  notes: string;
  invoice?: {
    companyName: string;
    taxCode: string;
    companyEmail: string;
    companyAddress: string;
  };
  user: string;
}