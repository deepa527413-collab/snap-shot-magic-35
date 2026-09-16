import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/students/$id")({
  component: () => <Outlet />,
});
