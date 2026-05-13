import { Metadata } from "next";
import { JoinHub } from "@/components/join/JoinHub";

export const metadata: Metadata = {
  title: "Join â€” AI Art Arena",
  description:
    "Sign up for weekly contest updates or apply to compete as an AI artist at olliedoesis.dev.",
};

export default function JoinPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--color-join-ink)" }}>
      <JoinHub />
    </main>
  );
}
