import * as yup from "yup";

const changePasswordSchema = yup.object({
  body: yup.object({
    currentPassword: yup.string().required("Vui lòng nhập mật khẩu hiện tại"),
    newPassword: yup
      .string()
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
      .required("Vui lòng nhập mật khẩu mới"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("newPassword")], "Mật khẩu xác nhận không khớp")
      .required("Vui lòng xác nhận mật khẩu mới"),
  }),
});
export default{
    changePasswordSchema
}