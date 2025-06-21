"use client";

import { uploadAvatar } from "@/services/user.service";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useRef, useState } from "react";
import LogoutConfirmDialog from "../ui/LogoutConfirmDialog";
import { useRouter, usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { env } from "@/libs/env.helper";
import { toast } from "sonner";
import Link from "next/link";
import clsx from "clsx";
import Image from "next/image";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser } = useAuthStore();
  const [avatarVersion, setAvatarVersion] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleLogout = () => {
    router.push("/");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user?._id) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const updatedUser = await uploadAvatar(user._id, "users", formData);
        if (updatedUser?.avatarUrl) {
          setUser({ ...user, avatarUrl: updatedUser.avatarUrl });
          setAvatarVersion(Date.now());
        }
        toast.success("Cập nhật avatar thành công");
      } catch (err) {
        console.error("Cập nhật avatar thất bại: ", err);
        toast.error("Cập nhật avatar thất bại");
      }
    }
  };

  useEffect(() => {
    setAvatarVersion(Date.now());
  }, []);

  const navItems = [
    {
      href: "/account/profile",
      icon: "bi-person-fill",
      label: "Thông tin tài khoản",
    },
    {
      href: "/account/addresses",
      icon: "bi-geo-alt-fill",
      label: "Sổ địa chỉ",
    },
    {
      href: "/account/orders",
      icon: "bi-handbag-fill",
      label: "Quản lí đơn hàng",
    },
    { href: "/account/viewed", icon: "bi-eye-fill", label: "Sản phẩm đã xem" },
    { href: "/account/password", icon: "bi-key-fill", label: "Đổi mật khẩu" },
  ];

  return (
    <div className="py-4 flex justify-center bg-[#ECECEC]">
      <div className="flex gap-x-4 w-[1200px]">
        <div className="w-[288px] bg-white rounded">
          <div className="border-b border-[#CFCFCF]">
            <div className="flex h-25 items-center p-4">
              <Image
                className="w-12 h-12 object-cover rounded-full cursor-pointer"
                src={
                  user?.avatarUrl
                    ? `${env.URL}${user.avatarUrl}${
                        avatarVersion ? `?v=${avatarVersion}` : ""
                      }`
                    : "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                }
                alt="avatar"
                width={48}
                height={48}
                onClick={handleAvatarClick}
              />
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="ml-6">
                <p className="text-lg font-semibold text-[#111]">
                  {user?.fullName}
                </p>
                <p className="mt-1 text-lg text-[#535353]">{user?.phone}</p>
              </div>
            </div>
          </div>
          <aside className="mt-1">
            <ul className="mt-1">
              {navItems.map(({ href, icon, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={clsx(
                      "flex items-center px-5 py-3 font-semibold cursor-pointer",
                      pathname === href
                        ? "text-[#E30019]"
                        : "text-[#535353] hover:text-[#E30019]"
                    )}
                  >
                    <i className={`bi ${icon} text-2xl mr-3`}></i>
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <LogoutConfirmDialog onLogout={handleLogout}>
                  <div className="flex items-center px-5 py-3 font-semibold cursor-pointer text-[#535353] hover:text-[#E30019]">
                    <LogOut className="text-2xl mr-3" />
                    Đăng xuất
                  </div>
                </LogoutConfirmDialog>
              </li>
            </ul>
          </aside>
        </div>
        <div className="flex-1 h-full bg-white rounded">{children}</div>
      </div>
    </div>
  );
}
