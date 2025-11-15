# 🏗️ Layout Components Documentation

**AI Art Arena - Layout Structure**

Complete layout system with Header, Footer, and root layout configuration.

---

## 📂 Component Structure

```
src/
├── components/layout/
│   ├── Header.tsx       # Sticky navigation header
│   ├── Footer.tsx       # Site footer with links
│   └── index.ts         # Central exports
└── app/
    └── layout.tsx       # Root layout with metadata
```

---

## 🎯 Header Component

**File:** `src/components/layout/Header.tsx`

### Features

- ✅ **Client Component** - Uses `"use client"` for interactivity
- ✅ **Sticky Positioning** - Stays at top on scroll
- ✅ **Backdrop Blur** - Modern glassmorphism effect
- ✅ **Logo with Icon** - Trophy icon from lucide-react
- ✅ **Navigation Links** - Contest and Archive
- ✅ **Active Route Highlighting** - Uses `usePathname`
- ✅ **Responsive Design** - Mobile and desktop layouts
- ✅ **Smooth Transitions** - Hover effects and animations

### Code

```tsx
"use client";

import { Trophy } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export const Header: React.FC = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Trophy className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">AI Art Arena</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center space-x-6">
          <Link href="/contest">Contest</Link>
          <Link href="/archive">Archive</Link>
        </nav>
      </div>
    </header>
  );
};
```

### Visual Structure

```
┌─────────────────────────────────────────────────────────┐
│  [Trophy] AI Art Arena        Contest  |  Archive      │
└─────────────────────────────────────────────────────────┘
```

### Active State

The header automatically highlights the active route:

```tsx
const isActive = (path: string): boolean => {
  if (path === ROUTES.home) {
    return pathname === path;
  }
  return pathname.startsWith(path);
};
```

- Active link: `text-foreground` (full opacity)
- Inactive link: `text-muted-foreground` (reduced opacity)

### Responsive Behavior

**Desktop (md and above):**
- Full navigation with proper spacing
- Links in horizontal layout

**Mobile (below md):**
- Compact spacing
- Maintained horizontal layout for simplicity

---

## 🔻 Footer Component

**File:** `src/components/layout/Footer.tsx`

### Features

- ✅ **Three Column Grid** - About, Navigation, Connect
- ✅ **Responsive Layout** - Stacks on mobile
- ✅ **About Section** - Site description
- ✅ **Navigation Links** - Quick access to main pages
- ✅ **Social Media Icons** - GitHub and Twitter with lucide-react
- ✅ **Copyright Notice** - Dynamic year
- ✅ **Author Credit** - Links to creator

### Code

```tsx
import { Github, Twitter } from "lucide-react";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        {/* Three Column Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* About */}
          <div>
            <h3>AI Art Arena</h3>
            <p>Weekly AI Art voting contest...</p>
          </div>

          {/* Navigation */}
          <div>
            <h3>Navigation</h3>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/contest">Contest</Link></li>
              <li><Link href="/archive">Archive</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3>Connect</h3>
            <a href="..."><Github /></a>
            <a href="..."><Twitter /></a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t pt-8">
          <p>&copy; {currentYear} AI Art Arena</p>
        </div>
      </div>
    </footer>
  );
};
```

### Visual Structure

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  AI Art Arena      Navigation       Connect             │
│  Weekly AI Art     • Home           [GitHub] [Twitter]  │
│  voting contest    • Contest        Follow us for       │
│  Vote for your     • Archive        updates             │
│  favorite...                                            │
│                                                          │
│  ─────────────────────────────────────────────────────  │
│                                                          │
│  © 2025 AI Art Arena    Built by olliedoesis           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Responsive Grid

**Desktop (md and above):**
```
[ About ] [ Navigation ] [ Connect ]
```

**Mobile (below md):**
```
[ About       ]
[ Navigation  ]
[ Connect     ]
```

---

## 📄 Root Layout

**File:** `src/app/layout.tsx`

### Features

- ✅ **Complete Metadata** - Title, description, OG tags
- ✅ **SEO Optimized** - Keywords, authors, creator
- ✅ **Open Graph** - Social media sharing
- ✅ **Twitter Cards** - Rich Twitter previews
- ✅ **Geist Fonts** - Sans and Mono
- ✅ **Header & Footer** - Integrated layout structure
- ✅ **Flex Layout** - Sticky footer with min-height
- ✅ **Hydration Safe** - `suppressHydrationWarning`

### Code

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SITE_CONFIG } from "@/lib/constants";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: SITE_CONFIG.name,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: SITE_CONFIG.keywords,
  authors: [
    {
      name: SITE_CONFIG.author,
      url: SITE_CONFIG.social.github,
    },
  ],
  creator: SITE_CONFIG.author,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_CONFIG.url,
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: SITE_CONFIG.ogImage,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.ogImage],
    creator: SITE_CONFIG.social.twitter,
  },
  icons: {
    icon: "/favicon.ico",
  },
  metadataBase: new URL(SITE_CONFIG.url),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
