// "use client";

// import { X } from "lucide-react";
// import * as yup from "yup";
// import { useFormContext } from "react-hook-form";

// interface Props {
//   isOpen: boolean;
//   onClose: () => void;
// }
// const schema = yup.object({
//   fullName: yup.string().required("Vui lòng nhập họ tên"),
//   phone: yup
//     .string()
//     .matches(/^\+?\d{9,15}$/, "Số điện thoại không hợp lệ")
//     .required("Vui lòng nhập số điện thoại"),
//   email: yup
//     .string()
//     .email("Email không hợp lệ")
//     .required("Vui lòng nhập email"),
// });
// const methods = useFormContext();

// export default function LoginModal({ isOpen, onClose }: Props) {
//   return (
//     <div
//       className="fixed inset-0 bg-[#11111180] z-50 flex justify-center items-center"
//       onClick={onClose}
//     >
//       <div
//         className="relative w-full max-w-[500px] bg-white rounded-2xl shadow-lg"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="flex justify-between p-6 items-center border-b border-[#CFCFCF]">
//           <p className="text-lg leading-0 text-[#333] font-semibold">
//             Đăng nhập
//           </p>
//           <button className="text-[#6D6E72] cursor-pointer" onClick={onClose}>
//             <X />
//           </button>
//         </div>
//         <form className="p-6 space-y-4" onSubmit={onClose}>
//           <div className="relative w-full flex border rounded bg-white border-[#CFCFCF]">
//             <input
//               required
//               className="peer w-full px-4 outline-none"
//               id="street"
//               type="text"
//               {...methods.register("street", {
//                 required: "Vui lòng nhập địa chỉ",
//               })}
//             />
//             {methods.formState.errors.street && (
//               <p className="absolute mt-9.75 ml-3.75 text-red-500 text-sm pointer-events-none select-none">
//                 {methods.formState.errors.street.message?.toString()}
//               </p>
//             )}
//             <label
//               htmlFor="street"
//               className="absolute top-1/2 left-4 translate-y-[-50%] px-2 text-[#535353] peer-focus:top-0 peer-focus:left-3 peer-focus:text-sm peer-focus:font-light peer-valid:-top-0 peer-valid:left-3 peer-valid:text-sm pointer-events-none select-none duration-150"
//             >
//               Số nhà, tên đường
//             </label>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
