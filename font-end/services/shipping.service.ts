export const getShippingFee = async (
  provinceCode: string | number
): Promise<number> => {
  // Map mã tỉnh (code) -> phí vận chuyển (VNĐ)
  const provinceFeeMap: Record<string, number> = {
    "1": 15000, // Hà Nội
    "79": 20000, // Hồ Chí Minh
    "48": 0, // Đà Nẵng
    "31": 17000, // Hải Phòng
    "92": 16000, // Cần Thơ
    "74": 19000, // Bình Dương
    "75": 19000, // Đồng Nai
    "40": 22000, // Nghệ An
    "38": 22000, // Thanh Hóa
    "56": 20000, // Khánh Hòa
    // Thêm tỉnh khác nếu muốn
  };

  const code = String(provinceCode);
  return provinceFeeMap[code] ?? 30000; // Mặc định 30,000đ nếu không có trong map
};
