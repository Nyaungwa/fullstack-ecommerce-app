import { useState } from "react";
import { useNavigate } from "react-router-dom";
import VerifyEmailModal from "../components/VerifyEmailModal";
import "./AuthPage.css";

function AuthPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("signin");
    const [authError, setAuthError] = useState("");

    /* Verification popup state.
       When non-null, the modal is shown. After the user enters a valid
       6-digit code, we run `pendingAction` (the deferred login/register
       network call) and navigate. */
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

    /* Open the verify-code modal. The real network call is deferred to
       runAfterVerify so a failed verify doesn't create a half-state. */
    const requestVerification = (email, runAfterVerify) => {
        setAuthError("");
        setPending({ email, runAfterVerify });
    };

    const handleVerified = async (_code) => {
        if (!pending) return;
        try {
            await pending.runAfterVerify();
            setPending(null);
            navigate("/");
        } catch (err) {
            setPending(null);
            setAuthError(err.message || "Something went wrong");
        }
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
        if (!res.ok) throw new Error(data.message || "Invalid email or password");
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
        if (!res.ok) throw new Error(data.message || "Registration failed");
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.fullName || signUpData.fullName);
    };

    /* ----------------------------- submit handlers ----------------------------- */

    const handleSignInSubmit = (e) => {
        e.preventDefault();
        setAuthError("");
        if (!signInData.email || !signInData.password) {
            setAuthError("Enter your email and password.");
            return;
        }
        requestVerification(signInData.email, runSignIn);
    };

    const handleSignUpSubmit = (e) => {
        e.preventDefault();
        setAuthError("");
        if (signUpData.password !== signUpData.confirmPassword) {
            setAuthError("Passwords do not match.");
            return;
        }
        if (!signUpData.email || !signUpData.fullName) {
            setAuthError("Please fill in all fields.");
            return;
        }
        requestVerification(signUpData.email, runSignUp);
    };

    /* Google OAuth — placeholder. In production, plug in `@react-oauth/google`
       or your own redirect flow; once Google returns the user object, call
       requestVerification(googleUser.email, () => storeTokenForGoogleUser()). */
    const handleGoogle = () => {
        setAuthError("");
        const demoEmail =
            activeTab === "signin" ? (signInData.email || "you@example.com")
                                   : (signUpData.email || "you@example.com");
        requestVerification(demoEmail, async () => {
            // Demo: pretend Google + verify succeeded
            localStorage.setItem("token", "demo-google-token");
            localStorage.setItem("userName", "Google user");
        });
    };

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

                    <div className="auth-card-head">
                        <h1 className="auth-card-title">
                            {activeTab === "signin"
                                ? "Welcome back"
                                : "Create your account"}
                        </h1>
                        <p className="auth-card-sub">
                            {activeTab === "signin"
                                ? "Sign in to pick up where you left off."
                                : "Join us for curated luxury sleep."}
                        </p>
                    </div>

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
                        onClick={handleGoogle}
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
                        <form className="auth-form" onSubmit={handleSignInSubmit} noValidate>
                            <div className="auth-field">
                                <label htmlFor="signin-email">Email</label>
                                <input
                                    id="signin-email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={signInData.email}
                                    onChange={handleSignInChange}
                                    autoComplete="email"
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
                                    autoComplete="current-password"
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

                                <a href="/" className="auth-link">
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

            <footer className="auth-footer">
                <div className="auth-footer-content">
                    <div className="auth-footer-column">
                        <h4>James Cresslawn</h4>
                        <p>
                            Premium sleep solutions built around comfort, durability,
                            and refined design.
                        </p>
                    </div>

                    <div className="auth-footer-column">
                        <h4>Customer Care</h4>
                        <p>Contact Us</p>
                        <p>Shipping & Delivery</p>
                        <p>Returns Policy</p>
                    </div>

                    <div className="auth-footer-column">
                        <h4>Company</h4>
                        <p>About Us</p>
                        <p>Privacy Policy</p>
                        <p>Terms & Conditions</p>
                    </div>

                    <div className="auth-footer-column">
                        <h4>Account</h4>
                        <p>Sign In</p>
                        <p>Create Account</p>
                        <p>Order Support</p>
                    </div>
                </div>

                <div className="auth-footer-bottom">
                    © 2026 James Cresslawn Luxury Beds. All rights reserved.
                </div>
            </footer>

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

/* Google "G" logo as an inline SVG — keeps the brand colors and avoids
   adding a new dependency. */
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
