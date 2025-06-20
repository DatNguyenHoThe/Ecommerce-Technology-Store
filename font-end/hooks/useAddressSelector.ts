import { useEffect, useState } from "react";
import {
  getProvinces,
  getDistrictsByProvince,
  getWardsByDistrict,
} from "@/services/address.service";

type AddressItem = {
  code: string;
  name: string;
};

export const useAddressSelector = (city?: string, district?: string) => {
  const [provinces, setProvinces] = useState<AddressItem[]>([]);
  const [districts, setDistricts] = useState<AddressItem[]>([]);
  const [wards, setWards] = useState<AddressItem[]>([]);

  // Load provinces
  useEffect(() => {
    getProvinces().then(setProvinces);
  }, []);

  // Load districts when city changes
  useEffect(() => {
    if (city) {
      getDistrictsByProvince(city).then(setDistricts);
    } else {
      setDistricts([]);
    }
    setWards([]); // Reset wards
  }, [city]);

  // Load wards when district changes
  useEffect(() => {
    if (district) {
      getWardsByDistrict(district).then(setWards);
    } else {
      setWards([]);
    }
  }, [district]);
  // Derive names from codes
  const getProvinceName = (code: string) => {
    return provinces.find((p) => String(p.code) === String(code))?.name || "";
  };

  const getDistrictName = (code: string) => {
    return districts.find((d) => String(d.code) === String(code))?.name || "";
  };

  const getWardName = (code: string) => {
    return wards.find((w) => String(w.code) === String(code))?.name || "";
  };

  return {
    provinces,
    districts,
    wards,
    getProvinceName,
    getDistrictName,
    getWardName,
  };
};
