import React, { useState, useEffect } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, onSnapshot } from "firebase/firestore";
import Login from "./components/Login";
import TeacherMonitor from "./components/TeacherMonitor";
import StudentView from "./components/StudentView";

export default function App() {
    const [user, setUser] = useState(null);
    const [guestEmail, setGuestEmail] = useState(localStorage.getItem("guestEmail") || "");
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState({ currentStep: 1, active: true });

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
        });
        return unsub;
    }, []);

    useEffect(() => {
        const unsub = onSnapshot(doc(db, "sessions", "bph_session"), (doc) => {
            if (doc.exists()) {
                setSession(doc.data());
            }
        });
        return unsub;
    }, []);

    const handleGuestSubmit = (email) => {
        const cleanEmail = email.trim().toLowerCase();
        setGuestEmail(cleanEmail);
        localStorage.setItem("guestEmail", cleanEmail);
    };

    const handleLogout = () => {
        auth.signOut();
        setGuestEmail("");
        localStorage.removeItem("guestEmail");
    };

    if (loading) return <div className="loading">Cargando...</div>;

    const activeUser = user || (guestEmail ? { email: guestEmail } : null);

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        activeUser ? (
                            ["ricardoaldo@unisabana.edu.co", "mariagalarin@unisabana.edu.co"].includes(activeUser.email) ? (
                                <TeacherMonitor session={session} />
                            ) : (
                                <StudentView session={session} user={activeUser} onLogout={handleLogout} />
                            )
                        ) : (
                            <SimpleEmailCapture onSubmit={handleGuestSubmit} />
                        )
                    }
                />
                <Route path="/monitor" element={<TeacherMonitor session={session} />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

function SimpleEmailCapture({ onSubmit }) {
    const [email, setEmail] = useState("");
    return (
        <div className="container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="glass" style={{ padding: "3rem", borderRadius: "1.5rem", width: "100%", maxWidth: "400px", textAlign: "center" }}>
                <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Bienvenido</h1>
                <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Ingresa tu correo institucional para comenzar</p>
                <form onSubmit={(e) => { e.preventDefault(); onSubmit(email); }}>
                    <input
                        type="email"
                        placeholder="tu-correo@unisabana.edu.co"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ marginBottom: "1.5rem" }}
                    />
                    <button type="submit" style={{ width: "100%", padding: "0.875rem", background: "var(--primary)", color: "white", border: "none", borderRadius: "0.5rem", fontWeight: "600" }}>
                        Ingresar
                    </button>
                </form>
            </div>
        </div>
    );
}
