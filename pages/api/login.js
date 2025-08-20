import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../lib/prisma";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { login, password } = req.body;
  if (!login || !password)
    return res.status(400).json({ error: "Champs manquants" });

  try {
    const user = await prisma.user.findUnique({ where: { login } });
    if (!user) return res.status(401).json({ error: "Identifiants invalides" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ error: "Identifiants invalides" });

    // Création du token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, classe: user.classe },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Pose du cookie httpOnly
    res.setHeader(
      "Set-Cookie",
      `session=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`
    );

    res.status(200).json({ role: user.role, classe: user.classe });
  } catch (error) {
    console.error("Erreur login:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}
