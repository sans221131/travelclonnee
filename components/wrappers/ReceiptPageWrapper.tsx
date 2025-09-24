"use client";

import { CartProvider } from "@/contexts/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";
import CartNotification from "@/components/cart/CartNotification";

export default function ReceiptPageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
      <CartNotification />
    </CartProvider>
  );
}