# 📚 FORMATION MANAGER - Guide d'Installation

## 🎯 Vue d'ensemble

Formation Manager est une PWA (Progressive Web App) permettant de gérer votre planning de formation 2026 avec synchronisation bidirectionnelle avec Google Sheets.

## 📋 Prérequis

- Un compte Google avec accès à Google Sheets
- Votre fichier Excel `PLANNING_FORMATION_2026.xlsx` converti en Google Sheets
- Un hébergement web (GitHub Pages, Netlify, Vercel, etc.) ou serveur local

## 🚀 Installation - Étape par Étape

### ÉTAPE 1 : Préparer Google Sheets

1. **Convertir votre fichier Excel en Google Sheets**
   - Ouvrez Google Drive
   - Importez votre fichier `PLANNING_FORMATION_2026.xlsx`
   - Ouvrez-le avec Google Sheets

2. **Ouvrir l'éditeur de script**
   - Dans Google Sheets : `Extensions` > `Apps Script`
   - Supprimez le code par défaut

3. **Copier le script**
   - Copiez tout le contenu du fichier `google-apps-script.js`
   - Collez-le dans l'éditeur Apps Script
   - Cliquez sur `💾 Enregistrer`

4. **Déployer en Web App**
   - Cliquez sur `Déployer` > `Nouveau déploiement`
   - Type de déploiement : `Application Web`
   - Description : "API Planning Formation"
   - Exécuter en tant que : `Moi`
   - Qui a accès : `Tout le monde` (ou selon vos besoins)
   - Cliquez sur `Déployer`
   - **IMPORTANT** : Copiez l'URL du déploiement (elle ressemble à : `https://script.google.com/macros/s/XXXXX/exec`)

### ÉTAPE 2 : Configuration de la PWA

1. **Modifier le fichier `app.js`**
   
   Ouvrez le fichier `app.js` et remplacez :
   
   ```javascript
   const CONFIG = {
     APPS_SCRIPT_URL: 'VOTRE_URL_GOOGLE_APPS_SCRIPT_ICI',
     USE_DEMO_DATA: true  // ← Mettre à false une fois configuré
   };
   ```
   
   Par :
   
   ```javascript
   const CONFIG = {
     APPS_SCRIPT_URL: 'https://script.google.com/macros/s/XXXXX/exec',  // ← Votre URL
     USE_DEMO_DATA: false  // ← Activer la vraie connexion
   };
   ```

### ÉTAPE 3 : Déploiement de la PWA

#### Option A : GitHub Pages (Gratuit)

1. Créez un nouveau repository sur GitHub
2. Uploadez les fichiers :
   - `index.html`
   - `app.js`
   - `manifest.json`
   - `service-worker.js`
3. Activez GitHub Pages dans les paramètres du repository
4. Votre PWA sera disponible à : `https://votre-nom.github.io/formation-manager/`

#### Option B : Netlify (Gratuit)

1. Glissez-déposez le dossier contenant tous les fichiers sur https://app.netlify.com/drop
2. Votre PWA sera instantanément déployée avec une URL

#### Option C : Serveur local (pour tests)

1. Installez un serveur HTTP simple :
   ```bash
   # Avec Python 3
   python -m http.server 8000
   
   # Ou avec Node.js
   npx serve
   ```

2. Accédez à : `http://localhost:8000`

### ÉTAPE 4 : Test de la connexion

1. Ouvrez votre PWA dans un navigateur
2. Cliquez sur le bouton `🔄 Actualiser`
3. Vérifiez que les données de votre Google Sheets apparaissent
4. Les statistiques doivent afficher les vraies valeurs

## 🔧 Fonctionnalités

### ✅ Implémentées

