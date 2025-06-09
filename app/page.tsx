import { cookies } from "next/headers";
import { HeroHighlight } from "@/src/components/ui/hero-highlight";
import { UIstate } from "@/src/lib/types";
import { Block } from "@/src/components/block";



export default function HomePage() {
  return (
    <HeroHighlight>
      <Block />
    </HeroHighlight>
  );
}
