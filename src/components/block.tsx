"use client";

import { useState } from "react";
import { Highlight } from "./ui/hero-highlight";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { MoveLeftIcon } from "lucide-react";
import { toast } from "sonner";
import * as bip39 from "bip39";
import { Keypair } from "@solana/web3.js";
import { HDNodeWallet } from "ethers";
import { UIstate } from "../lib/types";

export const Block = () => {
    const [uiState, setUiState] = useState<UIstate>("initial");
    const [mnemonic, setMnemonic] = useState<Array<string> | null>(null);
    const [walletData, setWalletData] = useState<null | {
        eth: { publicKey: string; privateKey: string };
        sol: { publicKey: string; privateKey: string };
    }>(null);
    const [revealed, setRevealed] = useState<{ eth: boolean; sol: boolean }>({
        eth: false,
        sol: false,
    });

    const generateMnemonic = (num: number) => {
        toast("Generating Mnemonic");
        const strength = num === 12 ? 128 : 256;
        const mne = bip39.generateMnemonic(strength);
        // Fix: Split the mnemonic string into an array
        setMnemonic(mne.split(' '));
        setUiState("showMnemonic");
    };

    const deriveWallets = async () => {
        if (!mnemonic) return;
        try {
            toast("Deriving wallet addresses...");
            // Fix: Join the mnemonic array back to a string for wallet derivation
            const mnemonicString = mnemonic.join(' ');
            const ethWallet = HDNodeWallet.fromPhrase(mnemonicString);
            const ethAccount = ethWallet.derivePath("44'/60'/0'/0/0");

            const seed = await bip39.mnemonicToSeed(mnemonicString);
            const solSeed = seed.subarray(0, 32);
            const solKeypair = Keypair.fromSeed(solSeed);

            setWalletData({
                eth: {
                    publicKey: ethAccount.address,
                    privateKey: ethAccount.privateKey,
                },
                sol: {
                    publicKey: solKeypair.publicKey.toBase58(),
                    privateKey: Buffer.from(solKeypair.secretKey).toString("hex"),
                },
            });
            setUiState("showWallets");
        } catch (error) {
            toast.error("Error deriving wallets", {
                description: `${error}`,
            });
        }
    };

    const revealAndCopy = (field: keyof typeof revealed, value: string) => {
        setRevealed((prev) => ({ ...prev, [field]: true }));
        navigator.clipboard.writeText(value);
        toast.success("Copied to clipboard");
    };

    const copyWordToClipboard = (word: string, index: number) => {
        navigator.clipboard.writeText(word);
        toast.success(`Word ${index + 1} copied to clipboard`);
    };

    return (
        <>
            {uiState === "initial" && (
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: [20, -5, 0] }}
                    transition={{ duration: 0.5 }}
                    className="font-bold text-white max-w-4xl leading-relaxed lg:leading-snug text-center flex flex-col items-center justify-between gap-4"
                >
                    <div className="text-2xl md:text-4xl lg:text-5xl">
                        Your Web3 journey{" "}
                        <Highlight className="inline-block w-full text-white font-serif">
                            Starts here
                        </Highlight>
                    </div>
                    <div className="mt-20 flex justify-center items-center gap-x-20">
                        <Button
                            className="rounded-2xl hover:bg-black hover:text-white"
                            size="lg"
                            onClick={() => setUiState("selectMnemonic")}
                        >
                            Create A Wallet
                        </Button>
                    </div>
                </motion.h1>
            )}
            {uiState === "selectMnemonic" && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="bg-black text-white w-full h-full flex flex-col justify-center items-center rounded-xl p-10 gap-2"
                >
                    <div className="flex items-start justify-start w-full mb-5">
                        <Button
                            onClick={() => setUiState("initial")}
                            className="bg-white text-black hover:bg-gray-200/30"
                        >
                            <MoveLeftIcon />
                        </Button>
                    </div>
                    <div className="flex items-center justify-center gap-x-4">
                        <h2 className="text-xl">Choose Mnemonic Length:</h2>
                        <div className="flex gap-8">
                            <Button
                                onClick={() => generateMnemonic(12)}
                                className="bg-white text-black hover:bg-gray-200/30"
                            >
                                12 Words
                            </Button>
                            <Button
                                onClick={() => generateMnemonic(24)}
                                className="bg-white text-black hover:bg-gray-200/30"
                            >
                                24 Words
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
            {uiState === "showMnemonic" && mnemonic && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="bg-black text-white w-full h-full flex flex-col justify-center items-center rounded-xl p-10 gap-6"
                >
                    <div className="flex items-start justify-start w-full mb-5">
                        <Button
                            onClick={() => setUiState("selectMnemonic")}
                            className="bg-white text-black hover:bg-gray-200/30"
                        >
                            <MoveLeftIcon />
                        </Button>
                    </div>
                    
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold mb-2">Your Recovery Phrase</h2>
                        <p className="text-gray-400 text-sm">
                            Write down these words in order and keep them safe. 
                            Hover to reveal, click to copy each word.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-4xl w-full">
                        {mnemonic.map((word, index) => (
                            <MnemonicWordBox
                                key={index}
                                word={word}
                                index={index}
                                onCopy={() => copyWordToClipboard(word, index)}
                            />
                        ))}
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-yellow-400 text-sm mb-4 font-semibold">
                            ⚠️ Store this phrase securely. Anyone with access can control your wallet.
                        </p>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                            onClick={deriveWallets}
                        >
                            I've Saved My Recovery Phrase - Continue
                        </Button>
                    </div>
                </motion.div>
            )}
            {uiState === "showWallets" && walletData && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="bg-black text-white w-full h-full flex flex-col justify-center items-center rounded-xl p-10 gap-6"
                >
                    <div className="flex items-start justify-start w-full mb-5">
                        <Button
                            onClick={() => setUiState("showMnemonic")}
                            className="bg-white text-black hover:bg-gray-200/30"
                        >
                            <MoveLeftIcon />
                        </Button>
                    </div>

                    <MnemonicBlock
                        label="Ethereum Address"
                        value={walletData.eth.publicKey}
                        revealed={revealed.eth}
                        onReveal={() => revealAndCopy("eth", walletData.eth.publicKey)}
                    />
                    <MnemonicBlock
                        label="Ethereum Private Key"
                        value={walletData.eth.privateKey}
                        revealed={revealed.eth}
                        onReveal={() => revealAndCopy("eth", walletData.eth.privateKey)}
                    />
                    <MnemonicBlock
                        label="Solana Address"
                        value={walletData.sol.publicKey}
                        revealed={revealed.sol}
                        onReveal={() => revealAndCopy("sol", walletData.sol.publicKey)}
                    />
                    <MnemonicBlock
                        label="Solana Private Key"
                        value={walletData.sol.privateKey}
                        revealed={revealed.sol}
                        onReveal={() => revealAndCopy("sol", walletData.sol.privateKey)}
                    />
                </motion.div>
            )}
        </>
    );
};

