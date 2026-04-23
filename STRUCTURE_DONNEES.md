# 📊 STRUCTURE DES DONNÉES - Formation Manager

## 🎯 Vue d'ensemble

Ce document décrit la structure des données utilisée pour transformer le planning Excel matriciel (formateurs en colonnes, jours en lignes) en format JSON exploitable.

## 📋 Structure du fichier Excel source

### Organisation du fichier

```
PLANNING_FORMATION_2026.xlsx
│
├── Feuil1 (UTILISÉE)
│   ├── Lignes 0-6 : En-têtes et métadonnées
│   │   ├── Ligne 0 : Catégorie générale (FORMATEUR)
│   │   ├── Ligne 1 : Type (PERMANENTS / VACATAIRES)
│   │   ├── Ligne 2 : Noms des formateurs
│   │   ├── Ligne 3 : Spécialités
│   │   ├── Ligne 4 : Tarifs
│   │   ├── Ligne 5 : Téléphones
│   │   └── Ligne 6 : Emails
│   │
│   └── Lignes 7+ : Données de planning
│       ├── Colonne 0 : Mois (JANVIER, FEVRIER...)
│       ├── Colonne 1 : Numéro de semaine
│       ├── Colonne 2 : Jour de la semaine (L, M, M, J, V, S, D)
│       ├── Colonne 3 : Jour du mois (1-31)
│       └── Colonnes 16+ : Sessions par formateur
│
└── Feuil2 (NON UTILISÉE)
```

### Mapping des colonnes

| Colonne Excel | Index | Contenu                    |
|---------------|-------|----------------------------|
| A             | 0     | Mois                       |
| B             | 1     | Semaine                    |
| C             | 2     | Jour de la semaine         |
| D             | 3     | Jour du mois               |
| E-O           | 4-15  | Métadonnées diverses       |
| P             | 16    | Premier formateur          |
| Q-...         | 17+   | Formateurs suivants        |

## 🗂️ Structure JSON des données

### 1. Objet Formateur

**Source** : Lignes 0-6, colonnes 16+

```json
{
  "id": "string",           // Identifiant unique généré (ex: "F001", "F002")
  "nom": "string",          // Ligne 2 - Nom complet du formateur
  "type": "string",         // Ligne 1 - "permanent" ou "vacataire"
  "specialites": "string",  // Ligne 3 - Domaines de compétence
  "tarif": "string",        // Ligne 4 - Tarif journalier ou type
  "telephone": "string",    // Ligne 5 - Numéro de téléphone
  "email": "string",        // Ligne 6 - Adresse email
  "colonneExcel": number    // Position dans le fichier (pour l'écriture)
}
```

**Exemple concret** :
```json
{
  "id": "F001",
  "nom": "Stéphane SANGORRIN",
  "type": "permanent",
  "specialites": "R482-484-485-486-487-489-490 - TH - Echafaudage",
  "tarif": "CACES®",
  "telephone": "06 67 30 86 72",
  "email": "sango64@me.com",
  "colonneExcel": 16
}
```

### 2. Objet Session

**Source** : Intersection ligne (date) × colonne (formateur)

```json
{
  "id": "string",           // Identifiant unique (ex: "S12_16" = ligne 12, col 16)
  "date": "string",         // Format ISO 8601 : "YYYY-MM-DD"
  "jourSemaine": "string",  // Abréviation : "L", "M", "M", "J", "V", "S", "D"
  "formateurId": "string",  // Référence à l'ID formateur
  "formateurNom": "string", // Nom du formateur (dénormalisé pour performance)
  "typeFormation": "string",// Contenu de la cellule (ex: "CACES R489")
  "lieu": "string",         // Lieu déduit ou spécifié
  "statut": "string",       // État de la session (voir énumération ci-dessous)
  "ligneExcel": number,     // Position ligne dans Excel (pour l'écriture)
  "colonneExcel": number    // Position colonne dans Excel (pour l'écriture)
}
```

**Exemple concret** :
```json
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
```

### 3. Énumération des statuts

