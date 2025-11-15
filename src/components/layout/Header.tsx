/**
 * Header Component
 * Sticky navigation header with logo and links
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE_CONFIG, ROUTES } from "@/lib/constants";

export const Header: React.FC = () => {
  const pathname = usePathname();

  const isActive = (path: string): boolean => {
    if (path === ROUTES.home) {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  const navLinks = [
    { href: ROUTES.contest, label: "Contest" },
    { href: ROUTES.archive, label: "Archive" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo and Site Name */}
        <Link
          href={ROUTES.home}
          className="flex items-center space-x-2 transition-opacity hover:opacity-80"
        >
          <Trophy className="h-6 w-6 text-primary" strokeWidth={2.5} />
          <span className="text-xl font-bold tracking-tight">
            {SITE_CONFIG.name}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive(link.href)
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Navigation */}
        <nav className="flex items-center space-x-4 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive(link.href)
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

Header.displayName = "Header";
