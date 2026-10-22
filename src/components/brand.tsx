import { Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";

export function Logo({ to = "/" }: { to?: "/" | "/dashboard" }) {
  return (
    <Link to={to} className="flex items-center gap-2 font-semibold text-foreground">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Zap className="size-4 fill-accent text-accent" />
      </span>
      <span className="text-lg tracking-tight">Impulso</span>
    </Link>
  );
}