```javascript
const STATUTS = {
  PLANIFIE: 'planifie',           // Session normale programmée
  FERIE: 'ferie',                 // Jour férié
  CONGES: 'conges',               // Formateur en congés
  INDISPONIBLE: 'indisponible',   // Formateur non disponible
  DISPONIBLE: 'disponible',       // Formateur disponible (pas de formation)
  ANNULE: 'annule'                // Session annulée (futur)
};
```

**Détection automatique** :
```javascript
function determinerStatut(formation) {
  const formationUpper = formation.toUpperCase();
  
  if (formationUpper.includes('FERIE')) return 'ferie';
  if (formationUpper.includes('CONGES')) return 'conges';
  if (formationUpper.includes('NON DISPO')) return 'indisponible';
  if (formationUpper.includes('DISPO')) return 'disponible';
  
  return 'planifie';
}
```

### 4. Détection du lieu

```javascript
function determinerLieu(formation) {
  const formationUpper = formation.toUpperCase();
  
  if (formationUpper.includes('BENESSE')) return 'INTER BENESSE';
  if (formationUpper.includes('BAYONNE')) return 'INTER BAYONNE';
  if (formationUpper.includes('BIDART')) return 'BIDART';
  if (formationUpper.includes('INTRA')) return 'INTRA';
  
  return 'Non spécifié';
}
```

## 🔄 Transformation des données

### Du matriciel au JSON

#### Étape 1 : Extraction des formateurs
```
Excel (ligne 2, cols 16+)  →  Array<Formateur>
```

```javascript
for (col = 16; col <= lastCol; col++) {
  const nom = sheet.getRange(3, col + 1).getValue();
  const type = sheet.getRange(2, col + 1).getValue();
  const specialites = sheet.getRange(4, col + 1).getValue();
  // ...
  
  formateurs.push({
    id: `F${col - 15}`,
    nom, type, specialites,
    colonneExcel: col
  });
}
```

#### Étape 2 : Extraction des sessions
```
Pour chaque ligne (date) :
  Pour chaque colonne (formateur) :
    Si cellule non vide → créer Session
```

```javascript
for (row = 7; row < lastRow; row++) {
  const date = construireDate(mois, jour);
  
  formateurs.forEach(formateur => {
    const cellValue = sheet.getRange(row + 1, formateur.colonneExcel + 1).getValue();
    
    if (cellValue && cellValue !== '') {
      sessions.push({
        id: `S${row}_${formateur.colonneExcel}`,
        date,
        formateurId: formateur.id,
        typeFormation: cellValue,
        // ...
      });
    }
  });
}
```

### Construction des dates

```javascript
function buildDate(year, monthName, day) {
  const months = {
    'JANVIER': '01', 'FEVRIER': '02', 'MARS': '03',
    'AVRIL': '04', 'MAI': '05', 'JUIN': '06',
    'JUILLET': '07', 'AOUT': '08', 'SEPTEMBRE': '09',
    'OCTOBRE': '10', 'NOVEMBRE': '11', 'DECEMBRE': '12'
  };
  
  const month = months[monthName.toUpperCase()];
  const dayStr = String(day).padStart(2, '0');
  
  return `${year}-${month}-${dayStr}`;  // "2026-01-05"
}
```

## 📝 Format de réponse API

### GET /exec?action=getFullData

