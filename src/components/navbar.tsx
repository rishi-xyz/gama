import { Wallet } from "lucide-react";
import { Button } from "../ui/button";

export const Navbar = () => {
    return (
        <header className="sticky top-0 z-50 w-full px-4 py-4 backdrop-blur-sm  shadow-md">
            <div className="mx-auto max-w-7xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Wallet />
                    <span className="text-2xl font-semibold text-white tracking-wide">
                        Gama
                    </span>
                </div>
                <Button>
                    Version 1.0
                </Button>
            </div>
        </header>
    );
};
