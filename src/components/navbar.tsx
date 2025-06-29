import { Wallet } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

export const Navbar = () => {
    return (
        <header className="sticky top-0 z-50 w-full px-4 py-4 backdrop-blur-sm  shadow-md">
            <div className="mx-auto max-w-7xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Wallet />
                    <Link href={"/"} className="text-2xl font-semibold text-white tracking-wide">
                        Gama
                    </Link>
                </div>
                <div className="flex items-center justify-center gap-x-3">
                    <Link href={"/encrypt"}>
                        <Button>
                            Encrypt
                        </Button>
                    </Link>
                    <Link href={"/decrypt"}>
                        <Button>
                            Decrypt
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
};
