import { useState } from "react";
import "./AuthPage.css";

function ForgotPasswordPage() {
    const [email, setEmail]         = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading]     = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        await new Promise((r) => setTimeout(r, 800));
        setLoading(false);
        setSubmitted(true);
    };

    return (
        <div className="auth-page">

            <header className="auth-top-panel">
                <div className="auth-top-panel-inner">
                    <div
                        className="auth-brand"
                        onClick={() => (window.location.href = "/")}
                    >
                        <span className="auth-brand-main">James</span>
                        <span className="auth-brand-sub">Cresslawn Luxury Beds</span>
                    </div>
                </div>
            </header>

            <main className="auth-main" style={{ padding: "40px 28px" }}>
                <div className="auth-card" style={{ maxWidth: "380px", padding: "22px 20px" }}>

                    <div className="auth-card-head">
                        <h1 className="auth-card-title" style={{ fontSize: "1.5rem" }}>
                            Forgot password?
                        </h1>
                        <p className="auth-card-sub">
                            Enter your email and we'll send you a reset link.
                        </p>
                    </div>

                    {submitted ? (
                        <div style={{ textAlign: "center", padding: "12px 0" }}>
                            <p style={{
                                fontSize: "0.93rem",
                                color: "#2d4b11",
                                fontWeight: 600,
                                lineHeight: 1.6,
                            }}>
                                If this email exists, a reset link has been sent.
                            </p>
                        </div>
                    ) : (
                        <form className="auth-form" onSubmit={handleSubmit} noValidate autoComplete="off">
                            <div className="auth-field">
                                <label htmlFor="fp-email">Email address</label>
                                <input
                                    id="fp-email"
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="off"
                                    style={{ height: "38px" }}
                                />
                            </div>

                            <button
                                type="submit"
                                className="auth-submit-btn"
                                disabled={loading}
                                style={{ height: "40px" }}
                            >
                                {loading ? "Sending…" : "Send Reset Link"}
                            </button>
                        </form>
                    )}

                </div>
            </main>

        </div>
    );
}

export default ForgotPasswordPage;
