# 📚 Formation Manager PWA

Progressive Web App moderne pour gérer votre planning de formation 2026 avec synchronisation bidirectionnelle Google Sheets.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![PWA](https://img.shields.io/badge/PWA-ready-purple)

## ✨ Caractéristiques principales

### 🎯 Fonctionnalités métier
- **Gestion complète du planning** : Visualisation et modification des sessions de formation
- **Double vue** : Calendrier mensuel et tableau récapitulatif
- **Filtres avancés** : Recherche, filtrage par formateur et par mois
- **Règle métier intégrée** : Empêche la double réservation d'un formateur le même jour
- **Statistiques en temps réel** : Sessions planifiées, formateurs actifs, prévisions

### 💻 Fonctionnalités techniques
- **PWA complète** : Installable, fonctionne hors ligne
- **Synchronisation bidirectionnelle** : Lecture et écriture vers Google Sheets via Apps Script
- **Interface moderne** : Design cyberpunk, animations fluides
- **Responsive** : S'adapte à tous les écrans (mobile, tablette, desktop)
- **Performance optimisée** : Cache intelligent, Service Worker

## 📁 Structure du projet

```
formation-manager/
├── index.html              # Interface principale de la PWA
├── app.js                  # Logique applicative JavaScript
├── manifest.json           # Configuration PWA
├── service-worker.js       # Gestion du cache et mode hors ligne
├── google-apps-script.js   # Script backend pour Google Sheets
├── GUIDE_INSTALLATION.md   # Guide d'installation pas à pas
└── README.md              # Ce fichier
```

## 🏗️ Architecture

### Frontend (PWA)
```
┌─────────────────────────────────────────┐
│          Interface utilisateur          │
│     (HTML/CSS/JS - Design moderne)      │
└──────────────────┬──────────────────────┘
                   │
                   ├─ Service Worker (Cache, Offline)
                   │
                   ├─ State Management (Filtres, Vues)
                   │
                   └─ API Client
                      │
                      ▼
```

### Backend (Google Apps Script)
```
┌─────────────────────────────────────────┐
│         Google Apps Script API          │
│     (Déployé comme Web App)             │
└──────────────────┬──────────────────────┘
                   │
                   ├─ doGet()  : Lecture données
                   ├─ doPost() : Écriture données
                   │
                   ├─ getTrainers()
                   ├─ getSessions()
                   ├─ updateSession() [+ validation]
                   └─ deleteSession()
                      │
                      ▼
┌─────────────────────────────────────────┐
│          Google Sheets                  │
│     Structure matricielle :             │
│     - Colonnes = Formateurs             │
│     - Lignes = Jours                    │
└─────────────────────────────────────────┘
```

## 🔄 Flux de données

### Lecture (GET)
```
PWA → doGet(action='getFullData') → Google Sheets → 
  → Parsing matrice → JSON structuré → PWA
```

### Écriture (POST)
```
PWA → doPost(action='updateSession') → 
  → Validation règle métier → 
  → Trouver cellule (intersection Date/Formateur) → 
  → Écrire dans Google Sheets → 
  → Confirmation → PWA
```

## 🎨 Design System

### Palette de couleurs
```css
--midnight: #0f0f23       /* Fond principal */
--deep-blue: #16213e      /* Fond secondaire */
--accent-cyan: #00d9ff    /* Accent principal */
--accent-pink: #ff006e    /* Accent secondaire */
--accent-yellow: #ffbe0b  /* Warnings, badges */
--success: #06ffa5        /* Succès */
```

### Typographie
- **Display** : Space Mono (monospace moderne)
- **Body** : Outfit (sans-serif élégante)

### Composants
- Cards avec hover effects et gradients
- Boutons avec animations shimmer
- Modaux avec backdrop blur
- Tableaux avec zebra striping subtil

## 🔧 Configuration Google Apps Script

### Endpoints disponibles

#### GET `/exec?action=getTrainers`
Retourne la liste des formateurs

**Réponse :**
```json
[
  {
    "id": "F001",
    "nom": "Stéphane SANGORRIN",
    "type": "permanent",
    "specialites": "R482-484-485...",
    "tarif": "CACES®",
    "telephone": "06 67 30 86 72",
    "email": "sango64@me.com",
    "colonneExcel": 16
  }
]
```

#### GET `/exec?action=getSessions`
Retourne toutes les sessions

**Réponse :**
```json
[
  {
    "id": "S12_16",
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
]
```

#### GET `/exec?action=getFullData`
Retourne formateurs + sessions

#### POST `/exec` (action: updateSession)
Ajoute ou modifie une session

**Requête :**
```json
{
  "action": "updateSession",
  "session": {
    "date": "2026-01-15",
    "formateurId": "F001",
    "typeFormation": "CACES R489",
    "lieu": "INTER BENESSE",
    "action": "add"
  }
}
```

**Réponse (succès) :**
```json
{
  "success": true,
  "message": "Session mise à jour avec succès",
  "row": 22,
  "col": 17
}
```

**Réponse (erreur - règle métier) :**
```json
{
  "success": false,
  "error": "Le formateur a déjà une formation prévue ce jour-là",
  "existing": "CACES R485"
}
```

#### POST `/exec` (action: deleteSession)
Supprime une session (vide la cellule)

## 🔒 Règles métier implémentées

### 1. Unicité par jour et formateur
**Règle** : Un formateur ne peut pas avoir deux entrées différentes sur la même ligne (même jour).

**Implémentation** :
```javascript
// Dans updateSession()
const existingValue = sheet.getRange(targetRow, trainer.colonneExcel + 1).getValue();

if (session.action === 'add' && existingValue && existingValue.toString().trim() !== '') {
  return { 
    success: false, 
    error: 'Le formateur a déjà une formation prévue ce jour-là',
    existing: existingValue.toString()
  };
}
```

**Où** : Vérification côté serveur (Google Apps Script)

**Pourquoi** : Garantit l'intégrité des données, empêche les doublons

## 🚀 Installation rapide

1. **Importez votre Excel dans Google Sheets**

2. **Copiez le script Apps Script**
   ```
   Extensions > Apps Script > Coller google-apps-script.js
   ```

3. **Déployez comme Web App**
   ```
   Déployer > Application Web > Copier l'URL
   ```

4. **Configurez la PWA**
   ```javascript
   // Dans app.js
   APPS_SCRIPT_URL: 'VOTRE_URL_ICI'
   USE_DEMO_DATA: false
   ```

5. **Déployez la PWA**
   ```
   GitHub Pages / Netlify / Vercel
   ```

📖 **Guide détaillé** : Voir `GUIDE_INSTALLATION.md`

## 🧪 Mode démo

La PWA inclut un mode démo avec données générées :

```javascript
const CONFIG = {
  USE_DEMO_DATA: true  // Activer le mode démo
};
```

Le mode démo génère :
- 8 formateurs fictifs
- 90 jours de sessions
- Données réalistes pour tester l'interface

## 📱 PWA Features

### Installation
- **Android/Chrome** : Menu > Ajouter à l'écran d'accueil
- **iOS/Safari** : Partage > Sur l'écran d'accueil

### Mode hors ligne
- Cache intelligent des ressources
- Synchronisation différée possible
- Fonctionnement sans connexion

### Manifest
```json
{
  "name": "Formation Manager 2026",
  "display": "standalone",
  "theme_color": "#1a1a2e",
  "icons": [...]
}
```

## 🔍 Debugging

### Console du navigateur
```javascript
// Activer les logs détaillés
localStorage.setItem('debug', 'true');
```

### Apps Script Logger
```javascript
// Dans Google Apps Script
Logger.log('Données chargées:', data);
```

### Test de connexion
1. Ouvrir la PWA
2. F12 > Console
3. Cliquer sur "🔄 Actualiser"
4. Vérifier les requêtes réseau (onglet Network)

## 🎯 Roadmap

### Version 1.1 (Q2 2026)
- [ ] Notifications push
- [ ] Export PDF
- [ ] Historique des modifications
- [ ] Gestion des absences

### Version 2.0 (Q3 2026)
- [ ] Authentification multi-utilisateurs
- [ ] Rôles et permissions
- [ ] Synchronisation temps réel
- [ ] Application mobile native

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Créez une branche (`git checkout -b feature/amelioration`)
3. Commit (`git commit -m 'Ajout fonctionnalité X'`)
4. Push (`git push origin feature/amelioration`)
5. Ouvrez une Pull Request

## 📄 License

MIT License - Voir LICENSE pour plus de détails

## 🙏 Remerciements

- Design inspiré par les interfaces modernes cyberpunk
- Typographies : Google Fonts (Space Mono, Outfit)
- Service Worker : Workbox patterns

---

**Créé avec ❤️ pour simplifier la gestion des formations**

📧 Contact : [votre-email]  
🌐 Demo : [url-demo]  
📦 Repository : [url-github]
