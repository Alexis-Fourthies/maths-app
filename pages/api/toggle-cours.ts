import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

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
  if (req.method !== "POST") return res.status(405).end();

  const user = getUserFromCookie(req);
  if (!user || user.role !== "prof")
    return res.status(401).json({ error: "Non autorisé" });

  const { id, active } = req.body;
  console.log("Toggle cours request:", { id, active });

  if (id === undefined || active === undefined)
    return res.status(400).json({ error: "ID et état manquants" });

  try {
    const result = await prisma.cours.update({
      where: { id: parseInt(id) },
      data: { active: Boolean(active) },
    });

    console.log("Cours updated:", result);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la mise à jour", details: error });
  }
}
