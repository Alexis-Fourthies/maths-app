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

## 📋 Prérequis

- Node.js 16+
- npm ou yarn
- Compte Supabase

## 🔧 Installation

1. **Cloner le repository**
   ```bash
   git clone <votre-repo>
   cd maths
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration Supabase**
   - Créer un projet Supabase
   - Configurer les tables `User` et `Cours`
   - Créer le bucket `cours` dans Storage
   - Configurer les politiques de sécurité

4. **Variables d'environnement**
   Créer un fichier `.env` :
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT].pooler.supabase.com:5432/postgres"
   JWT_SECRET="votre_secret_jwt_tres_securise"
   NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT].supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="votre_clé_anon_supabase"
   ```

5. **Lancer l'application**
   ```bash
   npm run dev
   ```

## 👥 Comptes de test

- **Professeur** : `prof` / `password123`
- **Élèves** : `eleve_sixieme`, `eleve_cinquieme`, `eleve_quatrieme`, `eleve_troisieme` / `password123`

## 🚀 Déploiement

L'application est configurée pour être déployée sur Vercel :

1. Connecter le repository GitHub à Vercel
2. Configurer les variables d'environnement dans Vercel
3. Déployer automatiquement

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

## 📝 Licence

Ce projet est destiné à un usage éducatif.
