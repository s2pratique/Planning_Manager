# ✅ CONFIGURATION TERMINÉE !

Votre PWA est maintenant configurée pour se connecter à votre Google Sheets !

## 🔗 URL configurée :
```
https://script.google.com/macros/s/AKfycbyNzmVN-O9cMGnpbrXzxnXPFiOcY8lJ607IEwEMAnu8y5pBsbRNRg-HS6PbauzJRPwMBg/exec
```

## 📋 Checklist de vérification

Avant de tester l'application principale, assurez-vous que :

### ✅ 1. Google Sheets est prêt
- [x] Fichier `PLANNING_FORMATION_2026.xlsx` importé dans Google Drive
- [x] Ouvert avec Google Sheets
- [ ] La première feuille (Feuil1) contient bien vos données

### ✅ 2. Apps Script est déployé
- [ ] Vous avez copié le contenu de `google-apps-script.js` dans Apps Script
- [ ] Le script est enregistré (💾)
- [ ] Le script est déployé en tant qu'Application Web
- [ ] Configuration du déploiement :
  - Exécuter en tant que : **Moi** (votre compte)
  - Qui a accès : **Tout le monde** ou **Moi uniquement**

### ✅ 3. Permissions accordées
Lors du premier déploiement, Google vous demande des permissions :
- [ ] Vous avez cliqué sur "Vérifier les autorisations"
- [ ] Vous avez sélectionné votre compte
- [ ] Vous avez cliqué sur "Paramètres avancés"
- [ ] Vous avez cliqué sur "Accéder à [nom du projet] (non sécurisé)"
- [ ] Vous avez autorisé l'accès

⚠️ **Important** : Sans ces permissions, l'API ne pourra pas accéder à vos données !

## 🧪 Test de connexion

### ÉTAPE 1 : Tester l'API
1. Ouvrez le fichier **`test-connexion.html`** dans votre navigateur
2. Cliquez sur "1️⃣ Tester Formateurs"
3. Vous devriez voir :
   - ✅ **SUCCÈS** avec la liste de vos formateurs
   - ❌ **ERREUR** → Voir le dépannage ci-dessous

### ÉTAPE 2 : Ouvrir l'application
1. Ouvrez **`index.html`** dans votre navigateur
2. Attendez quelques secondes
3. Vous devriez voir vos vraies données s'afficher !

## 🐛 Dépannage

### Erreur : "Failed to fetch" ou "CORS"
**Cause** : Le script n'est pas déployé ou l'URL est incorrecte

**Solution** :
1. Vérifiez que le script est bien déployé dans Apps Script
2. Vérifiez que l'URL dans `app.js` correspond exactement à l'URL de déploiement
3. Essayez de redéployer le script

### Erreur : "Script function not found"
**Cause** : Le code n'a pas été copié correctement

**Solution** :
1. Retournez dans Apps Script
2. Vérifiez que le code de `google-apps-script.js` est bien présent
3. Sauvegardez et redéployez

### Erreur : "Authorization required"
**Cause** : Les permissions ne sont pas accordées

**Solution** :
1. Dans Apps Script, cliquez sur "Exécuter" > Sélectionnez `testGetData`
2. Autorisez les permissions
3. Redéployez le script

### Les données ne s'affichent pas
**Cause** : Structure du fichier différente

**Solution** :
1. Vérifiez que votre fichier Google Sheets a :
   - Les formateurs à partir de la colonne P (index 16)
   - Les données de planning à partir de la ligne 8
2. Consultez `STRUCTURE_DONNEES.md` pour voir le format attendu

### Erreur : "Cannot read property of undefined"
**Cause** : Le fichier Excel a une structure différente

**Solution** :
1. Ouvrez `google-apps-script.js`
2. Vérifiez les constantes de configuration (lignes 9-16)
3. Ajustez si nécessaire selon votre structure

## 🎯 Une fois que tout fonctionne

1. **Testez les fonctionnalités** :
   - Filtrer par formateur
   - Filtrer par mois
   - Rechercher une formation
   - Ajouter une nouvelle session

2. **Déployez en ligne** (optionnel) :
   - GitHub Pages
   - Netlify
   - Vercel
   
   Voir `GUIDE_INSTALLATION.md` pour les instructions

3. **Installez comme PWA** :
   - Sur ordinateur : Icône dans la barre d'adresse
   - Sur mobile : "Ajouter à l'écran d'accueil"

## 📞 Besoin d'aide ?

Si vous rencontrez des problèmes :

1. **Ouvrez la console du navigateur** (F12)
2. **Regardez les erreurs** dans l'onglet Console
3. **Vérifiez les requêtes** dans l'onglet Network
4. **Testez avec** `test-connexion.html` d'abord

---

**Configuration effectuée le** : $(date)
**Mode démo** : ❌ Désactivé
**Connexion Google Sheets** : ✅ Activée
