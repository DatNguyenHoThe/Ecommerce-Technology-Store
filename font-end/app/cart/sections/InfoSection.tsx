import AddressSelector from "@/app/cart/components/addressSelector";
import CartSummary from "@/app/cart/components/cartSummary";
import { ICheckoutForm, IAddress } from "@/app/types/types";
import { useCartStore } from "@/stores/useCartStore";
import { useForm, FormProvider } from "react-hook-form";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { fetchUserAddresses } from "@/services/address.service";
import { useAddressSelector } from "@/hooks/useAddressSelector";
import { toast } from "sonner";

type SummaryData = {
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  tax: number;
  total: number;
};

export default function InfoSection({
  goToSection,
  setSummary,
}: {
  goToSection: (hash: string) => void;
  setSummary: Dispatch<SetStateAction<SummaryData>>;
}) {
  const { user } = useAuthStore();
  const {
    source,
    setSource,
    localItems,
    serverCart,
    fetchServerCart,
    setFormData,
    formData,
  } = useCartStore();

  const cartItems = useMemo(() => {
    return source === "local" ? localItems : serverCart?.items || [];
  }, [source, localItems, serverCart?.items]);

  useEffect(() => {
    if (!user || cartItems.length === 0) {
      window.location.href = "/cart";
    }
  }, [user, cartItems]);

  // Cập nhật lại source khi user thay đổi
  useEffect(() => {
    setSource(user ? "server" : "local", user ? user._id : undefined);
  }, [user, setSource]);

  useEffect(() => {
    if (source === "server" && user?._id && !serverCart) {
      fetchServerCart(user._id);
    }
  }, [source, user?._id, serverCart, fetchServerCart]);

  const [showBillDetail, setShowBillDetail] = useState(false);
  const methods = useForm<ICheckoutForm>({});
  const { setValue } = methods;

  useEffect(() => {
    const fetchDefaultAddress = async () => {
      try {
        if (!user?._id) return;
        const { data: addresses } = await fetchUserAddresses(user._id);
        const defaultAddress = addresses.find(
          (addr: IAddress) => addr.isDefault
        );

        if (!defaultAddress) return;

        // Cập nhật từng trường bằng setValue
        setValue("fullname", defaultAddress.fullName);
        setValue("phone", defaultAddress.phoneNumber);
        setValue("street", defaultAddress.street);
        setValue("city", defaultAddress.city);
        setValue("district", defaultAddress.district);
        setValue("ward", defaultAddress.ward);
        setFormData({
          city: defaultAddress.city,
          district: defaultAddress.district,
          ward: defaultAddress.ward,
        });
      } catch (err) {
        console.error("Lỗi khi lấy địa chỉ mặc định: ", err);
        toast.error("Lỗi khi lấy địa chỉ mặc định");
      }
    };

    fetchDefaultAddress();
  }, [user?._id, setValue, setFormData]);

  const cityCode = methods.watch("city");
  const districtCode = methods.watch("district");
  const wardCode = methods.watch("ward");
  const { getProvinceName, getDistrictName, getWardName } = useAddressSelector(
    cityCode,
    districtCode
  );

  const onSubmit = (data: ICheckoutForm) => {
    const info: ICheckoutForm = {
      ...data,
      cityName: getProvinceName(cityCode),
      districtName: getDistrictName(districtCode),
      wardName: getWardName(wardCode),
      invoice:
        showBillDetail && data.invoice
          ? {
              companyName: data.invoice.companyName,
              companyAddress: data.invoice.companyAddress,
              taxCode: data.invoice.taxCode,
              companyEmail: data.invoice.companyEmail,
            }
          : undefined,
    };
    setFormData(info);
    goToSection("payment");
  };

  return (
    <div className="cart-infos p-4">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <h2 className="text-lg font-semibold mb-1">
            Thông tin khách mua hàng
          </h2>
          <div>
            <input
              type="radio"
              id="male"
              value="male"
              {...methods.register("gender")}
              defaultChecked={!user?.gender || user?.gender === "male"}
            />
            <label className="ml-2" htmlFor="male">
              Anh
            </label>
            <input
              className="ml-8"
              type="radio"
              id="female"
              value="female"
              {...methods.register("gender")}
              defaultChecked={user?.gender === "female"}
            />
            <label className="ml-2" htmlFor="female">
              Chị
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="mt-4 w-3xs h-10 relative flex rounded bg-white border border-[#CFCFCF]">
                <input
                  className="peer w-full px-4 outline-none"
                  required
                  id="fullname"
                  type="text"
                  defaultValue={user?.fullName}
                  {...methods.register("fullname", {
                    required: "Vui lòng nhập họ tên",
                  })}
                />
                {methods.formState.errors.fullname && (
                  <p className="absolute mt-11 ml-4 text-red-500 text-sm pointer-events-none select-none">
                    {methods.formState.errors.fullname.message?.toString()}
                  </p>
                )}
                <label
                  className="absolute top-1/2 left-4 translate-y-[-50%] px-2 text-[#535353] bg-white peer-focus:top-0 peer-focus:left-3 peer-focus:text-sm peer-focus:font-light peer-valid:-top-0 peer-valid:left-3 peer-valid:text-sm pointer-events-none select-none duration-150"
                  htmlFor="fullname"
                >
                  Nhập họ tên
                </label>
              </div>
              <div className="mt-4 w-3xs h-10 relative flex rounded bg-white border border-[#CFCFCF]">
                <input
                  className="peer w-full px-4 outline-none"
                  required
                  id="phone"
                  type="tel"
                  inputMode="numeric" // hiện bàn phím số trên mobile
                  onInput={(e) => {
                    const input = e.target as HTMLInputElement;
                    input.value = input.value.replace(/[^\d+]/g, "");
                  }}
                  defaultValue={user?.phone}
                  {...methods.register("phone", {
                    required: "Vui lòng nhập số điện thoại",
                    pattern: {
                      value: /^\+?\d{9,15}$/,
                      message: "Số điện thoại không hợp lệ",
                    },
                  })}
                />
                {methods.formState.errors.phone && (
                  <p className="absolute mt-11 ml-4 text-red-500 text-sm pointer-events-none select-none">
                    {methods.formState.errors.phone.message?.toString()}
                  </p>
                )}
                <label
                  className="absolute top-1/2 left-4 translate-y-[-50%] px-2 text-[#535353] bg-white peer-focus:top-0 peer-focus:left-3 peer-focus:text-sm peer-focus:font-light peer-valid:-top-0 peer-valid:left-3 peer-valid:text-sm pointer-events-none select-none duration-150"
                  htmlFor="phone"
                >
                  Nhập số điện thoại
                </label>
              </div>
            </div>
          </div>
          <h2 className="text-lg font-semibold mt-6 mb-1">
            Chọn cách nhận hàng
          </h2>
          <input
            type="radio"
            id="cod-method"
            value="Giao hàng tận nơi"
            defaultChecked
          />
          <label className="ml-2" htmlFor="cod-method">
            Giao hàng tận nơi
          </label>
          <div className="bg-[#ECECEC] mt-4 px-6 py-4 rounded">
            <AddressSelector customLabelClass="linear-label" />
          </div>
          <div className="mt-6 w-full h-10 relative flex rounded bg-white border border-[#CFCFCF]">
            <input
              className="peer w-full px-4 outline-none"
              required
              id="note"
              type="text"
              {...methods.register("note")}
            />
            <label
              className="absolute top-1/2 left-4 translate-y-[-50%] px-2 text-[#535353] bg-white peer-focus:top-0 peer-focus:left-3 peer-focus:text-sm peer-focus:font-light peer-valid:-top-0 peer-valid:left-3 peer-valid:text-sm pointer-events-none select-none duration-150"
              htmlFor="note"
            >
              Lưu ý, yêu cầu khác (Không bắt buộc)
            </label>
          </div>
          <div>
            <input
              className="mt-6 mr-2 show-info"
              type="checkbox"
              id="checkbox-bill"
              onChange={(e) => setShowBillDetail(e.target.checked)}
            />
            <label className="ml-2" htmlFor="checkbox-bill">
              Xuất hoá đơn cho đơn hàng
            </label>
          </div>
          {showBillDetail && (
            <div className="bill-detail grid grid-cols-2 gap-4 mt-4 px-6 py-4 bg-[#ECECEC] rounded">
              <div className="w-full h-10 relative flex col-span-2 rounded bg-white border border-[#CFCFCF]">
                <input
                  className="peer w-full px-4 outline-none"
                  required
                  id="company-name"
                  type="text"
                  {...methods.register("invoice.companyName", {
                    required: "Vui lòng nhập tên công ty",
                  })}
                />
                {methods.formState.errors.invoice?.companyName && (
                  <p className="absolute h-full flex items-center ml-69 text-red-500 text-sm pointer-events-none select-none">
                    {methods.formState.errors.invoice.companyName.message?.toString()}
                  </p>
                )}
                <label
                  className="linear-label absolute top-1/2 left-4 translate-y-[-50%] px-2 text-[#535353] peer-focus:top-0 peer-focus:left-3 peer-focus:text-sm peer-focus:font-light peer-valid:-top-0 peer-valid:left-3 peer-valid:text-sm pointer-events-none select-none duration-150"
                  htmlFor="company-name"
                >
                  Tên công ty
                </label>
              </div>
              <div className="w-full h-10 relative flex col-span-2 rounded bg-white border border-[#CFCFCF]">
                <input
                  className="peer w-full px-4 outline-none"
                  required
                  id="company-address"
                  type="text"
                  {...methods.register("invoice.companyAddress", {
                    required: "Vui lòng nhập địa chỉ công ty",
                  })}
                />
                {methods.formState.errors.invoice?.companyAddress && (
                  <p className="absolute h-full flex items-center ml-69 text-red-500 text-sm pointer-events-none select-none">
                    {methods.formState.errors.invoice.companyAddress.message?.toString()}
                  </p>
                )}
                <label
                  className="linear-label absolute top-1/2 left-4 translate-y-[-50%] px-2 text-[#535353] peer-focus:top-0 peer-focus:left-3 peer-focus:text-sm peer-focus:font-light peer-valid:-top-0 peer-valid:left-3 peer-valid:text-sm pointer-events-none select-none duration-150"
                  htmlFor="company-address"
                >
                  Địa chỉ công ty
                </label>
              </div>
              <div className="w-full h-10 relative flex rounded bg-white border border-[#CFCFCF]">
                <input
                  className="peer w-full px-4 outline-none"
                  required
                  id="tax-code"
                  type="text"
                  inputMode="numeric" // hiện bàn phím số trên mobile
                  onInput={(e) => {
                    const input = e.target as HTMLInputElement;
                    input.value = input.value.replace(/\D/g, ""); // chỉ cho số
                  }}
                  {...methods.register("invoice.taxCode", {
                    required: "Vui lòng nhập mã số thuế",
                    pattern: {
                      value: /^\d{10,13}$/,
                      message: "Mã số thuế không hợp lệ",
                    },
                  })}
                />
                {methods.formState.errors.invoice?.taxCode && (
                  <p className="absolute mt-9.25 ml-4 text-red-500 text-sm pointer-events-none select-none">
                    {methods.formState.errors.invoice.taxCode.message?.toString()}
                  </p>
                )}
                <label
                  className="linear-label absolute top-1/2 left-4 translate-y-[-50%] px-2 text-[#535353] peer-focus:top-0 peer-focus:left-3 peer-focus:text-sm peer-focus:font-light peer-valid:-top-0 peer-valid:left-3 peer-valid:text-sm pointer-events-none select-none duration-150"
                  htmlFor="tax-code"
                >
                  Mã số thuế
                </label>
              </div>
              <div className="w-full h-10 relative flex rounded bg-white border border-[#CFCFCF]">
                <input
                  required
                  className="peer w-full px-4 outline-none"
                  id="email"
                  type="text"
                  {...methods.register("invoice.companyEmail", {
                    required: "Vui lòng nhập email công ty",
                    pattern: {
                      value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
                      message: "Email không hợp lệ",
                    },
                  })}
                />
                {methods.formState.errors.invoice?.companyEmail && (
                  <p className="absolute mt-9.25 ml-4 text-red-500 text-sm pointer-events-none select-none">
                    {methods.formState.errors.invoice.companyEmail.message?.toString()}
                  </p>
                )}
                <label
                  className="linear-label absolute top-1/2 left-4 translate-y-[-50%] px-2 text-[#535353] peer-focus:top-0 peer-focus:left-3 peer-focus:text-sm peer-focus:font-light peer-valid:-top-0 peer-valid:left-3 peer-valid:text-sm pointer-events-none select-none duration-150"
                  htmlFor="email"
                >
                  Email
                </label>
              </div>
            </div>
          )}
          <div className="section-info-shipping-rate mb-6">
            <h2 className="text-lg font-semibold mt-6 mb-1">
              Dịch vụ giao hàng
            </h2>
            <div className="flex items-center">
              <input
                type="radio"
                id="radio_delivery_0"
                name="delivery-order"
                value="standard"
                checked={formData.shippingMethod === "standard"}
                onChange={(e) =>
                  setFormData({ ...formData, shippingMethod: e.target.value })
                }
              />
              <label
                className="ml-2 w-full flex justify-between"
                htmlFor="radio_delivery_0"
              >
                <span>Giao hành tiêu chuẩn</span>
              </label>
            </div>
            <div className="flex items-center mt-4">
              <input
                type="radio"
                id="radio_delivery_1"
                name="delivery-order"
                value="express"
                checked={formData.shippingMethod === "express"}
                onChange={(e) =>
                  setFormData({ ...formData, shippingMethod: e.target.value })
                }
              />
              <label
                className="ml-2 w-full flex justify-between"
                htmlFor="radio_delivery_1"
              >
                <span>
                  Giao hành nhanh (
                  {`${(30000).toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}`}
                  )
                </span>
              </label>
            </div>
          </div>
          <CartSummary
            cartItems={cartItems}
            onPlaceOrder={methods.handleSubmit(onSubmit)}
            onSummaryChange={setSummary}
          />
          <p className="text-[#666] text-center mt-2 text-sm font-light">
            Bạn có thể chọn hình thức thanh toán sau khi đặt hàng
          </p>
        </form>
      </FormProvider>
    </div>
  );
}
