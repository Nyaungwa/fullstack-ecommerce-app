import { useEffect, useRef, useState } from "react";
import { FaTimes, FaEnvelopeOpenText } from "react-icons/fa";
import "./VerifyEmailModal.css";

/**
 * VerifyEmailModal
 * --------------------------------------------------------------------
 * 6-digit OTP popup shown after a user submits sign-in / register /
 * Google. Pure visual demo — accepts any 6 digits. To wire to a real
 * backend, call POST /api/auth/verify-code from `handleSubmit` and
 * POST /api/auth/resend-code from `handleResend`.
 * --------------------------------------------------------------------
 */
export default function VerifyEmailModal({ email, onClose, onSuccess }) {
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [resendSeconds, setResendSeconds] = useState(30);
    const inputRefs = useRef([]);

    /* ---------- auto-focus first slot ---------- */
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    /* ---------- resend countdown ---------- */
    useEffect(() => {
        if (resendSeconds <= 0) return;
        const t = setTimeout(() => setResendSeconds((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [resendSeconds]);

    /* ---------- escape to close ---------- */
    useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    /* ---------- per-digit handlers ---------- */
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

    /* paste a full code into any box */
    const onPaste = (e) => {
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!pasted) return;
        e.preventDefault();
        const next = pasted.split("");
        while (next.length < 6) next.push("");
        setCode(next);
        inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    };

    /* ---------- submit ---------- */
    const handleSubmit = async (e) => {
        e.preventDefault();
        const fullCode = code.join("");
        if (fullCode.length !== 6) {
            setError("Please enter all 6 digits.");
            return;
        }
        setSubmitting(true);
        // DEMO: any 6-digit code is accepted. Replace with real verify call.
        await new Promise((r) => setTimeout(r, 500));
        setSubmitting(false);
        onSuccess(fullCode);
    };

    /* ---------- resend ---------- */
    const handleResend = () => {
        if (resendSeconds > 0) return;
        setResendSeconds(30);
        // POST /api/auth/resend-code here
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

                <p className="verify-demo-hint">
                    Demo: any 6-digit code is accepted.
                </p>
            </div>
        </div>
    );
}
