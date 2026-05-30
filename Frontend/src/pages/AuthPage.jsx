import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import VerifyEmailModal from "../components/VerifyEmailModal";
import Footer from "../components/Footer";
import "./AuthPage.css";

function AuthPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("signin");
    const [authError, setAuthError] = useState("");

    const [pending, setPending] = useState(null);

    const [signInData, setSignInData] = useState({
        email: "",
        password: "",
        rememberMe: false
    });

    const [signUpData, setSignUpData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    /* ----------------------------- handlers ----------------------------- */

    const handleSignInChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSignInData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSignUpChange = (e) => {
        const { name, value } = e.target;
        setSignUpData((prev) => ({ ...prev, [name]: value }));
    };

    /* ----------------------------- API actions ----------------------------- */

    const runSignIn = async () => {
        const apiBase = import.meta.env.VITE_API_URL || "";
        const res = await fetch(`${apiBase}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: signInData.email,
                password: signInData.password
            })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || data.error || "Invalid email or password");
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.fullName || signInData.email);
    };

    const runSignUp = async () => {
        const apiBase = import.meta.env.VITE_API_URL || "";
        const res = await fetch(`${apiBase}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fullName: signUpData.fullName,
                email: signUpData.email,
                password: signUpData.password
            })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || data.error || "Registration failed");
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.fullName || signUpData.fullName);
    };

    /* ----------------------------- submit handlers ----------------------------- */

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const handleSignInSubmit = async (e) => {
        e.preventDefault();
        setAuthError("");
        if (!signInData.email || !signInData.password) {
            setAuthError("Enter your email and password.");
            return;
        }
        if (!emailRegex.test(signInData.email)) {
            setAuthError("Please enter a valid email address.");
            return;
        }
        try {
            await runSignIn();
            navigate("/");
        } catch (err) {
            setAuthError(err.message || "Something went wrong");
        }
    };

    const handleSignUpSubmit = async (e) => {
        e.preventDefault();
        setAuthError("");
        if (!signUpData.fullName || !signUpData.email || !signUpData.password || !signUpData.confirmPassword) {
            setAuthError("Please fill in all fields.");
            return;
        }
        if (!emailRegex.test(signUpData.email)) {
            setAuthError("Please enter a valid email address.");
            return;
        }
        if (signUpData.password !== signUpData.confirmPassword) {
            setAuthError("Passwords do not match.");
            return;
        }
        try {
            const apiBase = import.meta.env.VITE_API_URL || "";
            const res = await fetch(`${apiBase}/api/auth/send-verification`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: signUpData.email })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || "Failed to send verification email");
            setPending({ email: signUpData.email });
        } catch (err) {
            setAuthError(err.message || "Failed to send verification email");
        }
    };

    const handleVerified = async () => {
        if (!pending) return;
        try {
            await runSignUp();
            setPending(null);
            navigate("/");
        } catch (err) {
            setPending(null);
            setAuthError(err.message || "Registration failed");
        }
    };

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setAuthError("");
            try {
                const apiBase = import.meta.env.VITE_API_URL || "";
                const res = await fetch(`${apiBase}/api/auth/google`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token: tokenResponse.access_token })
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data.error || "Google sign-in failed");
                localStorage.setItem("token", data.token);
                localStorage.setItem("userName", data.fullName || "");
                navigate("/");
            } catch (err) {
                setAuthError(err.message || "Google sign-in failed. Please try again.");
            }
        },
        onError: () => setAuthError("Google sign-in was cancelled or failed.")
    });

    /* ----------------------------- markup ----------------------------- */

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

            <main className="auth-main">
                <div className="auth-card">

                    <div className="auth-switch" role="tablist">
                        <button
                            type="button"
                            className={`auth-switch-btn ${activeTab === "signin" ? "active" : ""}`}
                            onClick={() => { setActiveTab("signin"); setAuthError(""); }}
                            role="tab"
                            aria-selected={activeTab === "signin"}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            className={`auth-switch-btn ${activeTab === "signup" ? "active" : ""}`}
                            onClick={() => { setActiveTab("signup"); setAuthError(""); }}
                            role="tab"
                            aria-selected={activeTab === "signup"}
                        >
                            Register
                        </button>
                    </div>

                    {/* ----- Google OAuth ----- */}
                    <button
                        type="button"
                        className="auth-google-btn"
                        onClick={() => login()}
                    >
                        <GoogleG />
                        <span>
                            {activeTab === "signin"
                                ? "Continue with Google"
                                : "Sign up with Google"}
                        </span>
                    </button>

                    {/* ----- divider ----- */}
                    <div className="auth-divider" role="separator">
                        <span>
                            or {activeTab === "signin" ? "sign in" : "register"} with email
                        </span>
                    </div>

                    {activeTab === "signin" ? (
                        <form className="auth-form" onSubmit={handleSignInSubmit} noValidate autoComplete="off">
                            {/* Hidden dummy fields absorb browser autofill before real inputs */}
                            <input type="text" style={{ display: "none" }} autoComplete="username" tabIndex={-1} aria-hidden="true" />
                            <input type="password" style={{ display: "none" }} autoComplete="current-password" tabIndex={-1} aria-hidden="true" />
                            <div className="auth-field">
                                <label htmlFor="signin-email">Email</label>
                                <input
                                    id="signin-email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={signInData.email}
                                    onChange={handleSignInChange}
                                    autoComplete="new-password"
                                />
                            </div>

                            <div className="auth-field">
                                <label htmlFor="signin-password">Password</label>
                                <input
                                    id="signin-password"
                                    name="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={signInData.password}
                                    onChange={handleSignInChange}
                                    autoComplete="new-password"
                                />
                            </div>

                            <div className="auth-row auth-row-between">
                                <label className="auth-checkbox">
                                    <input
                                        type="checkbox"
                                        name="rememberMe"
                                        checked={signInData.rememberMe}
                                        onChange={handleSignInChange}
                                    />
                                    <span>Remember me</span>
                                </label>

                                <a href="/forgot-password" className="auth-link">
                                    Forgot password?
                                </a>
                            </div>

                            {authError && <p className="auth-error-msg">{authError}</p>}

                            <button type="submit" className="auth-submit-btn">
                                Sign In
                            </button>
                        </form>
                    ) : (
                        <form className="auth-form" onSubmit={handleSignUpSubmit} noValidate>
                            <div className="auth-field">
                                <label htmlFor="signup-fullname">Full Name</label>
                                <input
                                    id="signup-fullname"
                                    name="fullName"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={signUpData.fullName}
                                    onChange={handleSignUpChange}
                                    autoComplete="name"
                                />
                            </div>

                            <div className="auth-field">
                                <label htmlFor="signup-email">Email</label>
                                <input
                                    id="signup-email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={signUpData.email}
                                    onChange={handleSignUpChange}
                                    autoComplete="email"
                                />
                            </div>

                            <div className="auth-field-grid">
                                <div className="auth-field">
                                    <label htmlFor="signup-password">Password</label>
                                    <input
                                        id="signup-password"
                                        name="password"
                                        type="password"
                                        placeholder="Create a password"
                                        value={signUpData.password}
                                        onChange={handleSignUpChange}
                                        autoComplete="new-password"
                                    />
                                </div>

                                <div className="auth-field">
                                    <label htmlFor="signup-confirm-password">
                                        Confirm Password
                                    </label>
                                    <input
                                        id="signup-confirm-password"
                                        name="confirmPassword"
                                        type="password"
                                        placeholder="Confirm your password"
                                        value={signUpData.confirmPassword}
                                        onChange={handleSignUpChange}
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>

                            <small className="auth-helper auth-helper-block">
                                Choose a strong password with a mix of letters, numbers,
                                and symbols.
                            </small>

                            {authError && <p className="auth-error-msg">{authError}</p>}

                            <button type="submit" className="auth-submit-btn">
                                Create Account
                            </button>
                        </form>
                    )}

                    <p className="auth-legal">
                        By continuing you agree to our{" "}
                        <a href="/" className="auth-link">Terms</a> and{" "}
                        <a href="/" className="auth-link">Privacy Policy</a>.
                    </p>

                </div>
            </main>

            <div style={{ marginTop: "auto" }}>
                <Footer />
            </div>

            {pending && (
                <VerifyEmailModal
                    email={pending.email}
                    onClose={() => setPending(null)}
                    onSuccess={handleVerified}
                />
            )}

        </div>
    );
}


function GoogleG() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 48 48"
            aria-hidden="true"
            focusable="false"
        >
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/>
            <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.5 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C41.8 35 44 30 44 24c0-1.2-.1-2.3-.4-3.5z"/>
        </svg>
    );
}

export default AuthPage;