```

### Layout Structure

```
┌─────────────────────────────────────┐
│           Header (sticky)            │
├─────────────────────────────────────┤
│                                      │
│                                      │
│          Main Content                │
│          (flex-1)                    │
│                                      │
│                                      │
├─────────────────────────────────────┤
│           Footer                     │
└─────────────────────────────────────┘
```

### Metadata Configuration

**Title Template:**
- Default: "AI Art Arena"
- Template: "Contest | AI Art Arena"
- Usage: Pages automatically append to site name

**SEO Fields:**
- Description: "Weekly AI Art voting contest..."
- Keywords: AI art, art contest, voting, etc.
- Authors: olliedoesis
- Creator: olliedoesis

**Open Graph:**
- Type: website
- Locale: en_US
- URL: https://olliedoesis.dev
- Image: 1200x630 OG image

**Twitter Card:**
- Type: summary_large_image
- Creator: @olliedoesis
- Image: Same as OG image

---

## 📦 Easy Imports

```tsx
// Import layout components
import { Header, Footer } from "@/components/layout";

// Or import individually
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
```

---

## 🎨 Design System

### Colors Used

- `bg-background` - Main background
- `bg-muted` - Footer background
- `text-foreground` - Primary text
- `text-muted-foreground` - Secondary text
- `text-primary` - Brand color (logo, active links)
- `border-border` - Borders

### Typography

- **Logo:** `text-xl font-bold`
- **Footer Headings:** `text-lg font-semibold`
- **Nav Links:** `text-sm font-medium`
- **Footer Text:** `text-sm text-muted-foreground`

### Spacing

- **Header Height:** `h-16` (64px)
- **Container Padding:** `px-4`
- **Footer Padding:** `py-12` (48px top/bottom)
- **Grid Gap:** `gap-8`

---

## 💡 Usage Examples

### Page Title Override

```tsx
// app/contest/page.tsx
export const metadata = {
  title: "Contest", // Becomes "Contest | AI Art Arena"
};
```

### Custom Social Links

Update `SITE_CONFIG` in `src/lib/constants.ts`:

```typescript
export const SITE_CONFIG = {
  social: {
    twitter: "@yourhandle",
    github: "https://github.com/yourusername",
  },
};
```

### Adding Navigation Links

Edit `Header.tsx`:

```tsx
const navLinks = [
  { href: ROUTES.contest, label: "Contest" },
  { href: ROUTES.archive, label: "Archive" },
  { href: "/about", label: "About" }, // New link
];
```

---

## 🔧 Customization

### Header Styling

```tsx
// Change header height
<header className="h-20"> {/* Instead of h-16 */}

// Remove backdrop blur
<header className="bg-background"> {/* Instead of bg-background/95 backdrop-blur */}

// Change logo size
<Trophy className="h-8 w-8"> {/* Instead of h-6 w-6 */}
```

### Footer Layout

```tsx
// Four columns instead of three
<div className="grid gap-8 md:grid-cols-4">

// Remove social section
// Just delete the third column
```

### Metadata

All metadata is driven by `SITE_CONFIG`:

```typescript
// Update in src/lib/constants.ts
export const SITE_CONFIG = {
  name: "Your App Name",
  description: "Your description",
  url: "https://yoursite.com",
  ogImage: "/your-og-image.jpg",
  // ...
};
```

---

## 🎯 SEO Features

### Structured Metadata

- ✅ Page titles with template
- ✅ Meta description
- ✅ Keywords array
- ✅ Author attribution
- ✅ Canonical URLs

### Social Sharing

- ✅ Open Graph tags (Facebook, LinkedIn)
- ✅ Twitter Card tags
- ✅ OG images (1200x630)
- ✅ Site name and locale

### Technical SEO

- ✅ HTML lang attribute
- ✅ Semantic HTML structure
- ✅ Proper heading hierarchy
- ✅ Mobile responsive
- ✅ Fast loading (optimized fonts)

---

## ♿ Accessibility

### Header

- ✅ Semantic `<header>` element
- ✅ Proper link text
- ✅ Keyboard navigation
- ✅ Focus states

### Footer

- ✅ Semantic `<footer>` element
- ✅ Heading structure (h3)
- ✅ List semantics for navigation
- ✅ `aria-label` for social icons
- ✅ `rel="noopener noreferrer"` for external links

### Links

- ✅ `target="_blank"` with security
- ✅ Clear hover states
- ✅ Proper contrast ratios

---

## 📊 Component Stats

| Component | Type | Lines | Features |
|-----------|------|-------|----------|
| Header | Client | ~65 | Sticky, navigation, active state |
| Footer | Server | ~110 | 3 columns, social, copyright |
| Layout | Server | ~80 | Metadata, structure, fonts |

**Total:** ~255 lines, 3 files

---

## ✅ Checklist

- [x] Header with sticky positioning
- [x] Logo with Trophy icon
- [x] Navigation with active highlighting
- [x] Footer with three columns
- [x] Social media links
- [x] Dynamic copyright year
- [x] Complete metadata configuration
- [x] Open Graph tags
- [x] Twitter Card tags
- [x] Responsive design
- [x] Accessibility features
- [x] TypeScript compilation passes

---

**Layout system complete and production-ready!** 🚀
