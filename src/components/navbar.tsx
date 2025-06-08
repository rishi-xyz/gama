import Image from "next/image";
import WalletIcon from "@/public/wallet.png";

export const Navbar = () => {
    return (
        <header className="sticky top-0 z-50 w-full px-4 py-4 backdrop-blur-sm border-b border-white/50 shadow-md">
            <div className="mx-auto max-w-7xl flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 hover:bg-white p-2 rounded-full shadow-sm backdrop-blur-md">
                        <Image
                            src={WalletIcon}
                            alt="Wallet"
                            height={40}
                            width={40}
                        />
                    </div>
                    <span className="text-2xl font-semibold text-white tracking-wide">
                        Gama Wallet
                    </span>
                </div>
            </div>
        </header>
    );
};
