import { createFileRoute } from "@tanstack/react-router";

// The full SPA is mounted in __root.tsx via react-router-dom.
// This file exists only to satisfy TanStack's routing requirement.
export const Route = createFileRoute("/")({
  component: () => null,
});