const MnemonicWordBox = ({
    word,
    index,
    onCopy,
}: {
    word: string;
    index: number;
    onCopy: () => void;
}) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            className="relative group cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onCopy}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <div className="relative overflow-hidden rounded-lg border border-gray-700 bg-gray-900/50 backdrop-blur-sm transition-all duration-300 hover:border-blue-500">
                <div 
                    className={`absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 transition-opacity duration-300 ${
                        isHovered ? 'opacity-100' : 'opacity-0'
                    }`}
                />
                <div 
                    className={`absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent translate-x-[-100%] transition-transform duration-700 ${
                        isHovered ? 'translate-x-[100%]' : ''
                    }`}
                />

                <div className="relative z-10 p-4 text-center">
                    <div className="text-xs text-gray-400 mb-1">{index + 1}</div>
                    <div 
                        className={`font-mono text-sm transition-all duration-300 ${
                            isHovered ? 'text-white blur-none' : 'text-gray-500 blur-sm'
                        }`}
                    >
                        {isHovered ? word : '••••••'}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const MnemonicBlock = ({
    label,
    value,
    revealed,
    onReveal,
}: {
    label: string;
    value: string;
    revealed: boolean;
    onReveal: () => void;
}) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            className="relative group cursor-pointer w-full max-w-xl mx-auto"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onReveal}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="relative overflow-hidden rounded-2xl border border-gray-700 bg-gray-900/50 backdrop-blur-sm transition-all duration-300 hover:border-blue-500 shadow-lg">
                <div 
                    className={`absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 transition-opacity duration-300 ${
                        isHovered ? 'opacity-100' : 'opacity-0'
                    }`}
                />
                <div 
                    className={`absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent translate-x-[-100%] transition-transform duration-700 ${
                        isHovered ? 'translate-x-[100%]' : ''
                    }`}
                />

                <div className="relative z-10 px-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-400 font-medium">{label}</p>
                        <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                            revealed ? 'bg-green-400' : 'bg-gray-600'
                        }`} />
                    </div>
                    
                    <p className={`font-mono break-all text-lg transition-all duration-300 ${
                        revealed ? 'text-white blur-none' : 'text-gray-500 blur-sm'
                    }`}>
                        {revealed ? value : "••••••••••••••••••••••••••••••••••••••••••••••••••••"}
                    </p>
                    
                    <div className="flex items-center justify-between mt-3">
                        <p className={`text-xs transition-opacity duration-300 ${
                            revealed ? 'text-green-400' : 'text-gray-500'
                        }`}>
                            {revealed ? 'Revealed & Copied' : 'Click to reveal & copy'}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};