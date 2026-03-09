import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { LogIn, UserCircle, GraduationCap } from "lucide-react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isTeacher, setIsTeacher] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        try {
            if (isTeacher) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                // Simple flow for students: institutional email + fixed password
                if (!email.includes("@")) {
                    setError("Por favor ingresa un correo institucional válido.");
                    return;
                }
                try {
                    await signInWithEmailAndPassword(auth, email, "estudiante2026");
                } catch (err) {
                    if (err.code === "auth/user-not-found") {
                        await createUserWithEmailAndPassword(auth, email, "estudiante2026");
                    } else {
                        throw err;
                    }
                }
            }
        } catch (err) {
            setError("Error al ingresar. Verifica tus credenciales.");
            console.error(err);
        }
    };

    return (
        <div className="container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="glass" style={{ padding: "3rem", borderRadius: "1.5rem", width: "100%", maxWidth: "400px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <div style={{ background: "var(--primary)", width: "64px", height: "64px", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                        <GraduationCap color="white" size={32} />
                    </div>
                    <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "700" }}>Sesión Interactiva</h1>
                    <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>Caso: Hiperplasia Benigna de Próstata</p>
                </div>

                <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", background: "#f1f5f9", padding: "0.25rem", borderRadius: "0.75rem" }}>
                    <button
                        onClick={() => setIsTeacher(false)}
                        style={{ flex: 1, padding: "0.75rem", borderRadius: "0.5rem", border: "none", background: !isTeacher ? "white" : "transparent", fontWeight: !isTeacher ? "600" : "400", boxShadow: !isTeacher ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}
                    >
                        Estudiante
                    </button>
                    <button
                        onClick={() => setIsTeacher(true)}
                        style={{ flex: 1, padding: "0.75rem", borderRadius: "0.5rem", border: "none", background: isTeacher ? "white" : "transparent", fontWeight: isTeacher ? "600" : "400", boxShadow: isTeacher ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}
                    >
                        Docente
                    </button>
                </div>

                <form onSubmit={handleLogin}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "500" }}>
                        {isTeacher ? "Correo Electrónico" : "Correo Institucional"}
                    </label>
                    <input
                        type="email"
                        placeholder="ejemplo@u.edu.co"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    {isTeacher && (
                        <>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "500" }}>Contraseña</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </>
                    )}

                    {error && <p style={{ color: "#ef4444", fontSize: "0.875rem", marginBottom: "1rem" }}>{error}</p>}

                    <button
                        type="submit"
                        style={{ width: "100%", padding: "0.875rem", background: "var(--primary)", color: "white", border: "none", borderRadius: "0.5rem", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginTop: "1rem" }}
                    >
                        <LogIn size={20} />
                        Ingresar
                    </button>
                </form>
            </div>
        </div>
    );
}
