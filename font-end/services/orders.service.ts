import { IOrder } from "@/app/types/types";
import { axiosClient } from "@/libs/axiosClient";
import { env } from "@/libs/env.helper";

export const getOrdersByUser = async (
  userId: string,
  page = 1,
  limit = 5,
  status?: string,
  orderNumber?: string
) => {
  const res = await axiosClient.get(`${env.API_URL}/orders/user/${userId}`, {
    params: { page, limit, status, orderNumber },
  });
  return res.data;
};

export const getOrderById = async (id: string): Promise<IOrder> => {
  const res = await axiosClient.get(`${env.API_URL}/orders/${id}`);
  return res.data.data;
};

export const createOrder = async (data: any) => {
  const res = await axiosClient.post(`${env.API_URL}/orders`, data);
  return res.data;
};

export const cancelOrder = async (orderId: string) => {
  const res = await axiosClient.patch(`${env.API_URL}/orders/${orderId}/cancel`, {
    status: "canceled",
    paymentStatus: "failed",
  });
  return res.data;
};