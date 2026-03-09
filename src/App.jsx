import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, onSnapshot } from "firebase/firestore";
import Login from "./components/Login";
import TeacherMonitor from "./components/TeacherMonitor";
import StudentView from "./components/StudentView";

export default function App() {
    const [user, setUser] = useState(null);
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

    if (loading) return <div className="loading">Cargando...</div>;

    return (
        <Router>
            <Routes>
                <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
                <Route
                    path="/"
                    element={
                        user ? (
                            user.email === "ricardoaldo@unisabana.edu.co" ? (
                                <TeacherMonitor session={session} />
                            ) : (
                                <StudentView session={session} user={user} />
                            )
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}
