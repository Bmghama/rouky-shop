# 🚀 Guide de Déploiement Vercel : Rouky Shop

Ce guide vous explique comment mettre en ligne votre boutique avec une architecture persistante et sécurisée.

## 1. Pré-requis
*   Un compte **Vercel** (Gratuit).
*   Un compte **Turso** (SQLite Cloud gratuit).
*   Un compte **Cloudinary** (Stockage d'images gratuit).

---

## 2. Configuration de la Base de Données (Turso)
1.  Installez la CLI Turso ou utilisez le dashboard web.
2.  Créez une base de données : `turso db create rouky-shop`.
3.  Récupérez l'URL : `turso db show rouky-shop --url`.
4.  Générez un token : `turso db tokens create rouky-shop`.

---

## 3. Configuration des Images (Cloudinary)
1.  Allez dans votre dashboard Cloudinary.
2.  Récupérez votre `Cloud Name`, `API Key` et `API Secret`.

---

## 4. Configuration Vercel
1.  Liez votre dépôt GitHub à Vercel.
2.  Ajoutez les **Environment Variables** suivantes dans les paramètres de votre projet Vercel :

| Variable | Description | Exemple |
| :--- | :--- | :--- |
| `DATABASE_URL` | URL de votre base Turso | `libsql://rouky-shop-user.turso.io` |
| `DATABASE_AUTH_TOKEN` | Token de connexion Turso | `eyJhbGciOiJIUzI1Ni...` |
| `CLOUDINARY_CLOUD_NAME` | Votre Cloud Name | `dxo9abcde` |
| `CLOUDINARY_API_KEY` | Votre API Key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Votre API Secret | `xxxxxxxxxxxxxxxxxxxxxx` |
| `JWT_SECRET` | Une clé aléatoire longue | `un-secret-tres-long-et-sur-123!` |
| `ADMIN_PASSWORD` | Le mot de passe de l'admin | `votre_password_robuste` |
| `NODE_ENV` | Environnement | `production` |

---

## 5. Fichier `vercel.json` (À créer à la racine)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.ts",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server.ts"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

---

## 6. Pourquoi ces changements ?
*   **Persistance** : Turso stocke vos données dans le cloud, pas sur le serveur Vercel.
*   **Sécurité** : Plus aucun mot de passe n'est visible dans le code source.
*   **Images** : Vos photos sont stockées sur Cloudinary, garantissant qu'elles ne disparaîtront jamais.

**Rouky Shop est maintenant prêt pour le monde réel !** 🥂
