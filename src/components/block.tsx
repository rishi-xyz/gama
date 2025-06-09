"use client";

import { useEffect, useState } from "react";
import { Highlight } from "./ui/hero-highlight";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { MoveLeftIcon } from "lucide-react";
import { toast } from "sonner";
import { UIstate } from "../lib/types";

export const Block = ({ initialState }: { initialState: UIstate }) => {
    console.log(initialState);
    const [uiState, setUiState] = useState<UIstate>(initialState || "initial");
    useEffect(() => {
        document.cookie = `ui:state=${uiState}; path=/; max-age=${60 * 60 * 24 * 7}`;
    }, [uiState]);
    const generateWallet = (num: number) => {
    }
    return (
        <>
            {uiState === "initial" && (
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: [20, -5, 0] }}
                    transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
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
                            size={"lg"}
                            onClick={() => {
                                toast("Creating a new wallet");
                                setUiState("selectMnemonic");
                            }}
                        >
                            Create A Wallet
                        </Button>
                        <Button
                            className="rounded-2xl hover:bg-black hover:text-white"
                            size={"lg"}
                        >
                            Import a Wallet
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
                        <h2 className="text-xl ">Choose Mnemonic Length:</h2>
                        <div className="flex gap-8">
                            <Button
                                onClick={() => {
                                    generateWallet(12);
                                    toast("Generating 12 words Mnemonic");
                                }}
                                className="bg-white text-black hover:bg-gray-200/30"
                            >
                                12 Words
                            </Button>
                            <Button
                                onClick={() => {
                                    generateWallet(24)
                                    toast("Generating 24 words Mnemonic");
                                }}
                                className="bg-white text-black hover:bg-gray-200/30"
                            >
                                24 Words
                            </Button>
                        </div>
                    </div>

                </motion.div>
            )}
        </>
    );
}