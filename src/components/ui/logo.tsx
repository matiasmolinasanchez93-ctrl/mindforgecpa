import Link from "next/link";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
export function Logo({ className, link = true }: { className?: string; link?: boolean }) {
  const content = <span className={cn("inline-flex items-center gap-2.5",className)}><span aria-hidden="true" className="relative grid h-8 w-8 grid-cols-2 gap-[3px] rounded-lg bg-primary p-[7px]"><span className="rounded-[1px] bg-white" /><span className="rounded-[1px] bg-achievement" /><span className="rounded-[1px] bg-white" /><span className="rounded-[1px] bg-white/40" /><span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-white bg-ai" /></span><span className="text-lg font-semibold tracking-[-.045em] text-foreground">{APP_NAME}<span className="text-ai">.</span></span></span>;
  return link ? <Link href="/" aria-label={`${APP_NAME} home`}>{content}</Link> : content;
}
