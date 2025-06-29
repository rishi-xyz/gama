"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/src/ui/button";
import { Input } from "@/src/ui/input";
import { Label } from "@/src/ui/label";
import CryptoJS from 'crypto-js';
import { Key, NotebookPenIcon } from "lucide-react";

const encryptData = (text: string, password: string) => {
    try {
        const salt = CryptoJS.lib.WordArray.random(256 / 8);
        const iv = CryptoJS.lib.WordArray.random(128 / 8);

        // Derive key using PBKDF2 with high iteration count
        const key = CryptoJS.PBKDF2(password, salt, {
            keySize: 256 / 32,
            iterations: 100000,
            hasher: CryptoJS.algo.SHA256
        });

        // (AES-CTR with HMAC for authentication)
        const encrypted = CryptoJS.AES.encrypt(text, key, {
            iv: iv,
            mode: CryptoJS.mode.CTR,
            padding: CryptoJS.pad.NoPadding
        });

        // Create HMAC for authentication
        const hmac = CryptoJS.HmacSHA256(encrypted.ciphertext.toString(), key);

        return {
            ciphertext: encrypted.ciphertext.toString(),
            salt: salt.toString(),
            iv: iv.toString(),
            hmac: hmac.toString()
        };
    } catch (error) {
        throw new Error(`Encryption failed: ${error}`);
    }
};

