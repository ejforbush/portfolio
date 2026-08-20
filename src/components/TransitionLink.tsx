"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNavTransition, isPlainLeftClick } from "@/components/NavTransition";

export default function TransitionLink({
  href,
  className,
  children,
  onClick,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}) {
  const pathname = usePathname();
  const { navigate } = useNavTransition();

  const handleClick = (e: React.MouseEvent) => {
    onClick?.(e);
    if (e.defaultPrevented || !isPlainLeftClick(e)) return; // let modified clicks (new tab, etc.) behave normally

    const targetPath = href.split("#")[0] || "/";
    if (targetPath === pathname) return; // already there, nothing to navigate

    e.preventDefault();
    navigate(href);
  };

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}
