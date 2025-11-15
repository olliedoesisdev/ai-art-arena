# 🎨 UI Components Documentation

**AI Art Arena - Reusable UI Primitives**

Complete library of accessible, typed, and styled components.

---

## 📂 Component Library

```
src/components/ui/
├── Button.tsx       # Button with variants and loading states
├── Card.tsx         # Card container with sections
├── Badge.tsx        # Status badges and labels
├── Skeleton.tsx     # Loading placeholders
├── Modal.tsx        # Accessible modal dialogs
└── index.ts         # Central exports
```

---

## 🔘 Button Component

### Features
- ✅ 4 variants: `primary`, `secondary`, `outline`, `ghost`
- ✅ 3 sizes: `sm`, `md`, `lg`
- ✅ Loading state with spinner
- ✅ Disabled state
- ✅ Full width option
- ✅ `forwardRef` support

### Props

```typescript
interface ButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}
```

### Usage Examples

```tsx
import { Button } from "@/components/ui";

// Primary button
<Button variant="primary" size="md">
  Click me
</Button>

// Loading state
<Button variant="secondary" isLoading>
  Submitting...
</Button>

// Full width outline button
<Button variant="outline" fullWidth>
  Sign In
</Button>

// Ghost button (subtle)
<Button variant="ghost" size="sm">
  Cancel
</Button>

// Disabled button
<Button disabled>
  Not Available
</Button>
```

### Visual Preview

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Primary   │  │  Secondary  │  │   Outline   │  │    Ghost    │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

---

## 📇 Card Component

### Features
- ✅ Container with border and shadow
- ✅ Optional hover effect
- ✅ 5 subcomponents: Header, Title, Description, Content, Footer
- ✅ All use `forwardRef`
- ✅ Flexible composition

### Components

```typescript
Card           // Main container
CardHeader     // Header section
CardTitle      // Title heading (h1-h6)
CardDescription // Subtitle text
CardContent    // Main content area
CardFooter     // Footer section
```

### Usage Examples

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button
} from "@/components/ui";

// Complete card
<Card hover>
  <CardHeader>
    <CardTitle as="h2">Artwork Title</CardTitle>
    <CardDescription>By Artist Name</CardDescription>
  </CardHeader>
  <CardContent>
    <img src="artwork.jpg" alt="Artwork" />
  </CardContent>
  <CardFooter>
    <Button>View Details</Button>
  </CardFooter>
</Card>

// Simple card
<Card>
  <CardContent>
    <p>Simple content card</p>
  </CardContent>
</Card>
```

### Card Structure

```
┌──────────────────────────┐
│  CardHeader              │
│  ┌────────────────────┐  │
│  │ CardTitle          │  │
│  │ CardDescription    │  │
│  └────────────────────┘  │
├──────────────────────────┤
│  CardContent             │
│                          │
│  Main content here       │
│                          │
├──────────────────────────┤
│  CardFooter              │
│  [Button] [Button]       │
└──────────────────────────┘
```

---

## 🏷️ Badge Component

### Features
- ✅ 5 variants: `default`, `primary`, `success`, `warning`, `destructive`
- ✅ Small, rounded pill design
- ✅ Hover effects
- ✅ `forwardRef` support

### Props

```typescript
interface BadgeProps {
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
  children: React.ReactNode;
  className?: string;
}
```

### Usage Examples

```tsx
import { Badge } from "@/components/ui";

// Status badges
<Badge variant="primary">New</Badge>
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="destructive">Ended</Badge>
<Badge variant="default">Draft</Badge>

// Vote count badge
<Badge variant="primary">{voteCount} votes</Badge>

// Week number badge
<Badge>Week {weekNumber}</Badge>
```

### Visual Preview

```
┌───────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐
│ New   │ │ Active  │ │ Pending │ │  Ended  │ │   Default   │
└───────┘ └─────────┘ └─────────┘ └─────────┘ └─────────────┘
Primary   Success     Warning     Destructive   Default
```

---

## 💀 Skeleton Components

### Features
- ✅ Generic `Skeleton` component
- ✅ `ArtworkSkeleton` - Artwork card placeholder
- ✅ `ContestGridSkeleton` - Grid of 6 artworks
- ✅ `TextSkeleton` - Multi-line text placeholder
- ✅ `ImageSkeleton` - Image with aspect ratios
- ✅ Pulse animation
- ✅ All use `forwardRef`

### Components

```typescript
Skeleton              // Generic skeleton
ArtworkSkeleton       // Artwork card shape
ContestGridSkeleton   // 6-artwork grid
TextSkeleton          // Multiple text lines
ImageSkeleton         // Image with aspect ratio
```

### Usage Examples

```tsx
import {
  Skeleton,
  ArtworkSkeleton,
  ContestGridSkeleton,
  TextSkeleton,
  ImageSkeleton
} from "@/components/ui";

// Generic shapes
<Skeleton className="h-12 w-12 rounded-full" />
<Skeleton className="h-4 w-[250px]" />
<Skeleton className="h-8 w-full" />

// Artwork card skeleton
<ArtworkSkeleton />

// Full contest grid (6 cards)
<ContestGridSkeleton />

// Partial grid (3 cards)
<ContestGridSkeleton count={3} />

// Text placeholder
<TextSkeleton lines={4} />