const decryptData = (encryptedData: any, password: string) => {
    try {
        const { ciphertext, salt, iv, hmac } = encryptedData;
        const key = CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(salt), {
            keySize: 256 / 32,
            iterations: 100000,
            hasher: CryptoJS.algo.SHA256
        });
        const computedHmac = CryptoJS.HmacSHA256(ciphertext, key);
        if (computedHmac.toString() !== hmac) {
            throw new Error('Invalid password or corrupted data');
        }
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

interface EncryptedData {
    ciphertext: string;
    salt: string;
    iv: string;
    hmac: string;
    timestamp: number;
    version: string;
}

export default function DashboardPage() {
    const [step, setStep] = useState<"inputKey" | "chooseMethod" | "inputPassword" | "showEncrypted" | "decrypt">("inputKey");
    const [privateKey, setPrivateKey] = useState("");
    const [method, setMethod] = useState<"password" | "passphrase">("password");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [encrypted, setEncrypted] = useState<EncryptedData | null>(null);
    const [decryptPassword, setDecryptPassword] = useState("");
    const [decryptedKey, setDecryptedKey] = useState("");
    const [isEncrypting, setIsEncrypting] = useState(false);

    const validatePassword = (pwd: string) => {
        if (pwd.length < 8) return "Password must be at least 8 characters";
        if (!/(?=.*[a-z])/.test(pwd)) return "Password must contain lowercase letters";
        if (!/(?=.*[A-Z])/.test(pwd)) return "Password must contain uppercase letters";
        if (!/(?=.*\d)/.test(pwd)) return "Password must contain numbers";
        if (!/(?=.*[@$!%*?&])/.test(pwd)) return "Password must contain special characters";
        return null;
    };

    const encryptKey = async () => {
        if (!password || !privateKey) {
            return toast.error("Missing required fields");
        }

        if (password !== confirmPassword) {
            return toast.error("Passwords do not match");
        }

        const passwordError = validatePassword(password);
        if (passwordError && method === "password") {
            return toast.error(passwordError);
        }

        setIsEncrypting(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const result = encryptData(privateKey, password);

            const encryptedData: EncryptedData = {
                ...result,
                timestamp: Date.now(),
                version: "1.0"
            };

            setEncrypted(encryptedData);
            setStep("showEncrypted");
            toast.success("🔐 Encryption Successful", {
                description: "Your private key has been securely encrypted using AES-256"
            });
        } catch (error) {
            toast.error("Encryption failed", {
                description: error instanceof Error ? error.message : "Unknown error occurred"
            });
        } finally {
            setIsEncrypting(false);
        }
    };

    const handleDecrypt = async () => {
        if (!encrypted || !decryptPassword) {
            return toast.error("Missing encrypted data or password");
        }

        try {
            const decrypted = decryptData(encrypted, decryptPassword);
            setDecryptedKey(decrypted);
            toast.success("🔓 Decryption Successful", {
                description: "Your private key has been decrypted"
            });
        } catch (error) {
            toast.error("Decryption failed", {
                description: error instanceof Error ? error.message : "Invalid password or corrupted data"
            });
            setDecryptedKey("");
        }
    };

    const resetFlow = () => {
        setStep("inputKey");
        setPrivateKey("");
        setPassword("");
        setConfirmPassword("");
        setEncrypted(null);
        setDecryptPassword("");
        setDecryptedKey("");
    };

    const copyToClipboard = (data: any, format: 'json' | 'compact' = 'json') => {
        let textToCopy = '';

        if (format === 'json') {
            textToCopy = JSON.stringify(data, null, 2);
        } else {
            textToCopy = `${data.ciphertext}:${data.salt}:${data.iv}:${data.hmac}`;
        }

        navigator.clipboard.writeText(textToCopy);
        toast.success(`Copied ${format.toUpperCase()} format to clipboard`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex flex-col justify-center items-center p-6">
            {step === "inputKey" && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-lg w-full space-y-6"
                >
                    <div className="text-center space-y-3">
                        <div className="text-6xl mb-4">🔐</div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            Secure Key Vault
                        </h1>
                        <p className="text-gray-400 text-lg">
                            Military-grade encryption for your private keys
                        </p>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="privateKey" className="text-sm font-medium text-gray-300">
                                Private Key / Secret Data
                            </Label>
                            <textarea
                                id="privateKey"
                                placeholder="Enter your private key, seed phrase, or any sensitive data..."
                                value={privateKey}
                                onChange={(e) => setPrivateKey(e.target.value)}
                                className="w-full h-32 bg-gray-800/50 border border-gray-600 rounded-2xl p-3 text-white placeholder-gray-500 resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-mono text-sm"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={() => setStep("chooseMethod")}
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition-all duration-200 transform hover:scale-[1.02] "
                        disabled={!privateKey.trim()}
                    >
                        Continue to Security Setup
                    </Button>
                </motion.div>
            )}

            {step === "chooseMethod" && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full space-y-6"
                >
                    <div className="text-center space-y-3">
                        <h1 className="text-3xl font-bold">Choose Protection Method</h1>
                        <p className="text-gray-400">How would you like to secure your data?</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <button
                            onClick={() => setMethod("password")}
                            className={`p-6 rounded-2xl border-2 transition-all duration-200 ${method === "password"
                                ? "border-blue-500 bg-blue-500/10"
                                : "border-gray-600 bg-gray-800/30 hover:border-gray-500"
                                }`}
                        >
                            <div className="flex items-center space-x-4">
                                <Key />
                                <div className="text-left">
                                    <h3 className="font-semibold text-lg">Strong Password</h3>
                                    <p className="text-sm text-gray-400">
                                        Enforced complexity rules for maximum security
                                    </p>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => setMethod("passphrase")}
                            className={`p-6 rounded-2xl border-2 transition-all duration-200 ${method === "passphrase"
                                ? "border-purple-500 bg-purple-500/10"
                                : "border-gray-600 bg-gray-800/30 hover:border-gray-500"
                                }`}
                        >
                            <div className="flex items-center space-x-4">
                                <NotebookPenIcon />
                                <div className="text-left">
                                    <h3 className="font-semibold text-lg">Custom Passphrase</h3>
                                    <p className="text-sm text-gray-400">
                                        Use your own memorable phrase or sentence without any rules.
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>

                    <div className="flex gap-3 items-center justify-between">
                        <Button
                            variant="outline"
                            onClick={() => setStep("inputKey")}
                            className="border-gray-600 hover:border-gray-500 rounded-2xl"
                        >
                            Back
                        </Button>
                        <Button
                            onClick={() => setStep("inputPassword")}
                            className=" bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                            Continue
                        </Button>
                    </div>
                </motion.div>
            )}

            {step === "inputPassword" && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-lg w-full space-y-6"
                >
                    <div className="text-center space-y-3">
                        <h1 className="text-3xl font-bold">
                            {method === "password" ? "Create Strong Password" : "Set Your Passphrase"}
                        </h1>
                        <p className="text-gray-400">
                            {method === "password"
                                ? "Your password must meet security requirements"
                                : "Choose a memorable passphrase that only you know"}
                        </p>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium text-gray-300">
                                {method === "password" ? "Password" : "Passphrase"}
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder={method === "password" ? "Enter a strong password" : "Enter your memorable passphrase"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-gray-800/50 border-gray-600 focus:border-blue-500 h-12"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">
                                Confirm {method === "password" ? "Password" : "Passphrase"}
                            </Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="bg-gray-800/50 border-gray-600 focus:border-blue-500 h-12"
                            />
                        </div>

                        {method === "password" && password && (
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-400">Password Requirements:</Label>
                                <div className="space-y-1 text-xs">
                                    <div className={`flex items-center gap-2 ${password.length >= 8 ? 'text-green-400' : 'text-red-400'}`}>
                                        <span>{password.length >= 8 ? '✓' : '✗'}</span>
                                        <span>At least 8 characters</span>
                                    </div>
                                    <div className={`flex items-center gap-2 ${/(?=.*[a-z])/.test(password) ? 'text-green-400' : 'text-red-400'}`}>
                                        <span>{/(?=.*[a-z])/.test(password) ? '✓' : '✗'}</span>
                                        <span>Lowercase letters</span>
                                    </div>
                                    <div className={`flex items-center gap-2 ${/(?=.*[A-Z])/.test(password) ? 'text-green-400' : 'text-red-400'}`}>
                                        <span>{/(?=.*[A-Z])/.test(password) ? '✓' : '✗'}</span>
                                        <span>Uppercase letters</span>
                                    </div>
                                    <div className={`flex items-center gap-2 ${/(?=.*\d)/.test(password) ? 'text-green-400' : 'text-red-400'}`}>
                                        <span>{/(?=.*\d)/.test(password) ? '✓' : '✗'}</span>
                                        <span>Numbers</span>
                                    </div>
                                    <div className={`flex items-center gap-2 ${/(?=.*[@$!%*?&])/.test(password) ? 'text-green-400' : 'text-red-400'}`}>
                                        <span>{/(?=.*[@$!%*?&])/.test(password) ? '✓' : '✗'}</span>
                                        <span>Special characters (@$!%*?&)</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 items-center justify-between">
                        <Button
                            variant="outline"
                            onClick={() => setStep("chooseMethod")}
                            className=" border-gray-600 hover:border-gray-500 rounded-2xl"
                        >
                            Back
                        </Button>
                        <Button
                            onClick={encryptKey}
                            className=" bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12"
                            disabled={!password.trim() || !confirmPassword.trim() || isEncrypting}
                        >
                            {isEncrypting ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Encrypting...
                                </div>
                            ) : (
                                "Encrypt Now"
                            )}
                        </Button>
                    </div>
                </motion.div>
            )}

            {step === "showEncrypted" && encrypted && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-4xl w-full space-y-6"
                >
                    <div className="text-center space-y-3">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                            Encryption Complete
                        </h2>
                        <p className="text-gray-400">Your data has been secured with encryption</p>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🔐</span>
                                    <div>
                                        <h3 className="text-xl font-semibold">Encrypted Package</h3>
                                        <p className="text-sm text-gray-400">
                                            AES-256 + PBKDF2 (100,000 iterations) + HMAC-SHA256
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right text-sm text-gray-400">
                                    <div>Created: {new Date(encrypted.timestamp).toLocaleString()}</div>
                                    <div>Version: {encrypted.version}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <Label className="text-xs text-gray-400 uppercase tracking-wide">Encrypted Data</Label>
                                    <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-600/50 break-all font-mono text-xs max-h-32 overflow-y-auto">
                                        {encrypted.ciphertext}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-xs text-gray-400 uppercase tracking-wide">Salt</Label>
                                    <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-600/50 break-all font-mono text-xs">
                                        {encrypted.salt}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-xs text-gray-400 uppercase tracking-wide">IV</Label>
                                    <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-600/50 break-all font-mono text-xs">
                                        {encrypted.iv}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-xs text-gray-400 uppercase tracking-wide">HMAC</Label>
                                    <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-600/50 break-all font-mono text-xs">
                                        {encrypted.hmac}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <Button
                            variant="outline"
                            onClick={() => copyToClipboard(encrypted, 'json')}
                            className="border-gray-600 hover:border-gray-500 rounded-2xl"
                        >
                            Copy JSON
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => copyToClipboard(encrypted, 'compact')}
                            className="border-gray-600 hover:border-gray-500 rounded-2xl"
                        >
                            Copy Compact
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setStep("decrypt")}
                            className="border-blue-600 hover:border-blue-500 text-blue-400 rounded-2xl"
                        >
                            Test Decrypt
                        </Button>
                        <Button
                            variant="outline"
                            onClick={resetFlow}
                            className="border-green-600 hover:border-green-500 text-green-400 rounded-2xl"
                        >
                            Encrypt New
                        </Button>
                    </div>

                    <div className="bg-amber-900/20 border border-amber-600/30 rounded-2xl p-6">
                        <div className="flex items-start gap-3">
                            <span className="text-amber-400 text-2xl mt-1">⚠️</span>
                            <div className="space-y-3">
                                <h4 className="font-semibold text-amber-200 text-lg">Important Security Notes</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-400 mt-1">•</span>
                                            Store this encrypted package in multiple secure locations
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-400 mt-1">•</span>
                                            Never share your password/passphrase with anyone
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-400 mt-1">•</span>
                                            Test decryption before deleting original data
                                        </li>
                                    </ul>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-400 mt-1">•</span>
                                            Password cannot be recovered if forgotten
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-400 mt-1">•</span>
                                            Keep backups in different physical locations
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-400 mt-1">•</span>
                                            Consider using a secure password manager
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {step === "decrypt" && encrypted && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-lg w-full space-y-6"
                >
                    <div className="text-center space-y-3">
                        <h1 className="text-3xl font-bold">Test Decryption</h1>
                        <p className="text-gray-400">Enter your password to verify the encryption</p>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="decryptPassword" className="text-sm font-medium text-gray-300">
                                Password
                            </Label>
                            <Input
                                id="decryptPassword"
                                type="password"
                                placeholder="Enter your password"
                                value={decryptPassword}
                                onChange={(e) => setDecryptPassword(e.target.value)}
                                className="bg-gray-800/50 border-gray-600 focus:border-blue-500 h-12 rounded-2xl"
                            />
                        </div>

                        {decryptedKey && (
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-green-400">Decrypted Successfully</Label>
                                <div className="p-4 bg-green-900/20 border border-green-600/30 rounded-2xl break-all font-mono text-sm max-h-32 overflow-y-auto">
                                    {decryptedKey}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 items-center justify-between">
                        <Button
                            variant="outline"
                            onClick={() => setStep("showEncrypted")}
                            className=" border-gray-600 hover:border-gray-500 rounded-2xl"
                        >
                            Back
                        </Button>
                        <Button
                            onClick={handleDecrypt}
                            className=" bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 "
                            disabled={!decryptPassword.trim()}
                        >
                            Decrypt
                        </Button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}