- ✓ Lecture des données depuis Google Sheets
- ✓ Affichage calendrier et tableau
- ✓ Filtres par formateur et mois
- ✓ Recherche en temps réel
- ✓ Ajout de nouvelles sessions
- ✓ **Règle métier** : Vérification qu'un formateur n'a pas déjà une session le même jour
- ✓ Interface responsive et moderne
- ✓ Mode hors ligne (PWA)
- ✓ Statistiques en temps réel

### 🎨 Design

L'interface utilise :
- Palette de couleurs cyberpunk moderne (bleu foncé, cyan, rose)
- Typographies : Space Mono (titres) + Outfit (corps)
- Animations fluides et micro-interactions
- Fond animé avec effets de lumière
- Mode sombre par défaut

## 📊 Structure des données

### Format Formateur
```json
{
  "id": "F001",
  "nom": "Stéphane SANGORRIN",
  "type": "permanent",
  "specialites": "R482-484-485-486-487-489-490",
  "tarif": "CACES®",
  "telephone": "06 67 30 86 72",
  "email": "sango64@me.com",
  "colonneExcel": 16
}
```

### Format Session
```json
{
  "id": "S001",
  "date": "2026-01-05",
  "jourSemaine": "L",
  "formateurId": "F001",
  "formateurNom": "Stéphane SANGORRIN",
  "typeFormation": "DURUTY",
  "lieu": "INTER BENESSE",
  "statut": "planifie",
  "ligneExcel": 12,
  "colonneExcel": 16
}
```

## 🔐 Sécurité et Règles métier

### Règle implémentée
- **Un formateur ne peut pas avoir deux sessions différentes le même jour**
  - Vérification côté Google Apps Script lors de l'ajout
  - Message d'erreur explicite si conflit détecté

### À ajouter si nécessaire
- Authentification des utilisateurs
- Gestion des rôles (admin, formateur, consultation)
- Historique des modifications
- Notifications

## 🐛 Dépannage

### Les données ne se chargent pas

1. Vérifiez que l'URL Google Apps Script est correcte dans `app.js`
2. Vérifiez que `USE_DEMO_DATA` est sur `false`
3. Ouvrez la console du navigateur (F12) pour voir les erreurs
4. Vérifiez que le déploiement Google Apps Script est accessible à "Tout le monde"

### Erreur CORS

Si vous voyez une erreur CORS :
- Le problème vient souvent du fait que le script n'est pas déployé correctement
- Redéployez le script Apps Script en tant que "Application Web"
- Assurez-vous que "Qui a accès" est configuré correctement

### La PWA ne s'installe pas

- Vérifiez que vous utilisez HTTPS (requis pour les PWA)
- GitHub Pages et Netlify fournissent automatiquement HTTPS

## 📱 Installation sur mobile

1. Sur **Android** (Chrome) :
   - Ouvrez la PWA dans Chrome
   - Menu `⋮` > `Ajouter à l'écran d'accueil`

2. Sur **iOS** (Safari) :
   - Ouvrez la PWA dans Safari
   - Bouton de partage > `Sur l'écran d'accueil`

## 🔄 Mise à jour

Pour mettre à jour le script Google Apps Script :
1. Modifiez le code dans l'éditeur Apps Script
2. Créez un nouveau déploiement OU réutilisez le déploiement existant
3. Si nouvelle URL : mettez à jour `app.js`

## 💡 Améliorations futures possibles

- [ ] Export PDF du planning
- [ ] Notifications push pour les formations à venir
- [ ] Gestion des absences et remplacements
- [ ] Import/Export Excel
- [ ] Graphiques et statistiques avancées
- [ ] Mode impression optimisé
- [ ] Synchronisation en temps réel (WebSockets)
- [ ] Application mobile native (React Native)

## 📞 Support

Pour toute question ou problème :
- Consultez la console du navigateur (F12)
- Vérifiez les logs dans Apps Script (Exécutions)
- Testez d'abord en mode démo (`USE_DEMO_DATA: true`)

---

**Développé avec ❤️ pour optimiser la gestion de votre centre de formation**
