import { useEffect, useRef, useState } from "react";
import { FaTimes, FaEnvelopeOpenText } from "react-icons/fa";
import "./VerifyEmailModal.css";

export default function VerifyEmailModal({ email, onClose, onSuccess }) {
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [resendSeconds, setResendSeconds] = useState(30);
    const inputRefs = useRef([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    useEffect(() => {
        if (resendSeconds <= 0) return;
        const t = setTimeout(() => setResendSeconds((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [resendSeconds]);

    useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const setDigit = (i, value) => {
        if (!/^\d?$/.test(value)) return;
        const next = [...code];
        next[i] = value;
        setCode(next);
        setError("");
        if (value && i < 5) inputRefs.current[i + 1]?.focus();
    };

    const onKeyDown = (i, e) => {
        if (e.key === "Backspace" && !code[i] && i > 0) {
            inputRefs.current[i - 1]?.focus();
        } else if (e.key === "ArrowLeft" && i > 0) {
            inputRefs.current[i - 1]?.focus();
        } else if (e.key === "ArrowRight" && i < 5) {
            inputRefs.current[i + 1]?.focus();
        }
    };

    const onPaste = (e) => {
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!pasted) return;
        e.preventDefault();
        const next = pasted.split("");
        while (next.length < 6) next.push("");
        setCode(next);
        inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fullCode = code.join("");
        if (fullCode.length !== 6) {
            setError("Please enter all 6 digits.");
            return;
        }
        setSubmitting(true);
        try {
            const apiBase = import.meta.env.VITE_API_URL || "";
            const res = await fetch(`${apiBase}/api/auth/verify-code`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code: fullCode })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(data.message || "Invalid or expired code.");
                setSubmitting(false);
                return;
            }
            onSuccess(fullCode);
        } catch {
            setError("Network error. Please try again.");
            setSubmitting(false);
        }
    };

    const handleResend = async () => {
        if (resendSeconds > 0) return;
        setResendSeconds(30);
        try {
            const apiBase = import.meta.env.VITE_API_URL || "";
            await fetch(`${apiBase}/api/auth/send-verification`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });
        } catch {
            // ignore resend errors silently
        }
    };

    return (
        <div className="verify-overlay" onClick={onClose}>
            <div
                className="verify-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="verify-title"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    className="verify-close"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <FaTimes />
                </button>

                <div className="verify-icon-wrap" aria-hidden="true">
                    <FaEnvelopeOpenText />
                </div>

                <h2 className="verify-title" id="verify-title">Check your email</h2>
                <p className="verify-sub">
                    We sent a 6-digit code to <strong>{email}</strong>.
                    Enter it below to continue.
                </p>

                <form className="verify-form" onSubmit={handleSubmit} noValidate>
                    <div className="verify-otp" onPaste={onPaste}>
                        {code.map((digit, i) => (
                            <input
                                key={i}
                                ref={(el) => (inputRefs.current[i] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => setDigit(i, e.target.value)}
                                onKeyDown={(e) => onKeyDown(i, e)}
                                aria-label={`Digit ${i + 1}`}
                                autoComplete={i === 0 ? "one-time-code" : "off"}
                                className={`verify-otp-input ${digit ? "filled" : ""}`}
                            />
                        ))}
                    </div>

                    {error && <p className="verify-error">{error}</p>}

                    <button
                        type="submit"
                        className="verify-submit"
                        disabled={submitting}
                    >
                        {submitting ? "Verifying…" : "Verify & Continue"}
                    </button>

                    <div className="verify-resend">
                        {resendSeconds > 0 ? (
                            <span>
                                Didn't get the code? Resend in <strong>{resendSeconds}s</strong>
                            </span>
                        ) : (
                            <button
                                type="button"
                                className="verify-resend-btn"
                                onClick={handleResend}
                            >
                                Resend code
                            </button>
                        )}
                    </div>

                    <button
                        type="button"
                        className="verify-change-email"
                        onClick={onClose}
                    >
                        Use a different email
                    </button>
                </form>
            </div>
        </div>
    );
}
