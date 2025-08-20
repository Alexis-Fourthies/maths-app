import React, { useState } from "react";
import { GetServerSideProps } from "next";
import { getUserFromRequest } from "../../lib/auth";
import { PrismaClient } from "@prisma/client";
import Navbar from "../../components/Navbar";

interface Props {
  classe: string;
  cours: any[];
  userRole: string;
  userClasse: string;
}

const CLASSES = [
  { value: "sixieme", label: "6ème" },
  { value: "cinquieme", label: "5ème" },
  { value: "quatrieme", label: "4ème" },
  { value: "troisieme", label: "3ème" },
];

export default function ClassePage({
  classe,
  cours,
  userRole,
  userClasse,
}: Props) {
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

  return (
    <div style={{ background: "#24324a", minHeight: "100vh" }}>
      <Navbar userRole={userRole} userClasse={userClasse} />
      <div className="container-fluid d-flex align-items-center justify-content-center py-5">
        <div
          className="card shadow-lg p-5 border-0 w-100"
          style={{ maxWidth: 700, background: "#f7f7f7", color: "#222" }}
        >
          <h1
            className="h3 mb-4 fw-bold text-center"
            style={{ color: "#24324a" }}
          >
            Bienvenue en{" "}
            {CLASSES.find((c) => c.value === classe)?.label || classe}
          </h1>
          <h2 className="h5 mb-3" style={{ color: "#24324a" }}>
            Cours disponibles
          </h2>
          <div className="table-responsive">
            <table
              className="table table-bordered align-middle"
              style={{ background: "#fff" }}
            >
              <thead className="table-light">
                <tr>
                  <th>Titre</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cours.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center text-muted">
                      Aucun cours pour l'instant.
                    </td>
                  </tr>
                )}
                {cours.map((c) => (
                  <tr key={c.id}>
                    <td>{c.titre}</td>
                    <td>{new Date(c.createdAt).toLocaleDateString("fr-FR")}</td>
                    <td>
                      <button
                        onClick={() => handleViewPdf(c.fichier)}
                        className="btn btn-outline-primary btn-sm"
                      >
                        Voir
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
  const { classe } = ctx.params as { classe: string };
  if (!user || user.role !== "eleve" || user.classe !== classe) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
  const prisma = new PrismaClient();
  const cours = await prisma.cours.findMany({
    where: {
      classe: classe as any,
      active: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return {
    props: {
      classe,
      cours: JSON.parse(JSON.stringify(cours)),
      userRole: user.role,
      userClasse: user.classe || "",
    },
  };
};
