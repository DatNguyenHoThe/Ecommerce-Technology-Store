import { IAddress } from "@/app/types/types";
import { axiosClient } from "@/libs/axiosClient";
import { env } from "@/libs/env.helper";

export const createAdresses = async (data: IAddress) => {
  const res = await axiosClient.post(`${env.API_URL}/addresses`, data);
  return res.data;
};

export const getAddressesByUser = async (
  userId: string,
  page = 1,
  limit = 5
): Promise<{
  data: {
    data: IAddress[];
    pagination: {
      totalItems: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}> => {
  const res = await axiosClient.get(`${env.API_URL}/addresses/user/${userId}`, {
    params: { page, limit },
  });
  return res.data;
};

export const deleteAddressById = async (addressId: string) => {
  const res = await axiosClient.delete(`${env.API_URL}/addresses/${addressId}`);
  return res.data;
};

export const setDefaultAddress = async (addressId: string) => {
  const res = await axiosClient.put(
    `${env.API_URL}/addresses/isDefault/${addressId}`
  );
  return res.data;
};

export const updateAddressById = async (
  addressId: string,
  data: Partial<IAddress>
) => {
  const res = await axiosClient.put(
    `${env.API_URL}/addresses/${addressId}`,
    data
  );
  return res.data;
};
