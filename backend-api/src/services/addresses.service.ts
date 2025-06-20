import Address from "../models/address.model";
import createError from "http-errors";

//Get all
const getAll = async (query: any) => {
  const { page = 1, limit = 10 } = query;
  const sortBy = query.sort_by || "createdAt";
  const sortType = query.sort_type === "desc" ? -1 : 1;
  const sortObject: { [key: string]: 1 | -1 } = { [sortBy]: sortType };

  console.log("sortObject : ", sortObject);

  //tìm kiếm theo điều kiện
  let where = {};
  // nếu có tìm kiếm theo số điện thoại
  if (query.phoneNumber && query.phoneNumber.length > 0) {
    where = {
      ...where,
      phoneNumber: { $regex: query.phoneNumber, $options: "i" },
    };
  }

  const addresses = await Address.find(where)
    .populate("user")
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ ...sortObject });

  //Đếm tổng số record hiện có của collection addresses
  const count = await Address.countDocuments(where);

  return {
    addresses,
    pagination: {
      totalRecord: count,
      page,
      limit,
    },
  };
};

//get by ID
const getById = async (id: string) => {
  const address = await Address.findById(id);
  if (!address) {
    throw createError(404, "address not found, please try again with other id");
  }
  return address;
};

//getby userId
const getByUserId = async (userId: string, query: any) => {
  const {
    page = 1,
    limit = 10,
    sort_by = "createdAt",
    sort_type = "desc",
    keyword,
  } = query;
  
  const where: any = { user: userId };

  // Sắp xếp: địa chỉ mặc định lên đầu, sau đó mới sắp theo sort_by
  const sortObject: any = {
    isDefault: -1, // true lên đầu
    [sort_by]: sort_type === "desc" ? -1 : 1,
  };


  if (keyword && keyword.length > 0) {
    where.$or = [
      { fullName: { $regex: keyword, $options: "i" } },
      { phoneNumber: { $regex: keyword, $options: "i" } },
      { street: { $regex: keyword, $options: "i" } },
      { cityName: { $regex: keyword, $options: "i" } },
      { districtName: { $regex: keyword, $options: "i" } },
      { wardName: { $regex: keyword, $options: "i" } },
    ];
  }

  const addresses = await Address.find(where)
  .skip((page - 1) * limit)
  .limit(Number(limit))
  .sort(sortObject);

  const count = await Address.countDocuments(where);

  return {
    data: addresses,
    pagination: {
      totalAddresses: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit),
    },
  };
};

// Create
const create = async (payload: any) => {
  if (!payload.user) {
    throw createError(400, "Missing user ID in payload");
  }
  const address = new Address({
    type: payload.type,
    fullName: payload.fullName,
    phoneNumber: payload.phoneNumber,
    street: payload.street,
    ward: payload.ward,
    wardName: payload.wardName,
    district: payload.district,
    districtName: payload.districtName,
    city: payload.city,
    cityName: payload.cityName,
    country: payload.country,
    isDefault: payload.isDefault,
    user: payload.user,
  });
  // lưu dữ liệu
  await address.save();
  return address; // trả về kết quả để truy xuất dữ liệu trong controller
};
// update by ID
const updateById = async (id: string, payload: any) => {
  //kiểm tra xem id có tồn tại không
  const address = await getById(id);
  if (!address) {
    throw createError(404, "address not found");
  }
  // trộn dữ liệu mới và cũ
  Object.assign(address, payload);
  //lưu dữ liệu xuống database
  await address.save();
  // trả kết quả
  return address;
};
//Delete by id
const deleteById = async (id: string) => {
  //kiểm tra xem id có tồn tại không
  const address = await getById(id);
  if (!address) {
    throw createError(404, "address not found");
  }
  //xóa address
  await address.deleteOne();
  return address;
};

//update isDefault = true
const updateAddressDefault = async (id: string) => {
  //kiểm tra xem id có tồn tại không
  const address = await getById(id);
  if (!address) {
    throw createError(404, "address not found");
  }
  //Bước 1: Lấy userId
  const userId = address.user;

  // Bước 2: Set tất cả địa chỉ của user đó thành isDefault: false
  await Address.updateMany({ user: userId }, { $set: { isDefault: false } });

  // Bước 3: Set địa chỉ được chọn thành isDefault: true
  const updateAddress = await Address.findByIdAndUpdate(
    id,
    { $set: { isDefault: true } },
    { new: true } // trả về bản ghi sau khi update
  );

  if (!updateAddress) {
    throw new Error("Address not found");
  }

  return updateAddress;
};

export default {
  getAll,
  getById,
  getByUserId,
  create,
  updateById,
  deleteById,
  updateAddressDefault,
};
