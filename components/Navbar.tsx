import React from "react";
import { useRouter } from "next/router";

interface NavbarProps {
  userRole: string;
  userClasse?: string;
}

export default function Navbar({ userRole, userClasse }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout");
    router.push("/login");
  };

  const getUserDisplay = () => {
    if (userRole === "prof") return "Professeur";
    if (userRole === "eleve") {
      const classes = {
        sixieme: "6ème",
        cinquieme: "5ème",
        quatrieme: "4ème",
        troisieme: "3ème",
      };
      return `Élève ${
        classes[userClasse as keyof typeof classes] || userClasse
      }`;
    }
    return "";
  };

  return (
    <nav className="navbar navbar-expand-lg" style={{ background: "#24324a" }}>
      <div className="container-fluid">
        <span className="navbar-brand text-light fw-bold">Cours de Maths</span>
        <div className="d-flex align-items-center">
          <span className="text-light me-3">{getUserDisplay()}</span>
          <button
            onClick={handleLogout}
            className="btn btn-outline-light btn-sm"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  );
}
