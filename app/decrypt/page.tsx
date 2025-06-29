"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/src/ui/button";
import { Input } from "@/src/ui/input";
import { Label } from "@/src/ui/label";
import CryptoJS from 'crypto-js';
import { Eye, EyeClosed, NotepadText } from "lucide-react";

// Decryption function matching the encryption implementation
const decryptData = (encryptedData: any, password: string) => {
    try {
        const { ciphertext, salt, iv, hmac } = encryptedData;

        // Derive the same key using stored salt
        const key = CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(salt), {
            keySize: 256 / 32,
            iterations: 100000,
            hasher: CryptoJS.algo.SHA256
        });

        // Verify HMAC first (authenticate before decrypt)
        const computedHmac = CryptoJS.HmacSHA256(ciphertext, key);
        if (computedHmac.toString() !== hmac) {
            throw new Error('Invalid password or corrupted data');
        }

        // Decrypt
        const decrypted = CryptoJS.AES.decrypt(
            { ciphertext: CryptoJS.enc.Hex.parse(ciphertext) } as any,
            key,
            {
                iv: CryptoJS.enc.Hex.parse(iv),
                mode: CryptoJS.mode.CTR,
                padding: CryptoJS.pad.NoPadding
            }
        );

        const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
        if (!decryptedText) {
            throw new Error('Decryption failed - invalid password');
        }

        return decryptedText;
    } catch (error) {
        throw new Error(`Decryption failed: ${error}`);
    }
};

// Parse compact format (colon-separated)
const parseCompactFormat = (compactString: string) => {
    const parts = compactString.split(':');
    if (parts.length !== 4) {
        throw new Error('Invalid compact format. Expected: ciphertext:salt:iv:hmac');
    }

    return {
        ciphertext: parts[0],
        salt: parts[1],
        iv: parts[2],
        hmac: parts[3]
    };
};

// Validate JSON format
const parseJSONFormat = (jsonString: string) => {
    try {
        const parsed = JSON.parse(jsonString);
        if (!parsed.ciphertext || !parsed.salt || !parsed.iv || !parsed.hmac) {
            throw new Error('Missing required fields in JSON format');
        }
        return parsed;
    } catch (error) {
        throw new Error('Invalid JSON format');
    }
};

interface EncryptedData {
    ciphertext: string;
    salt: string;
    iv: string;
    hmac: string;
    timestamp?: number;
    version?: string;
}

