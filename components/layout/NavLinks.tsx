"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  links: { href: string; label: string }[];
  contestHref: string;
}

export function NavLinks({ links, contestHref }: Props) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    // Contest link matches any /contest/* path
    if (href === contestHref && pathname.startsWith("/contest/")) return true;
    return pathname.startsWith(href);
  }

  return (
    <>
      {links.map(({ href, label }) => (
        <Link
          key={label}
          href={href}
          style={{
            fontSize: "0.875rem",
            fontWeight: 500,
            color: isActive(href) ? "#eeeeff" : "#7878a0",
            textDecoration: "none",
            transition: "color 0.15s",
            borderBottom: isActive(href) ? "1px solid rgba(139,92,246,0.5)" : "1px solid transparent",
            paddingBottom: "2px",
          }}
        >
          {label}
        </Link>
      ))}
    </>
  );
}
