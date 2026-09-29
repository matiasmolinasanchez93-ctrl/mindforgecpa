import React from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { ChallengesView } from "../src/components/challenges/challenges-view";
window.fetch = async (input, init) => {
  await new Promise(r => setTimeout(r, 350));
  const url = String(input);
  if (url.includes("?")) {
    const free = url.includes("explain_it") || url.includes("prompt_battle");
    return Response.json({title:"El misterio del invernadero",description:"Una misión de biología. Observa, decide y descubre.",content:"Dos plantas reciben la misma agua. Una está junto a la ventana y otra dentro de una caja oscura. ¿Cuál puede realizar la fotosíntesis?",options:free?[]:["La planta junto a la ventana","La planta de la caja","Ambas por igual","Ninguna"],hints:["Piensa en la fuente de energía.","Las plantas necesitan luz.","La ventana deja pasar la luz."],xpBase:35,ticket:"fixture"});
  }
  const body=JSON.parse(String(init?.body));
  if ((window as any).failEvaluation) return Response.json({error:"No se pudo evaluar. Intenta de nuevo."},{status:503});
  const correct=body.answer==="La planta junto a la ventana";
  return Response.json({score:correct?100:20,correct,feedback:correct?"¡Exacto! La luz permite transformar agua y dióxido de carbono en alimento.":"La planta necesita luz solar. Revisa la pista y vuelve a intentarlo.",correctAnswer:"La planta junto a la ventana",explanation:"La luz proporciona la energía para la fotosíntesis.",saved:true,attempt:{xp_earned:correct?35:7}});
};
createRoot(document.getElementById("root")!).render(<main className="mx-auto max-w-5xl p-5 sm:p-10"><ChallengesView/><Toaster/></main>);