```json
{
  "formateurs": [
    {
      "id": "F001",
      "nom": "Stéphane SANGORRIN",
      "type": "permanent",
      "specialites": "R482-484-485-486-487-489-490 - TH - Echafaudage",
      "tarif": "CACES®",
      "telephone": "06 67 30 86 72",
      "email": "sango64@me.com",
      "colonneExcel": 16
    },
    {
      "id": "F002",
      "nom": "Erwan SANGORRIN",
      "type": "permanent",
      "specialites": "R482-484-485-486--489- - TH - Echafaudage _ AIPR",
      "tarif": "CACES®",
      "telephone": "06 89 46 85 91",
      "email": "erwan.sangorrin@live.fr",
      "colonneExcel": 17
    }
  ],
  "sessions": [
    {
      "id": "S11_16",
      "date": "2026-01-05",
      "jourSemaine": "L",
      "formateurId": "F001",
      "formateurNom": "Stéphane SANGORRIN",
      "typeFormation": "DURUTY",
      "lieu": "INTER BENESSE",
      "statut": "planifie",
      "ligneExcel": 12,
      "colonneExcel": 16
    },
    {
      "id": "S11_17",
      "date": "2026-01-05",
      "jourSemaine": "L",
      "formateurId": "F002",
      "formateurNom": "Erwan SANGORRIN",
      "typeFormation": "DURUTY AIPR",
      "lieu": "INTER BENESSE",
      "statut": "planifie",
      "ligneExcel": 12,
      "colonneExcel": 17
    }
  ]
}
```

## 🔍 Recherche et filtrage

### Index de recherche

Pour optimiser les recherches, créer des index :

```javascript
// Index par formateur
const parFormateur = {};
sessions.forEach(s => {
  if (!parFormateur[s.formateurId]) {
    parFormateur[s.formateurId] = [];
  }
  parFormateur[s.formateurId].push(s);
});

// Index par date
const parDate = {};
sessions.forEach(s => {
  if (!parDate[s.date]) {
    parDate[s.date] = [];
  }
  parDate[s.date].push(s);
});

// Index par mois
const parMois = {};
sessions.forEach(s => {
  const mois = s.date.substring(0, 7); // "2026-01"
  if (!parMois[mois]) {
    parMois[mois] = [];
  }
  parMois[mois].push(s);
});
```

### Filtrage côté client

```javascript
function filtrerSessions(sessions, filtres) {
  return sessions.filter(s => {
    // Recherche textuelle
    if (filtres.search) {
      const search = filtres.search.toLowerCase();
      const match = 
        s.formateurNom.toLowerCase().includes(search) ||
        s.typeFormation.toLowerCase().includes(search) ||
        s.lieu.toLowerCase().includes(search);
      if (!match) return false;
    }
    
    // Filtre formateur
    if (filtres.formateurId && s.formateurId !== filtres.formateurId) {
      return false;
    }
    
    // Filtre mois
    if (filtres.mois && s.date.substring(0, 7) !== filtres.mois) {
      return false;
    }
    
    return true;
  });
}
```

## 📊 Statistiques

### Calculs utiles

```javascript
// Total sessions
const totalSessions = sessions.length;

// Sessions par formateur
const sessionsParFormateur = {};
sessions.forEach(s => {
  sessionsParFormateur[s.formateurId] = 
    (sessionsParFormateur[s.formateurId] || 0) + 1;
});

// Sessions à venir
const maintenant = new Date();
const sessionsAvenir = sessions.filter(s => 
  new Date(s.date) >= maintenant
);

// Taux d'occupation par formateur
formateurs.forEach(f => {
  const joursOuvres = 250; // par an
  const sessions = sessionsParFormateur[f.id] || 0;
  f.tauxOccupation = (sessions / joursOuvres * 100).toFixed(1);
});
```

## 🔐 Validation des données

### Règles de validation

```javascript
function validerSession(session) {
  const erreurs = [];
  
  // Date valide
  if (!session.date || !/^\d{4}-\d{2}-\d{2}$/.test(session.date)) {
    erreurs.push('Date invalide');
  }
  
  // Formateur existe
  if (!formateurs.find(f => f.id === session.formateurId)) {
    erreurs.push('Formateur non trouvé');
  }
  
  // Type de formation non vide
  if (!session.typeFormation || session.typeFormation.trim() === '') {
    erreurs.push('Type de formation requis');
  }
  
  // Pas de doublon (règle métier)
  const existante = sessions.find(s => 
    s.date === session.date && 
    s.formateurId === session.formateurId &&
    s.id !== session.id
  );
  if (existante) {
    erreurs.push('Le formateur a déjà une session ce jour-là');
  }
  
  return erreurs;
}
```

---

**Document de référence** - Version 1.0  
Dernière mise à jour : Avril 2026
