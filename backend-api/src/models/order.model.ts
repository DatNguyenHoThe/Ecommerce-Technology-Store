import { model, Schema } from "mongoose";
import { IOrder } from "../types/type";

const orderSchema = new Schema<IOrder>(
  {
    // 🧾 Thông tin đơn hàng
    orderNumber: {
      type: String,
      maxlength: 50,
      required: true,
      unique: true,
      index: true,
    },
    orderDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      maxlength: 50,
      required: true,
      enum: ["pending", "processing", "shipped", "delivered", "canceled"],
      default: "pending",
    },
    notes: {
      type: String,
      maxlength: 500,
    },

    // 📦 Thông tin sản phẩm
    products: {
      type: [
        {
          productId: {
            type: Schema.Types.ObjectId,
            ref: "products",
            required: true,
          },
          name: { type: String, required: true },
          price: { type: Number, required: true },
          salePrice: { type: Number },
          quantity: { type: Number, required: true },
          total: { type: Number, required: true },
          image: { type: String, required: true },
          slug: { type: String },
        },
      ],
      required: true,
    },

    // 💵 Thông tin thanh toán
    paymentMethod: {
      type: String,
      maxlength: 50,
      required: true,
      enum: ["cod", "e_wallet", "credit_card"],
    },
    paymentStatus: {
      type: String,
      maxlength: 50,
      required: true,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paidAt: {
      type: Date,
    },

    // 🚚 Thông tin vận chuyển
    shippingAddress: {
      type: {
        street: { type: String, required: true },
        ward: { type: String, required: true },
        district: { type: String, required: true },
        city: { type: String, required: true },
        wardName: { type: String, require: true },
        districtName: { type: String, require: true },
        cityName: { type: String, require: true },
      },
      required: true,
    },
    shippingInfo: {
      type: {
        recipientName: { type: String, required: true },
        phone: { type: String, required: true },
        gender: { type: String, required: true },
      },
      required: true,
    },
    shippingMethod: {
      type: String,
      enum: ["standard", "express"],
      default: "standard",
    },
    shippingFee: {
      type: Number,
      min: 0,
      required: true,
      default: 0,
    },
    trackingNumber: {
      type: String,
    },
    //Invoice
    invoice: {
      type: {
        companyName: { type: String, required: true },
        companyAddress: { type: String, required: true },
        taxCode: { type: String, required: true },
        companyEmail: { type: String, required: true },
      },
      required: false,
    },
    // 🎁 Giảm giá
    discountCode: {
      type: String,
    },
    discountAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    // 🧮 Tổng tiền
    subTotal: {
      type: Number,
      min: 0,
      required: true,
    },
    tax: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalAmount: {
      type: Number,
      min: 0,
      required: true,
    },

    // 📌 Tham chiếu người dùng
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model("orders", orderSchema);
