"use client";

import { CartProvider } from "@/contexts/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";
import CartNotification from "@/components/cart/CartNotification";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Show cart on destinations, activities, trip receipt, and checkout pages
  const showCart = pathname.includes('/destinations') || 
                   pathname.includes('/activities') || 
                   pathname.includes('/trip/receipt') ||
                   pathname.includes('/checkout');

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