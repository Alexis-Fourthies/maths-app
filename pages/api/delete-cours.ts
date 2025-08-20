import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { supabase } from "../../lib/supabase";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

function getUserFromCookie(req: NextApiRequest) {
  const cookie = req.headers.cookie;
  if (!cookie) return null;
  const match = cookie.match(/session=([^;]+)/);
  if (!match) return null;
  try {
    const payload = jwt.verify(match[1], JWT_SECRET) as {
      id: number;
      role: string;
    };
    return payload;
  } catch {
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") return res.status(405).end();

  const user = getUserFromCookie(req);
  if (!user || user.role !== "prof")
    return res.status(401).json({ error: "Non autorisé" });

  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "ID du cours manquant" });

  try {
    // Récupérer les informations du cours
    const cours = await prisma.cours.findUnique({
      where: { id: parseInt(id) },
    });
    if (!cours) return res.status(404).json({ error: "Cours non trouvé" });

    // Supprimer le fichier de Supabase Storage si c'est une URL Supabase
    if (cours.fichier.includes("supabase.co")) {
      try {
        // Extraire le nom du fichier de l'URL
        const urlParts = cours.fichier.split("/");
        const fileName = urlParts[urlParts.length - 1];

        const { error } = await supabase.storage
          .from("cours")
          .remove([fileName]);

        if (error) {
          console.error("Erreur suppression Supabase:", error);
        }
      } catch (supabaseError) {
        console.error("Erreur suppression Supabase:", supabaseError);
        // On continue même si la suppression Supabase échoue
      }
    }

    // Supprimer l'enregistrement de la base
    await prisma.cours.delete({ where: { id: parseInt(id) } });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
}
