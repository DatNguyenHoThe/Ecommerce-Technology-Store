"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCartStore } from "@/stores/useCartStore";

export default function LogoutConfirmDialog({
  children,
  onLogout,
}: {
  children: React.ReactNode;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const handleConfirm = async () => {
    try {
      onLogout();
      await useCartStore.getState().clearCart();
      await useCartStore.getState().setSource("local");
      setOpen(false);
    } catch (err) {
      console.error("❌ Error during logout", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Chắc chắn bạn muốn đăng xuất?</DialogTitle>
          <DialogDescription>
            Hành động này sẽ kết thúc phiên làm việc của bạn và đưa bạn về trang
            đăng nhập.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => setOpen(false)}
          >
            Huỷ
          </Button>
          <Button
            variant="destructive"
            className="cursor-pointer"
            onClick={handleConfirm}
          >
            Đăng xuất
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
