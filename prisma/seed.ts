import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Hash des mots de passe (à personnaliser si besoin)
  const profPassword = await bcrypt.hash("prof1234", 10);
  const elevePassword = await bcrypt.hash("eleve1234", 10);

  // Création du compte professeur
  await prisma.user.upsert({
    where: { login: "prof" },
    update: {},
    create: {
      login: "prof",
      password: profPassword,
      role: "prof",
    },
  });

  // Création des comptes classes
  const classes = ["sixieme", "cinquieme", "quatrieme", "troisieme"] as const;
  for (const classe of classes) {
    await prisma.user.upsert({
      where: { login: classe },
      update: {},
      create: {
        login: classe,
        password: elevePassword,
        role: "eleve",
        classe: classe,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
