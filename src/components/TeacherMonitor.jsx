import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { doc, setDoc, collection, onSnapshot, query } from "firebase/firestore";
import { Users, Activity, ChevronRight, ChevronLeft, LogOut } from "lucide-react";

const MOMENTS = [
    { id: 1, title: "Percepciones Iniciales", desc: "José Rodriguez, 65 años, Médico." },
    { id: 2, title: "Anatomía e Histología", desc: "Correlación anátomo-clínica." },
    { id: 3, title: "Fisiopatología", desc: "Esteroides e Inmunología." },
    { id: 4, title: "Manejo y Feedback", desc: "Plan de tratamiento y cierre." }
];

export default function TeacherMonitor({ session }) {
    const [responses, setResponses] = useState([]);

    useEffect(() => {
        const q = query(collection(db, "sessions", "bph_session", "responses"));
        const unsub = onSnapshot(q, (snapshot) => {
            const respData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setResponses(respData);
        });
        return unsub;
    }, []);

    const changeStep = async (newStep) => {
        const stepNum = Number(newStep);
        if (stepNum < 1 || stepNum > 4) return;
        try {
            await setDoc(doc(db, "sessions", "bph_session"), {
                currentStep: stepNum,
                active: true,
                lastUpdate: new Date()
            }, { merge: true });
        } catch (error) {
            console.error("Error changing step:", error);
            alert("Error al cambiar de momento: No tienes permisos suficientes o hay un problema de conexión.");
        }
    };

    return (
        <div className="container" style={{ maxWidth: "1200px" }}>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", padding: "1rem 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: "1.25rem" }}>Monitor Docente</h1>
                    <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.875rem" }}>Caso: HBP - José Rodriguez</p>
                </div>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#dcfce7", color: "#166534", padding: "0.5rem 1rem", borderRadius: "2rem", fontSize: "0.875rem", fontWeight: "600" }}>
                        <Users size={16} />
                        {responses.length} Estudiantes
                    </div>
                    <button onClick={() => auth.signOut()} style={{ background: "none", border: "none", color: "#ef4444", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <LogOut size={18} /> Salir
                    </button>
                </div>
            </header>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
                {/* Control Panel */}
                <div className="glass" style={{ padding: "1.5rem", borderRadius: "1rem" }}>
                    <h2 style={{ fontSize: "1rem", marginBottom: "1.5rem" }}>Control de la Sesión</h2>
                    {MOMENTS.map((m) => (
                        <div
                            key={m.id}
                            style={{
                                padding: "1rem",
                                borderRadius: "0.75rem",
                                marginBottom: "0.75rem",
                                background: session.currentStep === m.id ? "var(--primary)" : "white",
                                color: session.currentStep === m.id ? "white" : "var(--text)",
                                border: "1px solid var(--border)",
                                cursor: "pointer"
                            }}
                            onClick={() => changeStep(m.id)}
                        >
                            <div style={{ fontWeight: "600" }}>Momento {m.id}: {m.title}</div>
                            <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>{m.desc}</div>
                        </div>
                    ))}
                    <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
                        <button onClick={() => changeStep(Number(session.currentStep) - 1)} disabled={Number(session.currentStep) === 1} style={{ flex: 1, padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--border)", background: "white" }}>Anterior</button>
                        <button onClick={() => changeStep(Number(session.currentStep) + 1)} disabled={Number(session.currentStep) === 4} style={{ flex: 1, padding: "0.75rem", borderRadius: "0.5rem", border: "none", background: "var(--primary)", color: "white" }}>Siguiente</button>
                    </div>
                </div>

                {/* Responses Feed */}
                <div className="glass" style={{ padding: "1.5rem", borderRadius: "1rem", maxHeight: "70vh", overflowY: "auto" }}>
                    <h2 style={{ fontSize: "1rem", marginBottom: "1.5rem" }}>Respuestas en tiempo real</h2>
                    {responses.length === 0 ? (
                        <p style={{ color: "var(--text-muted)", textAlign: "center", marginTop: "2rem" }}>Esperando respuestas...</p>
                    ) : (
                        responses.map((r) => (
                            <div key={r.id} style={{ marginBottom: "1.5rem", padding: "1rem", borderBottom: "1px solid var(--border)" }}>
                                <div style={{ fontWeight: "700", fontSize: "0.875rem", marginBottom: "0.5rem" }}>{r.id}</div>
                                {session.currentStep === 1 && <p style={{ margin: 0 }}>💭 {r.moment1?.observations || "Sin respuesta"}</p>}
                                {session.currentStep === 2 && <p style={{ margin: 0 }}>🧬 {r.moment2?.anatomy || "Sin respuesta"}</p>}
                                {session.currentStep === 3 && <p style={{ margin: 0 }}>🔬 {r.moment3?.patho || "Sin respuesta"}</p>}
                                {session.currentStep === 4 && <p style={{ margin: 0 }}>🏥 {r.moment4?.treatment || "Sin respuesta"}</p>}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
