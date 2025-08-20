import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <div
      className="container-fluid min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: "#24324a" }}
    >
      <div
        className="card shadow-lg p-5 border-0 text-center"
        style={{
          minWidth: 350,
          maxWidth: 500,
          background: "#f7f7f7",
          color: "#222",
        }}
      >
        <h1 className="display-5 fw-bold mb-3" style={{ color: "#24324a" }}>
          Bienvenue sur le site de cours de maths
        </h1>
        <p className="mb-4" style={{ color: "#222" }}>
          Accédez à vos cours de mathématiques selon votre classe.
          <br />
          Espace sécurisé pour professeurs et élèves.
        </p>
        <Link href="/login" className="btn btn-primary btn-lg shadow-sm">
          Se connecter
        </Link>
      </div>
    </div>
  );
}
