import { cookies } from "next/headers";
import { HeroHighlight } from "@/src/components/ui/hero-highlight";
import { UIstate } from "@/src/lib/types";
import { Block } from "@/src/components/block";

const states: UIstate[] = [
  "initial",
  "selectMnemonic",
  "showMnemonic",
  "showWallets"
]

export default async function HomePage() {
  const cookieStore = await cookies();
  const cookieState = cookieStore.get("ui:state")?.value;
  const initialState = states.find((st) => st === cookieState) || "initial";
  return (
    <HeroHighlight>
      <Block initialState={initialState} />
    </HeroHighlight>
  );
}
