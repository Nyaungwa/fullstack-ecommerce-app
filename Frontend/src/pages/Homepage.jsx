import React, { useState, useEffect, useRef } from "react";
import "./Homepage.css";
import {
    FaUser,
    FaShoppingCart,
    FaSearch,
    FaTimes
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

function HomePage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);
    const [showSearchBar, setShowSearchBar] = useState(false);
    const [type, setType] = useState("");
    const [size, setSize] = useState("");
    const [comfort, setComfort] = useState("");
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);

    // Auth state
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState("login"); // "login" | "register"
    const [authForm, setAuthForm] = useState({
        fullName: "",
        email: "",
        password: ""
    });
    const [authError, setAuthError] = useState("");
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem("token");
        const name = localStorage.getItem("userName");
        return token ? { name } : null;
    });

    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        setAuthError("");

        const apiBase = import.meta.env.VITE_API_URL || "";
        const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
        const body =
            authMode === "login"
                ? { email: authForm.email, password: authForm.password }
                : {
                      fullName: authForm.fullName,
                      email: authForm.email,
                      password: authForm.password
                  };

        try {
            const res = await fetch(`${apiBase}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (!res.ok) {
                setAuthError(data.message || "Something went wrong");
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("userName", data.fullName);
            setUser({ name: data.fullName });
            setShowAuthModal(false);
            setAuthForm({ fullName: "", email: "", password: "" });
        } catch {
            setAuthError("Network error — is the backend running?");
        }
    };

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        setUser(null);
        setDropdownOpen(false);
    };

    const handleFilterSearch = () => {
        const apiBase = import.meta.env.VITE_API_URL || "";

        fetch(`${apiBase}/api/products/filter?type=${type}&size=${size}&comfort=${comfort}`)
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                setFilteredProducts(data);
                setHasSearched(true);
            })
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        if (search.length < 2) {
            setResults([]);
            return;
        }

        const apiBase = import.meta.env.VITE_API_URL || "";

        fetch(`${apiBase}/api/products/search?name=${search}`)
            .then((res) => res.json())
            .then((data) => setResults(data));
    }, [search]);

    return (
        <div className="homepage-container">
            <div className="top-panel">
                <div className="brand">
                    <span className="brand-main">James</span>
                    <br />
                    <span className="brand-sub">Cresslawn Luxury Beds</span>
                </div>

                {/* Search Bar*/}
                <div className="search-selection">
                    <div className="search-box">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        {results.length > 0 && (
                            <div className="search-results-box">
                                {results
                                    .filter(
                                        (item, index, self) =>
                                            index === self.findIndex((p) => p.id === item.id)
                                    )
                                    .map((item) => (
                                        <div
                                            key={item.id}
                                            className="search-result-item"
                                            onClick={() =>
                                                navigate(`/product/${item.id}`, { state: item })
                                            }
                                        >
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                style={{
                                                    width: "60px",
                                                    height: "45px",
                                                    objectFit: "cover",
                                                    borderRadius: "5px"
                                                }}
                                            />

                                            <div className="search-result-info">
                                                <p>{item.name}</p>
                                                <span>R{item.price}</span>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}

                        <FaSearch className="search-icon" />
                    </div>
                </div>

                {/* Icons */}
                <div className="icon-selection">
                    <div
                        className="mobile-only-search"
                        onClick={() => setShowSearchBar(!showSearchBar)}
                    >
                        <FaSearch className="mobile-icon" />
                    </div>

                    {/* User */}
                    {user ? (
                        <div className="user-avatar-wrapper" ref={dropdownRef}>
                            <div className="icon-items" onClick={() => setDropdownOpen((o) => !o)}>
                                <UserAvatar name={user.name} />
                            </div>
                            {dropdownOpen && (
                                <div className="user-dropdown">
                                    <div
                                        className="user-dropdown-item"
                                        onClick={() => { setDropdownOpen(false); navigate("/orders"); }}
                                    >
                                        My Orders
                                    </div>
                                    <div
                                        className="user-dropdown-item user-dropdown-item--danger"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="icon-items" onClick={() => navigate("/login")}>
                            <FaUser className="icon" />
                            <span className="icon-text">Login</span>
                        </div>
                    )}

                    {/* Shopping Cart */}
                    <div className="icon-items">
                        <div className="cart-icon-wrapper">
                            <FaShoppingCart className="icon" />
                            <span className="cart-count">0</span>
                        </div>
                        <span className="icon-text">Cart</span>
                    </div>
                </div>
            </div>

            {showSearchBar && (
                <div className="mobile-search-box">
                    <input
                        type="text"
                        className="mobile-search-input"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    {results.length > 0 && (
                        <div className="mobile-search-results-box">
                            {results
                                .filter(
                                    (item, index, self) =>
                                        index === self.findIndex((p) => p.id === item.id)
                                )
                                .map((item) => (
                                    <div
                                        key={item.id}
                                        className="mobile-search-result-item"
                                        onClick={() =>
                                            navigate(`/product/${item.id}`, { state: item })
                                        }
                                    >
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            style={{
                                                width: "60px",
                                                height: "45px",
                                                objectFit: "cover",
                                                borderRadius: "5px"
                                            }}
                                        />

                                        <div className="mobile-search-result-info">
                                            <p>{item.name}</p>
                                            <span>R{item.price}</span>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}

                    <FaSearch className="mobile-search-icon" />
                </div>
            )}

            {/* Search Beds Background */}
            <div className="filterBox-background">
                <div className="filterBox-content">
                    <h2 className="filter-title">Beds for Sale</h2>

                    <p className="filter-subtitle">
                        Let's see what you are comfortable with
                    </p>

                    <div className="filter-box">
                        <div className="filter-row inline">
                            <select
                                className="filter-input small"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            >
                                <option value="">Type</option>
                                <option value="BED">Bed</option>
                                <option value="MATTRESS">Mattress</option>
                            </select>

                            <select
                                className="filter-input small"
                                value={size}
                                onChange={(e) => setSize(e.target.value)}
                            >
                                <option value="">Size</option>
                                <option value="SINGLE">Single</option>
                                <option value="THREE_QUARTER">3/4</option>
                                <option value="DOUBLE">Double</option>
                                <option value="QUEEN">Queen</option>
                                <option value="KING">King</option>
                            </select>

                            <select
                                className="filter-input small"
                                value={comfort}
                                onChange={(e) => setComfort(e.target.value)}
                            >
                                <option value="">Comfort</option>
                                <option value="SOFT">Soft</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="FIRM">Firm</option>
                                <option value="EXTRA_FIRM">Extra Firm</option>
                            </select>

                            <div className="filter-row center">
                                <button
                                    className="filter-button small"
                                    onClick={handleFilterSearch}
                                >
                                    Search
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= PRODUCTS FOR SALE SECTION ================= */}

            <h2 className="beds-section-name">Beds for Sale</h2>

            {hasSearched ? (
                <div className="beds-section">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => {
                            const oldPrice = product.oldPrice || product.price + 800;
                            const discountPercent = Math.round(
                                ((oldPrice - product.price) / oldPrice) * 100
                            );

                            return (
                                <div key={product.id} className="beds-card">
                                    <div className="discount-badge">-{discountPercent}%</div>

                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="bed-images"
                                    />

                                    <div className="bed-info">
                                        <h3>{product.name}</h3>

                                        <div className="price-container">
                                            <span className="old-price">R{oldPrice}</span>
                                            <span className="new-price">R{product.price}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p>No products found</p>
                    )}
                </div>
            ) : (
                <div className="beds-section">
                    {[
                        {
                            id: 1,
                            name: "Pillow Top Single Bed Set",
                            price: 2599,
                            oldPrice: 3299,
                            image: "/Single.jpeg"
                        },
                        {
                            id: 2,
                            name: "Box Top Double Bed Set",
                            price: 2999,
                            oldPrice: 3799,
                            image: "/Double.jpeg"
                        },
                        {
                            id: 3,
                            name: "Firm Queen Bed Set",
                            price: 3999,
                            oldPrice: 4899,
                            image: "/Queen.jpeg"
                        },
                        {
                            id: 4,
                            name: "Firm King Bed Set",
                            price: 5999,
                            oldPrice: 7299,
                            image: "/King.jpeg"
                        }
                    ].map((product) => {
                        const discountPercent = Math.round(
                            ((product.oldPrice - product.price) / product.oldPrice) * 100
                        );

                        return (
                            <div key={product.id} className="beds-card">
                                <div className="discount-badge">-{discountPercent}%</div>

                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="bed-images"
                                />

                                <div className="bed-info">
                                    <h3>{product.name}</h3>

                                    <div className="price-container">
                                        <span className="old-price">R{product.oldPrice}</span>
                                        <span className="new-price">R{product.price}</span>
                                    </div>

                                    <button
                                        className="add-cart"
                                        onClick={() =>
                                            navigate(`/product/${product.id}`, {
                                                state: product
                                            })
                                        }
                                    >
                                        View Product
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ================= MATTRESS SECTION ================= */}

            <h2 className="beds-section-name">Mattresses for Sale</h2>

            <div className="mattress-section">
                {[
                    {
                        id: 5,
                        name: "Single Mattress",
                        price: 2999,
                        oldPrice: 3599,
                        image: "/Single.jpeg"
                    },
                    {
                        id: 6,
                        name: "Double Mattress",
                        price: 3999,
                        oldPrice: 4699,
                        image: "/Double.jpeg"
                    },
                    {
                        id: 7,
                        name: "Queen Mattress",
                        price: 4999,
                        oldPrice: 5799,
                        image: "/Queen.jpeg"
                    },
                    {
                        id: 8,
                        name: "King Mattress",
                        price: 10999,
                        oldPrice: 12499,
                        image: "/King.jpeg"
                    }
                ].map((product) => {
                    const discountPercent = Math.round(
                        ((product.oldPrice - product.price) / product.oldPrice) * 100
                    );

                    return (
                        <div key={product.id} className="beds-card">
                            <div className="discount-badge">-{discountPercent}%</div>

                            <img
                                src={product.image}
                                alt={product.name}
                                className="bed-images"
                            />

                            <div className="bed-info">
                                <h3>{product.name}</h3>

                                <div className="price-container">
                                    <span className="old-price">R{product.oldPrice}</span>
                                    <span className="new-price">R{product.price}</span>
                                </div>

                                <button
                                    className="add-cart"
                                    onClick={() =>
                                        navigate(`/product/${product.id}`, {
                                            state: product
                                        })
                                    }
                                >
                                    View Product
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <Footer />

            {/* ================= AUTH MODAL ================= */}
            {showAuthModal && (
                <div className="auth-overlay" onClick={() => setShowAuthModal(false)}>
                    <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="auth-close"
                            onClick={() => setShowAuthModal(false)}
                        >
                            <FaTimes />
                        </button>

                        <h2 className="auth-title">
                            {authMode === "login" ? "Welcome Back" : "Create Account"}
                        </h2>

                        <form onSubmit={handleAuthSubmit} className="auth-form">
                            {authMode === "register" && (
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={authForm.fullName}
                                    onChange={(e) =>
                                        setAuthForm({
                                            ...authForm,
                                            fullName: e.target.value
                                        })
                                    }
                                    required
                                />
                            )}

                            <input
                                type="email"
                                placeholder="Email"
                                value={authForm.email}
                                onChange={(e) =>
                                    setAuthForm({
                                        ...authForm,
                                        email: e.target.value
                                    })
                                }
                                required
                            />

                            <input
                                type="password"
                                placeholder="Password"
                                value={authForm.password}
                                onChange={(e) =>
                                    setAuthForm({
                                        ...authForm,
                                        password: e.target.value
                                    })
                                }
                                required
                            />

                            {authError && <p className="auth-error">{authError}</p>}

                            <button type="submit" className="auth-submit">
                                {authMode === "login" ? "Login" : "Register"}
                            </button>
                        </form>

                        <p className="auth-switch">
                            {authMode === "login"
                                ? "Don't have an account? "
                                : "Already have an account? "}

                            <span
                                onClick={() => {
                                    setAuthMode(
                                        authMode === "login" ? "register" : "login"
                                    );
                                    setAuthError("");
                                }}
                            >
                                {authMode === "login" ? "Register" : "Login"}
                            </span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Avatar helpers ─────────────────────────────────────────────────── */

function getInitials(name) {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    const first  = parts[0]?.[0] || "";
    const second = parts[1]?.[0] || "";
    return (first + second).toUpperCase();
}

function UserAvatar({ name }) {
    return (
        <div style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            backgroundColor: "#2d4b11",
            color: "white",
            fontSize: "0.85rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
        }}>
            {getInitials(name)}
        </div>
    );
}

export default HomePage;