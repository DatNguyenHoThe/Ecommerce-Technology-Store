import { axiosClient } from "@/libs/axiosClient";
import { env } from "@/libs/env.helper";
import axios from "axios";

const API_BASE = "https://provinces.open-api.vn/api";

export const getProvinces = async () => {
  const res = await axios.get(`${API_BASE}/p/`);
  return res.data;
};

export const getDistrictsByProvince = async (provinceCode: string | number) => {
  const res = await axios.get(`${API_BASE}/p/${provinceCode}?depth=2`);
  return res.data.districts || [];
};

export const getWardsByDistrict = async (districtCode: string | number) => {
  const res = await axios.get(`${API_BASE}/d/${districtCode}?depth=2`);
  return res.data.wards || [];
};

export const fetchUserAddresses = async (userId: string) => {
  const res = await axiosClient.get(
    `${env.API_URL}/addresses/user/${userId}`
  );
  return res.data?.data;
};