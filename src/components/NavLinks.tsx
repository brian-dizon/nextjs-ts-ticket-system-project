"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-5 mr-auto">
      <Link href="/" className={pathname === "/" ? "text-black font-semibold" : ""}>
        Dashboard
      </Link>
      <Link href="/tickets" className={pathname.startsWith("/tickets") ? "text-black font-semibold mr-auto" : ""}>
        Tickets
      </Link>
    </div>
  );
}
