import { HeroHighlight } from "@/src/components/ui/hero-highlight";
import { Block } from "@/src/components/block";
import { Footer } from "@/src/components/footer";



export default function HomePage() {
  return (
    <>
    <HeroHighlight>
      <Block />
    </HeroHighlight>
    <Footer />
    </>
  );
}
