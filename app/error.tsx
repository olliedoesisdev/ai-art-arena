"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-purple-light mb-4">
          Error
        </p>
        <h1 className="font-sans font-extrabold text-3xl text-text tracking-[-0.03em] mb-3">
          Something went wrong
        </h1>
        <p className="text-sm text-text-muted leading-relaxed mb-8">
          An unexpected error occurred. If this keeps happening, please refresh the page.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-purple text-white text-sm font-bold px-6 py-3 rounded-pill hover:bg-purple-light transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
