import React, { useState } from "react";
import { GetServerSideProps } from "next";
import { getUserFromRequest } from "../lib/auth";
import { PrismaClient } from "@prisma/client";
import Navbar from "../components/Navbar";

interface Props {
  cours: any[];
  userRole: string;
}

const CLASSES = [
  { value: "sixieme", label: "6ème" },
  { value: "cinquieme", label: "5ème" },
  { value: "quatrieme", label: "4ème" },
  { value: "troisieme", label: "3ème" },
];

export default function Prof({ cours, userRole }: Props) {
  const [titre, setTitre] = useState("");
  const [classe, setClasse] = useState("sixieme");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [filtreClasse, setFiltreClasse] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!file) {
      setMessage("Veuillez sélectionner un fichier PDF.");
      return;
    }
    const formData = new FormData();
    formData.append("titre", titre);
    formData.append("classe", classe);
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      setMessage("Cours ajouté avec succès !");
      setTitre("");
      setFile(null);
      window.location.reload();
    } else {
      setMessage("Erreur lors de l'upload");
    }
  };

  const handleDelete = async (id: number, titre: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le cours "${titre}" ?`)) {
      return;
    }

    const res = await fetch("/api/delete-cours", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      window.location.reload();
    } else {
      alert("Erreur lors de la suppression");
    }
  };

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    const res = await fetch("/api/toggle-cours", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: !currentActive }),
    });

    if (res.ok) {
      window.location.reload();
    } else {
      alert("Erreur lors de la mise à jour");
    }
  };

  const handleViewPdf = (fichier: string) => {
    if (isMobile) {
      // Sur mobile, ouvrir directement dans un nouvel onglet
      window.open(fichier, "_blank");
    } else {
      // Sur desktop, ouvrir la modal
      setSelectedPdf(fichier);
      setShowModal(true);
    }
  };

  const handleDownload = async (fichier: string) => {
    try {
      // Télécharger le fichier via fetch pour forcer le téléchargement
      const response = await fetch(fichier);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fichier.split("/").pop() || "cours.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      // Fallback : ouvrir dans un nouvel onglet
      window.open(fichier, "_blank");
    }
  };

  // Filtrage des cours selon la classe sélectionnée
  const coursFiltres =
    filtreClasse === "all"
      ? cours
      : cours.filter((c) => c.classe === filtreClasse);

  return (
    <div style={{ background: "#24324a", minHeight: "100vh" }}>
      <Navbar userRole={userRole} />
      <div className="container-fluid d-flex align-items-center justify-content-center py-5">
        <div
          className="card shadow-lg p-5 border-0 w-100"
          style={{ maxWidth: 800, background: "#f7f7f7", color: "#222" }}
        >
          <h1
            className="h3 mb-4 fw-bold text-center"
            style={{ color: "#24324a" }}
          >
            Espace Professeur
          </h1>
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="row g-3 align-items-end">
              <div className="col-md-5">
                <label className="form-label" style={{ color: "#24324a" }}>
                  Titre du cours
                </label>
                <input
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  required
                  className="form-control"
                  style={{ background: "#fff", color: "#222" }}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label" style={{ color: "#24324a" }}>
                  Classe
                </label>
                <select
                  value={classe}
                  onChange={(e) => setClasse(e.target.value)}
                  className="form-select"
                  style={{ background: "#fff", color: "#222" }}
                >
                  {CLASSES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label" style={{ color: "#24324a" }}>
                  Fichier PDF
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                  className="form-control"
                  style={{ background: "#fff", color: "#222" }}
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100 mt-4 shadow-sm"
            >
              Ajouter le cours
            </button>
            {message && (
              <div
                className={`alert mt-3 ${
                  message.includes("succès") ? "alert-success" : "alert-danger"
                }`}
              >
                {message}
              </div>
            )}
          </form>
          <hr className="border-dark opacity-50" />
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h5 mb-0" style={{ color: "#24324a" }}>
              Cours déjà uploadés
            </h2>
            <div>
              <select
                value={filtreClasse}
                onChange={(e) => setFiltreClasse(e.target.value)}
                className="form-select"
                style={{
                  width: 200,
                  background: "#fff",
                  color: "#222",
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m1 6 7 7 7-7'/%3e%3c/svg%3e\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.75rem center",
                  backgroundSize: "16px 12px",
                }}
              >
                <option value="all">Toutes les classes</option>
                {CLASSES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="table-responsive">
            <table
              className="table table-bordered align-middle"
              style={{ background: "#fff" }}
            >
              <thead className="table-light">
                <tr>
                  <th>Titre</th>
                  <th>Classe</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coursFiltres.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-muted">
                      Aucun cours pour cette classe.
                    </td>
                  </tr>
                )}
                {coursFiltres.map((c) => (
                  <tr key={c.id}>
                    <td>{c.titre}</td>
                    <td>
                      <span className="badge bg-primary">
                        {CLASSES.find((cl) => cl.value === c.classe)?.label ||
                          c.classe}
                      </span>
                    </td>
                    <td>{new Date(c.createdAt).toLocaleDateString("fr-FR")}</td>
                    <td>
                      <button
                        onClick={() => handleToggleActive(c.id, c.active)}
                        className={`btn btn-sm ${
                          c.active ? "btn-success" : "btn-secondary"
                        }`}
                        title={
                          c.active
                            ? "Cours visible pour les élèves"
                            : "Cours masqué pour les élèves"
                        }
                      >
                        {c.active ? "Actif" : "Inactif"}
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => handleViewPdf(c.fichier)}
                        className="btn btn-outline-primary btn-sm me-2"
                      >
                        Voir
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.titre)}
                        className="btn btn-outline-danger btn-sm"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal pour l'aperçu PDF */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Aperçu du cours</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body p-0" style={{ height: "80vh" }}>
                {isMobile ? (
                  <div className="d-flex flex-column align-items-center justify-content-center h-100">
                    <p className="text-muted mb-3">
                      Aperçu non disponible sur mobile
                    </p>
                    <a
                      href={selectedPdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                    >
                      Ouvrir le PDF
                    </a>
                  </div>
                ) : (
                  <iframe
                    src={selectedPdf}
                    width="100%"
                    height="100%"
                    style={{ border: "none" }}
                  ></iframe>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Fermer
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleDownload(selectedPdf)}
                >
                  Télécharger
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay pour la modal */}
      {showModal && (
        <div
          className="modal-backdrop fade show"
          onClick={() => setShowModal(false)}
        ></div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const user = getUserFromRequest(ctx);
  if (!user || user.role !== "prof") {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
  const prisma = new PrismaClient();
  const cours = await prisma.cours.findMany({ orderBy: { createdAt: "desc" } });
  return {
    props: { cours: JSON.parse(JSON.stringify(cours)), userRole: user.role },
  };
};
