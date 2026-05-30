import React, { useState, useEffect, useRef } from "react";
import "./Homepage.css";
import "./Productpage.css";
import {
    FaTruck,
    FaUser,
    FaShoppingCart,
    FaSearch,
    FaShieldAlt,
    FaUndo
} from "react-icons/fa";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

function ProductPage() {

    const navigate = useNavigate();
    const { state } = useLocation();
    const { id } = useParams();

    /* ================= USER STATE ================= */

    const [user, setUser] = useState(() => {
        const token = localStorage.getItem("token");
        const name  = localStorage.getItem("userName");
        return token ? { name } : null;
    });

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
        navigate("/");
    };

    /* ================= TOP PANEL LOGIC ================= */

    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);
    const [showSearchBar, setShowSearchBar] = useState(false);

    useEffect(() => {

        if (search.length < 2) {
            setResults([]);
            return;
        }

        const apiBase = import.meta.env.VITE_API_URL || "";
        fetch(`${apiBase}/api/products/search?name=${search}`)
            .then(res => res.json())
            .then(data => setResults(data));

    }, [search]);

    /* ================= PRODUCT LOGIC ================= */

    const [quantity, setQuantity] = useState(1);

    if (!state) {
        return <p className="product-empty">Product not found</p>;
    }

    const oldPrice = state.price + 2000;
    const discount = Math.round(((oldPrice - state.price) / oldPrice) * 100);

    return (
        <div className="homepage-container">

            {/* ================= TOP PANEL ================= */}

            <div className="top-panel">

                <div className="brand" onClick={() => navigate("/")}>
                    <span className="brand-main">James</span>
                    <br />
                    <span className="brand-sub">Cresslawn Luxury Beds</span>
                </div>

                {/* Desktop Search */}
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
                                {results.map(item => (
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

                    <div
                        className="icon-items"
                        onClick={() => navigate("/checkout")}
                    >
                        <div className="cart-icon-wrapper">
                            <FaShoppingCart className="icon" />
                            <span className="cart-count">1</span>
                        </div>
                        <span className="icon-text">Cart</span>
                    </div>

                </div>
            </div>

            {/* Mobile Search */}
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
                            {results.map(item => (
                                <div
                                    key={item.id}
                                    className="mobile-search-result-item"
                                    onClick={() =>
                                        navigate(`/product/${item.id}`, { state: item })
                                    }
                                >
                                    <img src={item.image} alt={item.name} />
                                    <div>
                                        <p>{item.name}</p>
                                        <span>R{item.price}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            )}

            {/* ================= PRODUCT SECTION ================= */}

            <div className="product-page">

                <div className="product-container">

                    {/* Image */}
                    <div className="product-image">
                        <img src={state.image} alt={state.name} />
                    </div>

                    {/* Details */}
                    <div className="product-details">

                        <h1 className="product-title">{state.name}</h1>

                        {/* Pricing */}
                        <div className="price-section">
                            <span className="current-price">R{state.price}</span>
                            <span className="old-price">R{oldPrice}</span>
                        </div>

                        {/* Description */}
                        <div className="product-description">
                            <p>
                                Designed for ultimate spinal support and pressure relief,
                                this luxury bed ensures uninterrupted rest and premium comfort.
                            </p>
                            <p>
                                Crafted with durable high-density materials and elegant
                                finishing, it complements modern and classic interiors.
                            </p>
                            <p>
                                Engineered for long-term performance, offering hotel-quality
                                sleep from the comfort of your home.
                            </p>
                        </div>

                        {/* Quantity */}
                        <div className="quantity-wrapper">
                            <label>Quantity</label>
                            <div className="quantity-selector">
                                <button
                                    onClick={() =>
                                        setQuantity(q => Math.max(1, q - 1))
                                    }
                                >
                                    −
                                </button>

                                <span>{quantity}</span>

                                <button
                                    onClick={() =>
                                        setQuantity(q => q + 1)
                                    }
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* CTA */}
                        <button
                            className="add-to-cart-btn"
                            onClick={() =>
                                navigate("/checkout", {
                                    state: {
                                        ...state,
                                        quantity
                                    }
                                })
                            }
                        >
                            Add To Cart
                        </button>

                        {/* Features */}
                        <div className="product-features">
                            <div><FaTruck /> 2–3 Working Days Delivery</div>
                            <div><FaUndo /> 30-Day Easy Returns</div>
                            <div><FaShieldAlt /> 5-Year Warranty</div>
                        </div>

                    </div>
                </div>
            </div>

            <Footer />

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

export default ProductPage;
