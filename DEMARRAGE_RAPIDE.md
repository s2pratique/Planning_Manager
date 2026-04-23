# 🚀 Démarrage Rapide - Formation Manager

## Test immédiat (Mode démo)

### Option 1 : Ouvrir directement le fichier
1. Double-cliquez sur `index.html`
2. L'application s'ouvre dans votre navigateur
3. **C'est tout !** 🎉 Les données de démo sont déjà chargées

### Option 2 : Serveur local (recommandé pour tester la PWA complète)

#### Avec Python (déjà installé sur Mac/Linux)
```bash
# Ouvrez un terminal dans le dossier des fichiers
python3 -m http.server 8000

# Puis ouvrez : http://localhost:8000
```

#### Avec Node.js
```bash
# Installez serve globalement (une seule fois)
npm install -g serve

# Lancez le serveur
serve

# Ouvre automatiquement dans le navigateur
```

#### Avec l'extension VS Code
- Installez "Live Server" dans VS Code
- Clic droit sur `index.html` → "Open with Live Server"

## ✅ Ce que vous pouvez tester en mode démo

- ✓ Vue calendrier avec sessions colorées
- ✓ Vue tableau récapitulatif
- ✓ Recherche en temps réel
- ✓ Filtres par formateur et par mois
- ✓ Ajout de nouvelles sessions (stockées localement)
- ✓ Statistiques dynamiques
- ✓ Interface responsive (testez sur mobile)
- ✓ Thème sombre moderne

## 🔧 Passer en mode production

Une fois que vous avez testé et que tout vous convient :

1. **Préparez Google Sheets**
   - Importez votre Excel dans Google Drive
   - Ouvrez-le avec Google Sheets

2. **Déployez le script Apps Script**
   - Extensions > Apps Script
   - Collez le contenu de `google-apps-script.js`
   - Déployer > Application Web
   - Copiez l'URL

3. **Configurez la PWA**
   - Ouvrez `app.js`
   - Ligne 8 : Collez votre URL Google Apps Script
   - Ligne 11 : Changez `USE_DEMO_DATA: true` → `false`

4. **Déployez en ligne**
   - GitHub Pages (gratuit, facile)
   - Netlify (gratuit, glisser-déposer)
   - Vercel (gratuit, rapide)

Voir le `GUIDE_INSTALLATION.md` pour les détails complets.

## 📱 Installer comme application

Une fois déployé en ligne avec HTTPS :

### Sur ordinateur (Chrome/Edge)
- Icône ⊕ dans la barre d'adresse → "Installer Formation Manager"

### Sur Android
- Menu ⋮ → "Ajouter à l'écran d'accueil"

### Sur iPhone/iPad
- Bouton Partage → "Sur l'écran d'accueil"

## 🎨 Personnalisation

### Changer les couleurs
Ouvrez `index.html` et modifiez les variables CSS (lignes 16-26) :

```css
:root {
  --midnight: #0f0f23;      /* Fond principal */
  --accent-cyan: #00d9ff;   /* Couleur principale */
  --accent-pink: #ff006e;   /* Couleur secondaire */
  /* ... */
}
```

### Changer le titre
- Dans `index.html` : ligne 7 et ligne 174
- Dans `manifest.json` : lignes 2-3

## ❓ Problèmes courants

### L'application ne s'affiche pas correctement
- Assurez-vous d'ouvrir `index.html` (pas un autre fichier)
- Vérifiez que tous les fichiers sont dans le même dossier
- Essayez avec un serveur local plutôt qu'en double-clic

### Le Service Worker ne fonctionne pas
- Normal en mode fichier local (`file://`)
- Utilisez un serveur local ou déployez en ligne pour tester la PWA

### Les données de démo ne s'affichent pas
- Ouvrez la console (F12) pour voir les erreurs
- Vérifiez que `USE_DEMO_DATA: true` dans `app.js` (ligne 11)

## 📞 Besoin d'aide ?

1. Consultez `GUIDE_INSTALLATION.md` pour les instructions détaillées
2. Regardez `README.md` pour l'architecture technique
3. Vérifiez `STRUCTURE_DONNEES.md` pour comprendre le format des données

---

**Bon test ! 🎉**
