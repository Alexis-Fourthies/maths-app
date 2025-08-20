const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Début du seeding...");

  // Hash du mot de passe
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Créer le compte professeur
  const prof = await prisma.user.upsert({
    where: { login: "prof" },
    update: {},
    create: {
      login: "prof",
      password: hashedPassword,
      role: "prof",
    },
  });

  // Créer les comptes élèves
  const classes = ["sixieme", "cinquieme", "quatrieme", "troisieme"];

  for (const classe of classes) {
    await prisma.user.upsert({
      where: { login: `eleve_${classe}` },
      update: {},
      create: {
        login: `eleve_${classe}`,
        password: hashedPassword,
        role: "eleve",
        classe: classe,
      },
    });
  }

  console.log("✅ Seeding terminé !");
  console.log("Comptes créés :");
  console.log("- prof (mot de passe: password123)");
  console.log("- eleve_sixieme (mot de passe: password123)");
  console.log("- eleve_cinquieme (mot de passe: password123)");
  console.log("- eleve_quatrieme (mot de passe: password123)");
  console.log("- eleve_troisieme (mot de passe: password123)");
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
