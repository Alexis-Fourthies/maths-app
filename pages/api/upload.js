import { PrismaClient } from "@prisma/client";
import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import { supabase } from "../../lib/supabase";

export const config = {
  api: {
    bodyParser: false,
  },
};

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

function getUserFromCookie(req) {
  const cookie = req.headers.cookie;
  if (!cookie) return null;
  const match = cookie.match(/session=([^;]+)/);
  if (!match) return null;
  try {
    const payload = jwt.verify(match[1], JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const user = getUserFromCookie(req);
  if (!user || user.role !== "prof")
    return res.status(401).json({ error: "Non autorisé" });

  // Utiliser le dossier temporaire système pour Vercel
  const uploadDir = process.env.NODE_ENV === 'production' 
    ? '/tmp' 
    : path.join(process.cwd(), "tmp");
    
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10 Mo
  });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ error: "Erreur lors de l'upload" });
    const { titre, classe } = fields;
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!titre || !classe || !file)
      return res.status(400).json({ error: "Champs manquants" });

    try {
      // Lire le fichier
      const fileBuffer = fs.readFileSync(file.filepath);
      const fileName = `${Date.now()}_${file.originalFilename}`;

      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from("cours")
        .upload(fileName, fileBuffer, {
          contentType: "application/pdf",
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Erreur upload Supabase:", error);
        throw error;
      }

      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from("cours")
        .getPublicUrl(fileName);

      // Enregistrement en base avec l'URL Supabase
      await prisma.cours.create({
        data: {
          titre: String(titre),
          fichier: urlData.publicUrl,
          classe: String(classe),
        },
      });

      // Nettoyer le fichier temporaire
      fs.unlinkSync(file.filepath);

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Erreur upload Supabase:", error);
      // Nettoyer le fichier temporaire en cas d'erreur
      if (fs.existsSync(file.filepath)) {
        fs.unlinkSync(file.filepath);
      }
      res.status(500).json({ error: "Erreur lors de l'upload vers Supabase" });
    }
  });
}
