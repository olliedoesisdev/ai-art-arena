// components/contest/ThemeBadge.tsx [SERVER]

interface ThemeBadgeProps {
  theme: string | null | undefined;
}

export function ThemeBadge({ theme }: ThemeBadgeProps) {
  if (!theme) return null;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--color-purple-light)",
        background: "var(--color-purple-dim)",
        border: "1px solid rgba(139,92,246,0.25)",
        padding: "3px 10px",
        borderRadius: "100px",
      }}
    >
      {theme}
    </span>
  );
}
