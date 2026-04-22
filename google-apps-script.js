/**
 * GOOGLE APPS SCRIPT - GESTION PLANNING FORMATION 2026
 * 
 * À copier dans l'éditeur de script lié à votre Google Sheets
 * Extensions > Apps Script
 */

// Configuration
const CONFIG = {
  SHEET_NAME: 'Feuil1',
  FIRST_TRAINER_COL: 16,  // Colonne P (index 16)
  LAST_TRAINER_COL: 39,   // Ajustez selon vos besoins
  HEADER_ROW: 2,          // Ligne 3 (index 2) - noms des formateurs
  FIRST_DATA_ROW: 7,      // Ligne 8 (index 7) - début des dates
  DATE_COL: 3,            // Colonne D - jour du mois
  DAY_COL: 2,             // Colonne C - jour de la semaine
  MONTH_COL: 0,           // Colonne A - mois
  WEEK_COL: 1             // Colonne B - numéro de semaine
};

/**
 * Fonction à déployer en Web App
 * Retourne les données selon le paramètre "action"
 */
function doGet(e) {
  const action = e.parameter.action;
  
  try {
    if (action === 'getTrainers') {
      return ContentService
        .createTextOutput(JSON.stringify(getTrainers()))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'getSessions') {
      return ContentService
        .createTextOutput(JSON.stringify(getSessions()))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'getFullData') {
      return ContentService
        .createTextOutput(JSON.stringify(getFullData()))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Action invalide' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Fonction pour gérer les requêtes POST (ajout/modification)
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'updateSession') {
      const result = updateSession(data.session);
      return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'deleteSession') {
      const result = deleteSession(data.date, data.trainerId);
      return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Action invalide' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Récupère la liste des formateurs
 */
function getTrainers() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  const trainers = [];
  
  // Ligne 3 (index 2) : Noms des formateurs
  const namesRow = sheet.getRange(CONFIG.HEADER_ROW + 1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Ligne 2 (index 1) : Type (PERMANENTS / VACATAIRES)
  const typesRow = sheet.getRange(CONFIG.HEADER_ROW, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Ligne 4 (index 3) : Spécialités
  const specialitiesRow = sheet.getRange(CONFIG.HEADER_ROW + 2, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Ligne 5 (index 4) : Tarifs
  const ratesRow = sheet.getRange(CONFIG.HEADER_ROW + 3, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Ligne 6 (index 5) : Téléphones
  const phonesRow = sheet.getRange(CONFIG.HEADER_ROW + 4, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Ligne 7 (index 6) : Emails
  const emailsRow = sheet.getRange(CONFIG.HEADER_ROW + 5, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  for (let col = CONFIG.FIRST_TRAINER_COL; col <= CONFIG.LAST_TRAINER_COL; col++) {
    const name = namesRow[col];
    
    if (name && name.toString().trim() !== '' && name !== '…') {
      trainers.push({
        id: 'F' + String(col - CONFIG.FIRST_TRAINER_COL + 1).padStart(3, '0'),
        nom: name.toString().trim(),
        type: typesRow[col] && typesRow[col].toString().trim() !== '' ? typesRow[col].toString().trim() : 'permanent',
        specialites: specialitiesRow[col] || '',
        tarif: ratesRow[col] || '',
        telephone: phonesRow[col] || '',
        email: emailsRow[col] || '',
        colonneExcel: col
      });
    }
  }
  
  return trainers;
}

/**
 * Récupère toutes les sessions de formation
 */
function getSessions() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  const sessions = [];
  const trainers = getTrainers();
  const lastRow = sheet.getLastRow();
  
  let currentMonth = '';
  let currentYear = 2026;
  
  for (let row = CONFIG.FIRST_DATA_ROW; row < lastRow; row++) {
    const rowData = sheet.getRange(row + 1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Récupérer le mois si présent
    if (rowData[CONFIG.MONTH_COL] && rowData[CONFIG.MONTH_COL].toString().trim() !== '') {
      currentMonth = rowData[CONFIG.MONTH_COL].toString().trim();
    }
    
    const dayOfMonth = rowData[CONFIG.DATE_COL];
    const dayOfWeek = rowData[CONFIG.DAY_COL];
    
    if (!dayOfMonth || !currentMonth) continue;
    
    // Construire la date
    const date = buildDate(currentYear, currentMonth, dayOfMonth);
    
    // Parcourir chaque formateur
    trainers.forEach(trainer => {
      const cellValue = rowData[trainer.colonneExcel];
      
      if (cellValue && cellValue.toString().trim() !== '') {
        const formation = cellValue.toString().trim();
        
        sessions.push({
          id: `S${row}_${trainer.colonneExcel}`,
          date: date,
          jourSemaine: dayOfWeek || '',
          formateurId: trainer.id,
          formateurNom: trainer.nom,
          typeFormation: formation,
          lieu: determinerLieu(formation),
          statut: determinerStatut(formation),
          ligneExcel: row + 1,
          colonneExcel: trainer.colonneExcel
        });
      }
    });
  }
  
  return sessions;
}

/**
 * Récupère toutes les données (formateurs + sessions)
 */
function getFullData() {
  return {
    formateurs: getTrainers(),
    sessions: getSessions()
  };
}

/**
 * Met à jour une session dans le Google Sheets
 * RÈGLE MÉTIER: Vérifie qu'un formateur n'a pas déjà une entrée sur la même ligne
 */
function updateSession(session) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  const trainers = getTrainers();
  
  // Trouver le formateur
  const trainer = trainers.find(t => t.id === session.formateurId);
  if (!trainer) {
    return { success: false, error: 'Formateur non trouvé' };
  }
  
  // Trouver la ligne correspondante à la date
  const targetRow = findRowByDate(session.date);
  if (!targetRow) {
    return { success: false, error: 'Date non trouvée dans le planning' };
  }
  
  // RÈGLE MÉTIER: Vérifier que le formateur n'a pas déjà une entrée sur cette ligne
  const existingValue = sheet.getRange(targetRow, trainer.colonneExcel + 1).getValue();
  
  if (session.action === 'add' && existingValue && existingValue.toString().trim() !== '') {
    return { 
      success: false, 
      error: 'Le formateur a déjà une formation prévue ce jour-là',
      existing: existingValue.toString()
    };
  }
  
  // Mettre à jour la cellule
  try {
    sheet.getRange(targetRow, trainer.colonneExcel + 1).setValue(session.typeFormation);
    
    return { 
      success: true, 
      message: 'Session mise à jour avec succès',
      row: targetRow,
      col: trainer.colonneExcel + 1
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

/**
 * Supprime une session (vide la cellule)
 */
function deleteSession(date, trainerId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  const trainers = getTrainers();
  
  const trainer = trainers.find(t => t.id === trainerId);
  if (!trainer) {
    return { success: false, error: 'Formateur non trouvé' };
  }
  
  const targetRow = findRowByDate(date);
  if (!targetRow) {
    return { success: false, error: 'Date non trouvée' };
  }
  
  try {
    sheet.getRange(targetRow, trainer.colonneExcel + 1).setValue('');
    return { success: true, message: 'Session supprimée avec succès' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

/**
 * Trouve la ligne correspondant à une date
 */
function findRowByDate(targetDate) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  const lastRow = sheet.getLastRow();
  
  let currentMonth = '';
  const targetDateObj = new Date(targetDate);
  
  for (let row = CONFIG.FIRST_DATA_ROW; row < lastRow; row++) {
    const rowData = sheet.getRange(row + 1, 1, 1, 4).getValues()[0];
    
    if (rowData[CONFIG.MONTH_COL] && rowData[CONFIG.MONTH_COL].toString().trim() !== '') {
      currentMonth = rowData[CONFIG.MONTH_COL].toString().trim();
    }
    
    const dayOfMonth = rowData[CONFIG.DATE_COL];
    
    if (dayOfMonth && currentMonth) {
      const date = buildDate(2026, currentMonth, dayOfMonth);
      const dateObj = new Date(date);
      
      if (dateObj.getTime() === targetDateObj.getTime()) {
        return row + 1;
      }
    }
  }
  
  return null;
}

/**
 * Construit une date au format ISO à partir du mois et du jour
 */
function buildDate(year, monthName, day) {
  const months = {
    'JANVIER': '01', 'FEVRIER': '02', 'MARS': '03', 'AVRIL': '04',
    'MAI': '05', 'JUIN': '06', 'JUILLET': '07', 'AOUT': '08',
    'SEPTEMBRE': '09', 'OCTOBRE': '10', 'NOVEMBRE': '11', 'DECEMBRE': '12'
  };
  
  const month = months[monthName.toUpperCase()] || '01';
  const dayStr = String(day).padStart(2, '0');
  
  return `${year}-${month}-${dayStr}`;
}

/**
 * Détermine le lieu à partir du type de formation
 */
function determinerLieu(formation) {
  const formationUpper = formation.toUpperCase();
  
  if (formationUpper.includes('BENESSE')) return 'INTER BENESSE';
  if (formationUpper.includes('BAYONNE')) return 'INTER BAYONNE';
  if (formationUpper.includes('BIDART')) return 'BIDART';
  if (formationUpper.includes('INTRA')) return 'INTRA';
  
  return 'Non spécifié';
}

/**
 * Détermine le statut à partir du type de formation
 */
function determinerStatut(formation) {
  const formationUpper = formation.toUpperCase();
  
  if (formationUpper.includes('FERIE')) return 'ferie';
  if (formationUpper.includes('CONGES')) return 'conges';
  if (formationUpper.includes('NON DISPO')) return 'indisponible';
  if (formationUpper.includes('DISPO')) return 'disponible';
  
  return 'planifie';
}

/**
 * Fonction de test pour vérifier que tout fonctionne
 */
function testGetData() {
  const data = getFullData();
  Logger.log('Formateurs: ' + data.formateurs.length);
  Logger.log('Sessions: ' + data.sessions.length);
  Logger.log(JSON.stringify(data, null, 2));
}
