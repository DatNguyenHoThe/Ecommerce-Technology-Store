"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/useCartStore";

export default function AppInitSync() {
  const user = useAuthStore((state) => state.user);
  const setSource = useCartStore((state) => state.setSource);

  useEffect(() => {
    if (user?._id) {
      setSource("server", user._id);
    } else {
      setSource("local");
    }
  }, [user?._id]);

  return null;
}
