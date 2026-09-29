import Image from "next/image";
import { cn } from "@/lib/utils";

export function SchoolLogo({ className }: { className?: string }) {
  return <div className={cn("rounded-lg bg-white p-3", className)}>
    <Image src="/images/colegio-principe-de-asturias.png" alt="Colegio Español de Guatemala Príncipe de Asturias" width={4687} height={1120} sizes="(max-width: 767px) 280px, 340px" className="h-auto w-full object-contain" />
  </div>;
}
