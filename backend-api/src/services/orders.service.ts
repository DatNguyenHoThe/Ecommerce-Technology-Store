import Order from "../models/order.model";
import createError from "http-errors";
import Coupon from "../models/coupon.model";
// Get all orders with pagination, search, sort
const getAll = async (query: any) => {
  const {
    page = 1,
    limit = 10,
    sort_by = "createdAt",
    sort_type = "desc",
    orderNumber,
  } = query;

  const sortObject: any = {
    [sort_by]: sort_type === "desc" ? -1 : 1,
  };

  const where: any = {};
  if (orderNumber?.length > 0) {
    where.orderNumber = { $regex: orderNumber, $options: "i" };
  }

  const orders = await Order.find(where)
    .populate("user")
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort(sortObject);

  const count = await Order.countDocuments(where);

  return {
    orders,
    pagination: {
      totalRecord: count,
      limit: Number(limit),
      page: Number(page),
    },
  };
};

// Get order by ID
const getById = async (id: string) => {
  const order = await Order.findById(id).populate("user");
  if (!order) throw createError(404, "Order not found");
  return order;
};

// Get orders by userId
const getByUserId = async (userId: string, query: any) => {
  const {
    page = 1,
    limit = 10,
    orderNumber,
    status,
    sort_by = "createdAt",
    sort_type = "desc",
  } = query;

  const sortObject: any = {
    [sort_by]: sort_type === "desc" ? -1 : 1,
  };

  const where: any = { user: userId };

  if (orderNumber?.length > 0) {
    where.orderNumber = { $regex: orderNumber, $options: "i" };
  }

  if (status && status !== "all") {
    where.status = status;
  }

  const orders = await Order.find(where)
    .populate("user")
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort(sortObject);

  const count = await Order.countDocuments(where);

  return {
    data: orders,
    pagination: {
      totalOrders: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit),
    },
  };
};

// Create order
const create = async (payload: any) => {
  let orderNumber = `ORD-${Date.now()}`;
  while (await Order.findOne({ orderNumber })) {
    orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  // Clean input
  const cleanData = Object.fromEntries(
    Object.entries(payload).filter(
      ([_, value]) => value !== "" && value !== null && value !== undefined
    )
  );
  // Loại bỏ invoice nếu rỗng
  if (
    !cleanData.invoice ||
    Object.keys(cleanData.invoice).length === 0 ||
    Object.values(cleanData.invoice).every((v) => v === "")
  ) {
    delete cleanData.invoice;
  }
  const order = new Order({
    orderNumber,
    orderDate: cleanData.orderDate || new Date(),

    // Products
    products: cleanData.products,

    // Shipping
    shippingAddress: cleanData.shippingAddress,
    shippingInfo: cleanData.shippingInfo,
    shippingMethod: cleanData.shippingMethod || "standard",
    shippingFee: cleanData.shippingFee || 0,
    trackingNumber: cleanData.trackingNumber,

    // Payment
    paymentMethod: cleanData.paymentMethod,
    paymentStatus: cleanData.paymentStatus || "pending",
    paidAt: cleanData.paidAt || null,

    // Discount
    discountCode: cleanData.discountCode || "",
    discountAmount: cleanData.discountAmount || 0,

    // Total
    subTotal: cleanData.subTotal,
    tax: cleanData.tax || 0,
    totalAmount: cleanData.totalAmount,

    // Status
    status: cleanData.status || "pending",
    notes: cleanData.notes || "",

    // Invoice
    invoice: cleanData.invoice,

    // Reference
    user: cleanData.user || null,
  });

  await order.save();
  // Nếu có mã giảm giá thì tăng usageCount
  if (order.discountCode) {
    await Coupon.findOneAndUpdate(
      { code: order.discountCode },
      { $inc: { usageCount: 1 } }
    );
  }
  return order;
};

// Update order
const updateById = async (id: string, payload: any) => {
  const order = await getById(id);
  if (!order) throw createError(404, "Order not found");
  if (payload.orderNumber) {
    const existing = await Order.findOne({
      orderNumber: payload.orderNumber,
      _id: { $ne: id },
    });
    if (existing) throw createError(409, "Order number already exists");
  }
  Object.assign(order, payload);
  await order.save();
  return order;
};

// Delete order
const deleteById = async (id: string) => {
  const order = await getById(id);
  if (!order) throw createError(404, "Order not found");

  await order.deleteOne({ _id: id });
  return order;
};
// Cancel order
const cancelById = async (id: string) => {
  const order = await getById(id);
  if (!order) throw createError(404, "Order not found");

  // Nếu đơn đã giao hoặc huỷ thì không được huỷ nữa
  if (["canceled"].includes(order.status)) {
    throw createError(400, "Không thể huỷ đơn hàng ở trạng thái hiện tại");
  }

  order.status = "canceled";
  order.paymentStatus = "failed";
  await order.save();

  return order;
};
export default {
  getAll,
  getById,
  getByUserId,
  create,
  updateById,
  deleteById,
  cancelById,
};
