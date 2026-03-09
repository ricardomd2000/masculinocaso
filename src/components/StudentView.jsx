import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Send, BookOpen, Microscope, Stethoscope, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function StudentView({ session, user }) {
    const [response, setResponse] = useState("");
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        setSubmitted(false);
        setResponse("");
        // Check if already submitted for this step
        const checkSubmission = async () => {
            const docRef = doc(db, "sessions", "bph_session", "responses", user.email);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                const currentData = data[`moment${session.currentStep}`];
                if (currentData) {
                    setResponse(currentData.observations || currentData.anatomy || currentData.patho || currentData.treatment || "");
                    setSubmitted(true);
                }
            }
        };
        checkSubmission();
    }, [session.currentStep, user.email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const docRef = doc(db, "sessions", "bph_session", "responses", user.email);
        const key = `moment${session.currentStep}`;
        const field = session.currentStep === 1 ? "observations" :
            session.currentStep === 2 ? "anatomy" :
                session.currentStep === 3 ? "patho" : "treatment";

        await setDoc(docRef, {
            [key]: { [field]: response, timestamp: new Date() }
        }, { merge: true });
        setSubmitted(true);
    };

    const getMomentContent = () => {
        switch (session.currentStep) {
            case 1: return { icon: <Stethoscope />, title: "Percepciones Clínicas", q: "¿Qué te llama la atención de este médico de 65 años con estos síntomas?" };
            case 2: return { icon: <BookOpen />, title: "Anatomía e Histología", q: "Explica la relación entre la anatomía prostática y los síntomas de José." };
            case 3: return { icon: <Microscope />, title: "Bioquímica y Fisiología", q: "¿Cuál es la implicación de la 5-alfa-reductasa en la progresión de la HBP?" };
            case 4: return { icon: <Activity />, title: "Manejo y Estilo de Vida", q: "¿Qué recomendaciones no farmacológicas priorizarías?" };
            default: return { icon: <Stethoscope />, title: "Sesión", q: "Ingresa tu respuesta" };
        }
    };

    const content = getMomentContent();

    return (
        <div className="container" style={{ paddingBottom: "5rem" }}>
            <header style={{ marginBottom: "2rem" }}>
                <p style={{ color: "var(--primary)", fontWeight: "700", margin: 0 }}>HBP: CASO JOSÉ RODRIGUEZ</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h1 style={{ margin: 0 }}>Momento {session.currentStep}</h1>
                    <button onClick={() => auth.signOut()} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.75rem" }}>Cerrar Sesión</button>
                </div>
            </header>

            <div className="glass" style={{ padding: "1.5rem", borderRadius: "1rem", marginBottom: "2rem", borderLeft: "4px solid var(--primary)" }}>
                <p style={{ margin: 0, fontSize: "0.95rem" }}><strong>Paciente:</strong> 65 años, Masculino, Médico. </p>
                <p style={{ margin: "0.5rem 0 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>Refiere nicturia (3-4 veces), urgencia y chorro débil desde hace un año.</p>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={session.currentStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="glass" style={{ padding: "2rem", borderRadius: "1.5rem", border: "1px solid var(--border)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                            <div style={{ color: "var(--primary)" }}>{content.icon}</div>
                            <h2 style={{ fontSize: "1.25rem", margin: 0 }}>{content.title}</h2>
                        </div>

                        <p style={{ fontWeight: "500", marginBottom: "1rem" }}>{content.q}</p>

                        {submitted ? (
                            <div style={{ textAlign: "center", padding: "2rem", background: "#f0fdf4", borderRadius: "1rem", border: "1px solid #bbf7d0" }}>
                                <p style={{ color: "#166534", fontWeight: "600", margin: 0 }}>¡Respuesta enviada!</p>
                                <p style={{ color: "#166534", fontSize: "0.875rem" }}>Espera a que el docente avance al siguiente momento.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <textarea
                                    rows="4"
                                    placeholder="Escribe tu análisis aquí..."
                                    value={response}
                                    onChange={(e) => setResponse(e.target.value)}
                                    style={{ resize: "none", marginBottom: "1.5rem", fontSize: "1rem" }}
                                    required
                                ></textarea>
                                <button
                                    type="submit"
                                    style={{ width: "100%", padding: "1rem", background: "var(--primary)", color: "white", border: "none", borderRadius: "0.75rem", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                                >
                                    <Send size={18} /> Enviar Percepción
                                </button>
                            </form>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

            <div style={{ position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", width: "90%", maxWidth: "400px" }}>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} style={{ flex: 1, height: "6px", borderRadius: "3px", background: session.currentStep >= s ? "var(--primary)" : "#e2e8f0" }}></div>
                    ))}
                </div>
            </div>
        </div>
    );
}
