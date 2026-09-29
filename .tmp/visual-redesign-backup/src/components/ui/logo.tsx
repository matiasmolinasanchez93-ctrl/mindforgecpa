import Link from "next/link";
import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

interface LogoProps {
  className?: string;
  link?: boolean;
}

export function Logo({ className, link = true }: LogoProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm">
        <Brain className="h-4 w-4" aria-hidden />
      </span>
      <span className="text-lg font-semibold tracking-tight">{APP_NAME}</span>
    </span>
  );

  if (!link) return content;
  return <Link href="/">{content}</Link>;
}
