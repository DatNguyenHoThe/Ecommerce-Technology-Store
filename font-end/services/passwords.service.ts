import { axiosClient } from "@/libs/axiosClient";
import { env } from "@/libs/env.helper";

export interface IChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const changePassword = async (payload: IChangePasswordPayload): Promise<void> => {
    const response = await axiosClient.put(`${env.API_URL}/change-password`, payload);
    return response.data;
};
