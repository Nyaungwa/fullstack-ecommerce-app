import { FaFacebookF, FaInstagram } from "react-icons/fa";
import "../pages/Homepage.css";

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-column">
                    <h4>Get In Touch</h4>
                    <p>Email: support@jamescresslawn.co.za</p>
                    <p>WhatsApp: 067 956 0000</p>
                    <p>Phone: 058 588 5000</p>
                </div>

                <div className="footer-column">
                    <h4>Products</h4>
                    <p>Beds</p>
                    <p>Mattresses</p>
                    <p>Headboards</p>
                </div>

                <div className="footer-column">
                    <h4>Company</h4>
                    <p>Terms &amp; Conditions</p>
                    <p>Privacy Policy</p>
                    <p>Returns Policy</p>
                </div>

                <div className="footer-column">
                    <h4>Follow Us</h4>
                    <div className="social-icons">
                        <FaFacebookF />
                        <FaInstagram />
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                &copy; {new Date().getFullYear()} James Cresslawn Luxury Beds. All rights reserved.
            </div>
        </footer>
    );
}

export default Footer;
