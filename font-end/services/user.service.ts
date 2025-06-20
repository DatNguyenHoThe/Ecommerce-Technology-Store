import { axiosClient } from "@/libs/axiosClient";
import { env } from "@/libs/env.helper";

export const updateProfile = async (id: string, data: any) => {
  try {
    const response = await axiosClient.put(`${env.API_URL}/users/${id}`, data);
    return response.data;
  } catch (err: any) {
    throw err.response?.data || err.message;
  }
};

export const getProfile = async (id: string) => {
  try {
    if (!id) {
      throw new Error("User ID is required");
    }
    const response = await axiosClient.get(`${env.API_URL}/users/${id}`);
    return response.data;
  } catch (err: any) {
    throw err.response?.data || err.message;
  }
};

export const uploadAvatar = async (
  id: string,
  collectionName: string,
  formData: FormData
) => {
  try {
    const res = await axiosClient.put(
      `${env.API_URL}/users/${id}/avatar/${collectionName}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return res.data.data;
  } catch (err: any) {
    throw err.response?.data || err.message;
  }
};
