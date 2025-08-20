# Site de Cours de Maths

Application web pour la gestion et la consultation de cours de mathématiques par classe (6ème à 3ème).

## 🚀 Fonctionnalités

- **Espace Professeur** : Upload et gestion de cours PDF
- **Espace Élèves** : Consultation des cours par classe
- **Authentification** : Système de connexion sécurisé
- **Gestion des cours** : Activation/désactivation, suppression
- **Interface responsive** : Compatible mobile et desktop

## 🛠️ Technologies

- **Frontend** : Next.js, React, TypeScript, Bootstrap
- **Backend** : Next.js API Routes
- **Base de données** : PostgreSQL (Supabase)
- **Stockage** : Supabase Storage
- **ORM** : Prisma
- **Authentification** : JWT, bcrypt

## 📁 Structure du projet

```
├── components/          # Composants React
├── lib/                # Utilitaires (Prisma, auth, etc.)
├── pages/              # Pages Next.js
│   ├── api/           # API Routes
│   └── classe/        # Pages élèves par classe
├── prisma/            # Configuration Prisma
├── styles/            # Styles globaux
└── public/            # Fichiers statiques
```

## 🔒 Sécurité

- Authentification JWT sécurisée
- Mots de passe hashés avec bcrypt
- Variables d'environnement protégées
- Politiques de sécurité Supabase
