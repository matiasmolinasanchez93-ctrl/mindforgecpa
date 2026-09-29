import { ArrowUpRight, Check } from "lucide-react";

export function LearningArt() {
  return <div className="learning-art" aria-hidden="true">
    <div className="learning-sheet">
      <div className="flex items-center justify-between text-primary"><span className="!m-0 !h-7 !w-7 !bg-primary/10" /><ArrowUpRight size={24} /></div>
      <p className="mt-5 text-xl font-semibold tracking-tight">Piensa.<br />Prueba. Crece.</p>
      <span /><span className="!w-3/4" /><span className="!w-1/2 !bg-primary/20" />
    </div>
    <div className="learning-seal"><Check size={24} strokeWidth={2.5} /></div>
  </div>;
}
