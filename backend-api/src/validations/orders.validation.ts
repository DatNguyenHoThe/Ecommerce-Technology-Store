import { strict } from "assert";
import * as yup from "yup";

// get all
const getAllSchema = yup
  .object({
    query: yup.object({
      page: yup.number().integer().positive().optional(),
      limit: yup.number().integer().positive().optional(),
    }),
    sort_type: yup.string().oneOf(["asc", "desc"]).optional(),
    sort_by: yup.string().oneOf(["createdAt", "category_name"]).optional(),
    keyword: yup.string().trim().min(2).max(50).optional(), // search category_name
  })
  .required();

// get by id
const getByIdSchema = yup
  .object({
    params: yup.object({
      id: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, {
          message: "ID is non-ObjectID",
        })
        .required(),
    }),
  })
  .required();

// get by userId
const getByUserIdSchema = yup
  .object({
    params: yup.object({
      userId: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, {
          message: "ID is non-ObjectID",
        })
        .required(),
    }),
  })
  .required();

// create
const createSchema = yup
  .object({
    body: yup.object({
      orderNumber: yup.string().max(50).optional(),
      products: yup
        .array()
        .of(
          yup.object({
            productId: yup.string().required(),
            name: yup.string().required(),
            price: yup.number().min(0).required(),
            salePrice: yup.number().min(0).optional(),
            quantity: yup.number().min(1).required(),
            total: yup.number().min(0).required(),
            image: yup.string().url().required(),
            slug: yup.string().optional(),
            promotion: yup.array().of(yup.string()).optional(),
          })
        )
        .required(),
      totalAmount: yup.number().min(0).required(),
      shippingFee: yup.number().min(0).default(0),
      tax: yup.number().min(0).default(0).optional(),
      discountAmount: yup.number().min(0).default(0),
      paymentMethod: yup
        .string()
        .oneOf(["cod", "e_wallet", "credit_card"])
        .required(),
      paymentStatus: yup
        .string()
        .oneOf(["pending", "paid", "failed"])
        .default("pending"),
      shippingAddress: yup
        .object({
          street: yup.string().required(),
          ward: yup.string().required(),
          district: yup.string().required(),
          city: yup.string().required(),
          wardName: yup.string().required(),
          districtName: yup.string().required(),
          cityName: yup.string().required(),
        })
        .required(),
      shippingInfo: yup
        .object({
          recipientName: yup.string().required(),
          phone: yup
            .string()
            .matches(/^\+?\d{9,15}$/, "Số điện thoại không hợp lệ")
            .required("Vui lòng nhập số điện thoại"),
          gender: yup.string().optional(),
        })
        .required(),
      shippingMethod: yup
        .string()
        .oneOf(["standard", "express"])
        .required("Vui lòng chọn hình thức vận chuyển"),
      status: yup
        .string()
        .oneOf(["pending", "processing", "shipped", "delivered", "canceled"])
        .default("pending"),
      notes: yup.string().max(500).optional(),
      orderDate: yup.date().optional(),
      user: yup.string().required(),
      invoice: yup
        .object({
          companyName: yup.string().required(),
          companyAddress: yup.string().required(),
          taxCode: yup
            .string()
            .matches(
              /^\d{10,13}$/,
              "Mã số thuế phải là chuỗi số từ 10-13 chữ số"
            )
            .required(),
          companyEmail: yup.string().email().required(),
        })
        .optional(),
    }),
  })
  .strict()
  .unknown(true, "Không được gửi field không hợp lệ")
  .required();

// update by id
const updateByIdSchema = yup
  .object({
    params: yup.object({
      id: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, {
          message: "ID is non-ObjectID",
        })
        .required(),
    }),
    body: yup.object({
      orderNumber: yup.string().max(50).optional(),
      products: yup
        .array()
        .of(
          yup.object({
            productId: yup.string().optional(),
            name: yup.string().optional(),
            price: yup.number().min(0).optional(),
            salePrice: yup.number().min(0).optional(),
            quantity: yup.number().min(1).optional(),
            total: yup.number().min(0).optional(),
            image: yup.string().url().optional(),
            slug: yup.string().optional(),
            promotion: yup.array().of(yup.string()).optional(),
          })
        )
        .optional(),
      totalAmount: yup.number().min(0).optional(),
      shippingFee: yup.number().min(0).optional(),
      tax: yup.number().min(0).optional(),
      discountAmount: yup.number().min(0).optional(),
      paymentMethod: yup
        .string()
        .oneOf(["cod", "e_wallet", "credit_card"])
        .optional(),
      paymentStatus: yup
        .string()
        .oneOf(["pending", "paid", "failed"])
        .optional(),
      shippingAddress: yup
        .object({
          street: yup.string().required(),
          ward: yup.string().required(),
          district: yup.string().required(),
          city: yup.string().required(),
          wardName: yup.string().required(),
          districtName: yup.string().required(),
          cityName: yup.string().required(),
        })
        .optional(),
      shippingInfo: yup
        .object({
          recipientName: yup.string().optional(),
          phone: yup
            .string()
            .matches(/^\+?\d{9,15}$/, "Số điện thoại không hợp lệ")
            .optional(),
          gender: yup.string().optional(),
        })
        .optional(),
      shippingMethod: yup
        .string()
        .oneOf(["standard", "express"])
        .required("Vui lòng chọn hình thức vận chuyển"),
      status: yup
        .string()
        .oneOf(["pending", "processing", "shipped", "delivered", "canceled"])
        .optional(),
      notes: yup.string().max(500).optional(),
      orderDate: yup.date().optional(),
      user: yup.string().optional(),
      invoice: yup
        .object({
          companyName: yup.string().optional(),
          companyAddress: yup.string().optional(),
          taxCode: yup
            .string()
            .optional()
            .matches(
              /^\d{10,13}$/,
              "Mã số thuế phải là chuỗi số từ 10-13 chữ số"
            ),
          companyEmail: yup.string().email().optional(),
        })
        .optional(),
    }),
  })
  .strict()
  .required();

// delete by id
const deleteByIdSchema = yup
  .object({
    params: yup.object({
      id: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, {
          message: "ID is non-ObjectID",
        })
        .required(),
    }),
  })
  .required();

// cancel by id
const cancelByIdSchema = yup
  .object({
    params: yup.object({
      id: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, {
          message: "ID is non-ObjectID",
        })
        .required("Thiếu ID đơn hàng"),
    }),
    body: yup.object({
      status: yup
        .string()
        .oneOf(["canceled"], "Trạng thái không hợp lệ")
        .required("Phải gửi trạng thái huỷ là 'canceled'"),
      paymentStatus: yup.string().oneOf(["failed"]).optional(),
    }),
  })
  .strict()
  .required();
export default {
  getAllSchema,
  getByIdSchema,
  getByUserIdSchema,
  createSchema,
  updateByIdSchema,
  deleteByIdSchema,
  cancelByIdSchema,
};
