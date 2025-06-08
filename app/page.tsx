import { Footer } from "@/src/components/footer";
import { Navbar } from "@/src/components/navbar";

export default function Home() {
  return (
    <div className="min-h-screen min-w-screen">
      <Navbar />
      <div className="min-h-screen min-w-screen overflow-clip">
        wallet
      </div>
      <Footer />
    </div>
  );
}