// Image with aspect ratio
<ImageSkeleton aspectRatio="square" />
<ImageSkeleton aspectRatio="video" />
<ImageSkeleton aspectRatio="portrait" />
```

### ArtworkSkeleton Structure

```
┌──────────────────┐
│                  │
│  [Image Box]     │
│                  │
├──────────────────┤
│ ████████         │ <- Title
│ █████            │ <- Description
├──────────────────┤
│ ███    [Button]  │ <- Vote count & button
└──────────────────┘
```

---

## 🪟 Modal Component

### Features
- ✅ Portal rendering (outside root DOM)
- ✅ Backdrop with blur effect
- ✅ Close on ESC key
- ✅ Close on backdrop click (optional)
- ✅ 4 sizes: `sm`, `md`, `lg`, `xl`
- ✅ Prevent body scroll when open
- ✅ Accessibility (ARIA attributes)
- ✅ Client component (use client)
- ✅ Animation on open/close

### Props

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  title?: string;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}
```

### Subcomponents

```typescript
ModalHeader       // Header section
ModalTitle        // Title heading
ModalDescription  // Description text
ModalFooter       // Footer with actions
```

### Usage Examples

```tsx
"use client";

import { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  Button
} from "@/components/ui";

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Open Modal
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Artwork Details"
        size="md"
      >
        <p>Modal content here...</p>
      </Modal>
    </>
  );
}

// Advanced usage with subcomponents
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  size="lg"
  closeOnBackdrop={false}
>
  <ModalHeader>
    <ModalTitle>Confirm Vote</ModalTitle>
    <ModalDescription>
      Are you sure you want to vote for this artwork?
    </ModalDescription>
  </ModalHeader>

  <div className="py-4">
    <img src={artwork.image_url} alt={artwork.title} />
  </div>

  <ModalFooter>
    <Button variant="outline" onClick={() => setIsOpen(false)}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handleVote}>
      Confirm Vote
    </Button>
  </ModalFooter>
</Modal>
```

### Modal Sizes

```
sm: 28rem (448px)
md: 32rem (512px)
lg: 42rem (672px)
xl: 56rem (896px)
```

### Accessibility Features

- ✅ `role="dialog"`
- ✅ `aria-modal="true"`
- ✅ `aria-labelledby` for title
- ✅ Focus trap
- ✅ ESC key handling
- ✅ Keyboard navigation

---

## 📦 Easy Imports

All components export from a single location:

```tsx
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Badge,
  Skeleton,
  ArtworkSkeleton,
  ContestGridSkeleton,
  Modal,
  ModalHeader,
  ModalFooter
} from "@/components/ui";
```

---

## 💡 Common Patterns

### Artwork Card with Loading

```tsx
import { Card, CardContent, Skeleton, Button } from "@/components/ui";

function ArtworkCard({ artwork, isLoading }) {
  if (isLoading) {
    return <ArtworkSkeleton />;
  }

  return (
    <Card hover>
      <CardContent>
        <img src={artwork.image_url} alt={artwork.title} />
        <h3>{artwork.title}</h3>
        <Button>Vote</Button>
      </CardContent>
    </Card>
  );
}
```

### Modal with Confirmation

```tsx
"use client";

import { useState } from "react";
import { Modal, ModalFooter, Button } from "@/components/ui";

function VoteConfirmation({ artwork, onConfirm }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm(artwork.id);
    setIsOpen(false);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Vote</Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm Your Vote"
        size="md"
      >
        <p>Vote for "{artwork.title}"?</p>

        <ModalFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            Confirm
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
```

### Status Badge Display

```tsx
import { Badge } from "@/components/ui";

function ContestStatus({ status, endDate }) {
  const isActive = status === "active";
  const hasEnded = new Date() > new Date(endDate);

  return (
    <Badge variant={isActive && !hasEnded ? "success" : "destructive"}>
      {isActive && !hasEnded ? "Active" : "Ended"}
    </Badge>
  );
}
```

---

## 🎨 Styling Customization

All components support the `className` prop for custom styling:

```tsx
// Custom button
<Button
  className="shadow-lg hover:shadow-xl"
  variant="primary"
>
  Custom Styled
</Button>

// Custom card
<Card className="border-2 border-primary">
  <CardContent className="bg-muted/50">
    Custom content
  </CardContent>
</Card>

// Custom badge
<Badge className="text-lg px-4 py-2" variant="primary">
  Large Badge
</Badge>
```

---

## 🔧 TypeScript Support

All components are fully typed with exported interfaces:

```tsx
import type {
  ButtonProps,
  CardProps,
  BadgeProps,
  ModalProps,
  SkeletonProps
} from "@/components/ui";

// Use in your components
const MyButton: React.FC<ButtonProps> = (props) => {
  return <Button {...props} />;
};
```

---

## ✅ Component Checklist

| Component | Variants | Sizes | States | forwardRef | Client |
|-----------|----------|-------|--------|------------|--------|
| Button | ✅ 4 | ✅ 3 | ✅ Yes | ✅ | - |
| Card | - | - | ✅ Hover | ✅ | - |
| Badge | ✅ 5 | - | ✅ Hover | ✅ | - |
| Skeleton | ✅ 5 types | - | ✅ Pulse | ✅ | - |
| Modal | - | ✅ 4 | ✅ Open | - | ✅ |

---

## 🎯 Best Practices

1. **Always use `cn()` for class merging**
   ```tsx
   className={cn("base-class", conditionalClass, className)}
   ```

2. **Forward refs for flexibility**
   ```tsx
   const Component = React.forwardRef<HTMLElement, Props>((props, ref) => {
     return <div ref={ref} {...props} />;
   });
   ```

3. **Destructure props properly**
   ```tsx
   const { variant = "primary", ...rest } = props;
   ```

4. **Use semantic HTML**
   ```tsx
   <CardTitle as="h2">Title</CardTitle>  // Not just <div>
   ```

5. **Client components when needed**
   ```tsx
   "use client";  // For Modal, interactive components
   ```

---

**All UI components are production-ready!** 🚀
