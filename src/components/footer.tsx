import Link from "next/link";

export const Footer = () => {
    return (
        <footer className="w-full sticky bottom-0 backdrop-blur-sm border-t border-white/50 text-white">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between text-sm">
                <div>
                    <span>Developed by </span>
                    <Link 
                    href={"https://hrishikesh-rana.vercel.app/"}
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="font-bold"
                    >
                        Hrishikesh Rana
                    </Link>
                </div>
                <Link
                    href="https://github.com/rishi-xyz/gama"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/50 hover:text-white transition"
                >
                    Source Code
                </Link>
            </div>
        </footer>
    );
};
