/**
 * Footer Component
 * Site footer with links, description, and social media
 */

import * as React from "react";
import Link from "next/link";
import { Github, Twitter } from "lucide-react";
import { SITE_CONFIG, ROUTES } from "@/lib/constants";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const navigationLinks = [
    { href: ROUTES.home, label: "Home" },
    { href: ROUTES.contest, label: "Contest" },
    { href: ROUTES.archive, label: "Archive" },
  ];

  const socialLinks = [
    {
      href: SITE_CONFIG.social.github,
      label: "GitHub",
      icon: Github,
    },
    {
      href: `https://twitter.com/${SITE_CONFIG.social.twitter.replace("@", "")}`,
      label: "Twitter",
      icon: Twitter,
    },
  ];

  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        {/* Three Column Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* About Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">{SITE_CONFIG.name}</h3>
            <p className="text-sm text-muted-foreground">
              {SITE_CONFIG.description}
            </p>
            <p className="text-sm text-muted-foreground">
              Vote for your favorite AI-generated artwork each week and discover
              amazing creations from talented artists.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Navigation</h3>
            <ul className="space-y-2">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Connect</h3>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
            <p className="text-sm text-muted-foreground">
              Follow us for updates and announcements
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-border pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              &copy; {currentYear} {SITE_CONFIG.name}. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Built by{" "}
              <a
                href={SITE_CONFIG.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium transition-colors hover:text-foreground"
              >
                {SITE_CONFIG.author}
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

Footer.displayName = "Footer";
