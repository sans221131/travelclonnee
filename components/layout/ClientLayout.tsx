"use client";

import { CartProvider } from "@/contexts/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";
import CartNotification from "@/components/cart/CartNotification";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Show cart only on activities and trip receipt pages
  const showCart = pathname.includes('/activities') || pathname.includes('/trip/receipt');

  return (
    <CartProvider>
      {children}
      {showCart && (
        <>
          <CartDrawer />
          <CartNotification />
        </>
      )}
    </CartProvider>
  );
}