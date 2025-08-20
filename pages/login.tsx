import React, { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.role === "prof") router.push("/prof");
      else if (data.role === "eleve") router.push(`/classe/${data.classe}`);
    } else {
      setError("Identifiants invalides");
    }
  };

  return (
    <div
      className="container-fluid min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: "#24324a" }}
    >
      <div
        className="card shadow-lg p-5 border-0"
        style={{
          minWidth: 350,
          maxWidth: 400,
          background: "#f7f7f7",
          color: "#222",
        }}
      >
        <div className="text-center mb-4">
          <h1 className="h3 mb-3 fw-bold" style={{ color: "#24324a" }}>
            Connexion
          </h1>
          <p className="text-muted">Espace réservé aux professeurs et élèves</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" style={{ color: "#24324a" }}>
              Login
            </label>
            <input
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              className="form-control"
              style={{ background: "#fff", color: "#222" }}
            />
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ color: "#24324a" }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-control"
              style={{ background: "#fff", color: "#222" }}
            />
          </div>
          {error && (
            <div className="alert alert-danger py-2 text-center">{error}</div>
          )}
          <button type="submit" className="btn btn-primary w-100 mt-2">
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