export default function DecryptPage() {
    const [step, setStep] = useState<"inputData" | "inputPassword" | "showResult">("inputData");
    const [inputType, setInputType] = useState<"json" | "compact">("json");
    const [encryptedInput, setEncryptedInput] = useState("");
    const [password, setPassword] = useState("");
    const [encryptedData, setEncryptedData] = useState<EncryptedData | null>(null);
    const [decryptedResult, setDecryptedResult] = useState("");
    const [isDecrypting, setIsDecrypting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleParseData = () => {
        if (!encryptedInput.trim()) {
            return toast.error("Please enter encrypted data");
        }

        try {
            let parsedData: EncryptedData;

            if (inputType === "json") {
                parsedData = parseJSONFormat(encryptedInput);
            } else {
                parsedData = parseCompactFormat(encryptedInput);
            }

            setEncryptedData(parsedData);
            setStep("inputPassword");
            toast.success("Encrypted data parsed successfully");
        } catch (error) {
            toast.error("Invalid format", {
                description: error instanceof Error ? error.message : "Please check your input format"
            });
        }
    };

    const handleDecrypt = async () => {
        if (!encryptedData || !password) {
            return toast.error("Missing encrypted data or password");
        }

        setIsDecrypting(true);

        try {
            // Add small delay to show loading state
            await new Promise(resolve => setTimeout(resolve, 500));

            const decrypted = decryptData(encryptedData, password);
            setDecryptedResult(decrypted);
            setStep("showResult");

            toast.success("🔓 Decryption Successful", {
                description: "Your data has been successfully decrypted"
            });
        } catch (error) {
            toast.error("Decryption failed", {
                description: error instanceof Error ? error.message : "Invalid password or corrupted data"
            });
        } finally {
            setIsDecrypting(false);
        }
    };

    const resetFlow = () => {
        setStep("inputData");
        setEncryptedInput("");
        setPassword("");
        setEncryptedData(null);
        setDecryptedResult("");
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    const downloadAsFile = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(`Downloaded as ${filename}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex flex-col justify-center items-center p-6">
            {step === "inputData" && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-lg w-full space-y-6"
                >
                    <div className="text-center space-y-3">
                        <div className="text-6xl mb-4">🔓</div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            Decrypt Your Data
                        </h1>
                        <p className="text-gray-400 text-lg">
                            Enter your encrypted package to recover your data
                        </p>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 space-y-4">
                        <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-300">Input Format</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setInputType("json")}
                                    className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${inputType === "json"
                                            ? "border-blue-500 bg-blue-500/10"
                                            : "border-gray-600 bg-gray-800/30 hover:border-gray-500"
                                        }`}
                                >
                                    <div className="flex flex-col items-center gap-y-2">
                                        <NotepadText className="text-orange-300" />
                                        <span className="text-sm font-medium">JSON Format</span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setInputType("compact")}
                                    className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${inputType === "compact"
                                            ? "border-purple-500 bg-purple-500/10"
                                            : "border-gray-600 bg-gray-800/30 hover:border-gray-500"
                                        }`}
                                >
                                    <div className="text-center">
                                        <span className="text-2xl block mb-1">🗜️</span>
                                        <span className="text-sm font-medium">Compact Format</span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="encryptedData" className="text-sm font-medium text-gray-300">
                                Encrypted Data
                            </Label>
                            <textarea
                                id="encryptedData"
                                placeholder={
                                    inputType === "json"
                                        ? '{\n  "ciphertext": "...",\n  "salt": "...",\n  "iv": "...",\n  "hmac": "..."\n}'
                                        : "ciphertext:salt:iv:hmac"
                                }
                                value={encryptedInput}
                                onChange={(e) => setEncryptedInput(e.target.value)}
                                className="w-full h-40 bg-gray-800/50 border border-gray-600 rounded-2xl p-3 text-white placeholder-gray-500 resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-mono text-sm"
                            />
                            <div className="text-xs text-gray-500">
                                {inputType === "json"
                                    ? "Paste the complete JSON object from the encryption step"
                                    : "Paste the compact format: ciphertext:salt:iv:hmac"
                                }
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleParseData}
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-200 transform hover:scale-[1.02]"
                        disabled={!encryptedInput.trim()}
                    >
                        Parse Encrypted Data
                    </Button>
                </motion.div>
            )}

            {step === "inputPassword" && encryptedData && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-lg w-full space-y-6"
                >
                    <div className="text-center space-y-3">
                        <h1 className="text-3xl font-bold">Enter Password</h1>
                        <p className="text-gray-400">Enter the password used to encrypt this data</p>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 space-y-4">
                        <div className="space-y-3">
                            <Label className="text-xs text-gray-400 uppercase tracking-wide">Encrypted Package Info</Label>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <div className="text-gray-500">Format:</div>
                                    <div className="font-mono text-blue-400">{inputType.toUpperCase()}</div>
                                </div>
                                {encryptedData.timestamp && (
                                    <div className="space-y-1">
                                        <div className="text-gray-500">Created:</div>
                                        <div className="font-mono text-green-400">
                                            {new Date(encryptedData.timestamp).toLocaleDateString()}
                                        </div>
                                    </div>
                                )}
                                {encryptedData.version && (
                                    <div className="space-y-1">
                                        <div className="text-gray-500">Version:</div>
                                        <div className="font-mono text-purple-400">{encryptedData.version}</div>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <div className="text-gray-500">Security:</div>
                                    <div className="font-mono text-amber-400">AES-256</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium text-gray-300">
                                Password / Passphrase
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-gray-800/50 border-gray-600 focus:border-blue-500 h-12 pr-12 rounded-2xl"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white "
                                >
                                    {showPassword ? <EyeClosed /> : <Eye />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 items-center justify-between">
                        <Button
                            variant="outline"
                            onClick={() => setStep("inputData")}
                            className=" border-gray-600 hover:border-gray-500 rounded-2xl"
                        >
                            Back
                        </Button>
                        <Button
                            onClick={handleDecrypt}
                            className=" bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            disabled={!password.trim() || isDecrypting}
                        >
                            {isDecrypting ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Decrypting...
                                </div>
                            ) : (
                                " Decrypt Data"
                            )}
                        </Button>
                    </div>
                </motion.div>
            )}

            {step === "showResult" && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-4xl w-full space-y-6"
                >
                    <div className="text-center space-y-3">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                            Decryption Successful
                        </h2>
                        <p className="text-gray-400">Your data has been successfully recovered</p>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🔓</span>
                                    <div>
                                        <h3 className="text-xl font-semibold">Decrypted Data</h3>
                                        <p className="text-sm text-gray-400">
                                            Your original sensitive information
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-green-400">
                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                    <span>Verified & Authentic</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-xs text-gray-400 uppercase tracking-wide">Recovered Data</Label>
                                <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-600/50 max-h-64 overflow-y-auto">
                                    <pre className="font-mono text-sm text-white whitespace-pre-wrap break-all">
                                        {decryptedResult}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Button
                            variant="outline"
                            onClick={() => copyToClipboard(decryptedResult)}
                            className="border-gray-600 hover:border-gray-500 rounded-2xl"
                        >
                            📋 Copy Data
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => downloadAsFile(decryptedResult, 'decrypted-data.txt')}
                            className="border-blue-600 hover:border-blue-500 text-blue-400 rounded-2xl"
                        >
                            💾 Download
                        </Button>
                        <Button
                            variant="outline"
                            onClick={resetFlow}
                            className="border-green-600 hover:border-green-500 text-green-400 rounded-2xl"
                        >
                            🔄 Decrypt New
                        </Button>
                    </div>

                    <div className="bg-amber-900/20 border border-amber-600/30 rounded-2xl p-6">
                        <div className="flex items-start gap-3">
                            <span className="text-amber-400 text-2xl mt-1">🔒</span>
                            <div className="space-y-3">
                                <h4 className="font-semibold text-amber-200 text-lg">Security Reminder</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-400 mt-1">•</span>
                                            Clear your browser cache and history after use
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-400 mt-1">•</span>
                                            Ensure you're on a secure, private network
                                        </li>
                                    </ul>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-400 mt-1">•</span>
                                            Store your recovered data securely
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-400 mt-1">•</span>
                                            Close this tab when finished
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}