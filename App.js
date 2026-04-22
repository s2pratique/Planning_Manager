/**
 * FORMATION MANAGER - Application JavaScript
 * PWA pour la gestion du planning de formation 2026
 */

// Configuration - À MODIFIER avec votre URL Google Apps Script
const CONFIG = {
  // Remplacez par l'URL de votre déploiement Google Apps Script
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwJ_2fRd1jG6ZxcbVt8DwF4Rj8cs68jo3DaWct3gsk4WNeWQo9CNw3b7V7M447tiEmHIw/exec',
  
  // Données de démonstration (sera remplacé par les vraies données)
  USE_DEMO_DATA: false
};

// État global de l'application
const state = {
  formateurs: [],
  sessions: [],
  filteredSessions: [],
  currentView: 'calendar',
  filters: {
    search: '',
    trainer: '',
    month: ''
  }
};

/**
 * Initialisation de l'application
 */
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  attachEventListeners();
});

async function initializeApp() {
  try {
    showLoading(true);
    await loadData();
    updateStats();
    populateFilters();
    renderCurrentView();
    showLoading(false);
  } catch (error) {
    console.error('Erreur d\'initialisation:', error);
    showError('Erreur lors du chargement des données');
    showLoading(false);
  }
}

/**
 * Chargement des données depuis Google Apps Script ou données de démo
 */
async function loadData() {
  if (CONFIG.USE_DEMO_DATA) {
    // Données de démonstration
    state.formateurs = generateDemoTrainers();
    state.sessions = generateDemoSessions();
    state.filteredSessions = [...state.sessions];
    return;
  }
  
  try {
    const response = await fetch(`${CONFIG.APPS_SCRIPT_URL}?action=getFullData`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    state.formateurs = data.formateurs;
    state.sessions = data.sessions;
    state.filteredSessions = [...state.sessions];
  } catch (error) {
    console.error('Erreur de chargement:', error);
    throw error;
  }
}

/**
 * Génère des données de démonstration
 */
function generateDemoTrainers() {
  return [
    { id: 'F001', nom: 'Stéphane SANGORRIN', type: 'permanent', specialites: 'CACES R482-R489', telephone: '06 67 30 86 72', email: 'sango64@me.com' },
    { id: 'F002', nom: 'Erwan SANGORRIN', type: 'permanent', specialites: 'CACES R485-R489', telephone: '06 89 46 85 91', email: 'erwan.sangorrin@live.fr' },
    { id: 'F003', nom: 'Fabrice ETCHEBARNE', type: 'permanent', specialites: 'CACES R489-R485', telephone: '06 26 37 11 45', email: 'fabrice.etchebarne@gmail.com' },
    { id: 'F004', nom: 'Théo LAPPEL', type: 'permanent', specialites: 'Formateur polyvalent', telephone: '06 03 06 11 29', email: '' },
    { id: 'F005', nom: 'Stéphane POUJADE', type: 'vacataire', specialites: 'R489-R486', telephone: '06 17 99 66 83', email: 'tpspoujade@gmail.com' },
    { id: 'F006', nom: 'Serge VIEIRA', type: 'vacataire', specialites: 'CACES R489', telephone: '06 01 01 87 98', email: 'vieira.serge40@gmail.com' },
    { id: 'F007', nom: 'Pascal ST ESTEBEN', type: 'vacataire', specialites: 'HAB ELEC', telephone: '698734960', email: 'bidberri@gmail.com' },
    { id: 'F008', nom: 'Sébastien OLHARAN', type: 'vacataire', specialites: 'HAB ELEC - AIPR', telephone: '06 21 38 31 03', email: 'sebem97@hotmail.com' }
  ];
}

function generateDemoSessions() {
  const sessions = [];
  const today = new Date();
  const trainers = generateDemoTrainers();
  const formations = ['CACES R489', 'CACES R485', 'HAB ELEC', 'AIPR', 'SST', 'PEMP - NACELLES', 'Travail en hauteur'];
  const lieux = ['INTER BENESSE', 'INTER BAYONNE', 'INTRA', 'BIDART'];
  
  // Générer des sessions pour les 3 prochains mois
  for (let i = 0; i < 90; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    // Sauter les week-ends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Ajouter quelques sessions aléatoires par jour
    const numSessions = Math.floor(Math.random() * 4);
    
    for (let j = 0; j < numSessions; j++) {
      const trainer = trainers[Math.floor(Math.random() * trainers.length)];
      const formation = formations[Math.floor(Math.random() * formations.length)];
      const lieu = lieux[Math.floor(Math.random() * lieux.length)];
      
      sessions.push({
        id: `S${sessions.length + 1}`,
        date: date.toISOString().split('T')[0],
        jourSemaine: ['D', 'L', 'M', 'M', 'J', 'V', 'S'][date.getDay()],
        formateurId: trainer.id,
        formateurNom: trainer.nom,
        typeFormation: formation,
        lieu: lieu,
        statut: 'planifie'
      });
    }
  }
  
  return sessions;
}

/**
 * Mise à jour des statistiques
 */
function updateStats() {
  const totalSessions = state.sessions.length;
  const totalTrainers = state.formateurs.length;
  
  // Calculer les sessions à venir ce mois
  const today = new Date();
  const currentMonth = today.getMonth();
  const upcomingSessions = state.sessions.filter(s => {
    const sessionDate = new Date(s.date);
    return sessionDate.getMonth() === currentMonth && sessionDate >= today;
  }).length;
  
  document.getElementById('stat-sessions').textContent = totalSessions;
  document.getElementById('stat-trainers').textContent = totalTrainers;
  document.getElementById('stat-upcoming').textContent = upcomingSessions;
}

/**
 * Remplir les filtres
 */
function populateFilters() {
  // Formateurs
  const trainerFilter = document.getElementById('trainerFilter');
  state.formateurs.forEach(trainer => {
    const option = document.createElement('option');
    option.value = trainer.id;
    option.textContent = trainer.nom;
    trainerFilter.appendChild(option);
  });
  
  // Mois
  const monthFilter = document.getElementById('monthFilter');
  const months = new Set();
  state.sessions.forEach(session => {
    const date = new Date(session.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    months.add(monthKey);
  });
  
  Array.from(months).sort().forEach(monthKey => {
    const option = document.createElement('option');
    option.value = monthKey;
    const [year, month] = monthKey.split('-');
    option.textContent = formatMonthName(parseInt(month)) + ' ' + year;
    monthFilter.appendChild(option);
  });
  
  // Formateurs pour le modal
  const sessionTrainer = document.getElementById('sessionTrainer');
  state.formateurs.forEach(trainer => {
    const option = document.createElement('option');
    option.value = trainer.id;
    option.textContent = trainer.nom;
    sessionTrainer.appendChild(option);
  });
}

/**
 * Affichage de la vue actuelle
 */
function renderCurrentView() {
  applyFilters();
  
  if (state.currentView === 'calendar') {
    renderCalendarView();
  } else {
    renderTableView();
  }
}

/**
 * Application des filtres
 */
function applyFilters() {
  state.filteredSessions = state.sessions.filter(session => {
    // Filtre de recherche
    if (state.filters.search) {
      const search = state.filters.search.toLowerCase();
      const matchesSearch = 
        session.formateurNom.toLowerCase().includes(search) ||
        session.typeFormation.toLowerCase().includes(search) ||
        session.lieu.toLowerCase().includes(search);
      
      if (!matchesSearch) return false;
    }
    
    // Filtre formateur
    if (state.filters.trainer && session.formateurId !== state.filters.trainer) {
      return false;
    }
    
    // Filtre mois
    if (state.filters.month) {
      const sessionMonth = session.date.substring(0, 7);
      if (sessionMonth !== state.filters.month) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Rendu de la vue calendrier
 */
function renderCalendarView() {
  const container = document.getElementById('calendarView');
  const tableView = document.getElementById('tableView');
  
  container.classList.remove('hidden');
  tableView.classList.add('hidden');
  
  // Grouper par mois
  const sessionsByMonth = {};
  state.filteredSessions.forEach(session => {
    const monthKey = session.date.substring(0, 7);
    if (!sessionsByMonth[monthKey]) {
      sessionsByMonth[monthKey] = {};
    }
    if (!sessionsByMonth[monthKey][session.date]) {
      sessionsByMonth[monthKey][session.date] = [];
    }
    sessionsByMonth[monthKey][session.date].push(session);
  });
  
  // Générer le HTML
  let html = '';
  
  Object.keys(sessionsByMonth).sort().forEach(monthKey => {
    const [year, month] = monthKey.split('-');
    const monthName = formatMonthName(parseInt(month));
    
    html += `
      <div class="month-section">
        <h2 class="month-title">${monthName} ${year}</h2>
        <div class="calendar-grid">
    `;
    
    Object.keys(sessionsByMonth[monthKey]).sort().forEach(date => {
      const sessions = sessionsByMonth[monthKey][date];
      const dateObj = new Date(date);
      const dayName = formatDayName(dateObj.getDay());
      
      html += `
        <div class="day-card">
          <div class="day-header">
            <div class="day-date">${dateObj.getDate()}</div>
            <div class="day-name">${dayName}</div>
          </div>
          <div class="sessions">
      `;
      
      sessions.forEach(session => {
        html += `
          <div class="session-item">
            <div class="session-trainer">${session.formateurNom}</div>
            <div class="session-type">${session.typeFormation}</div>
            <span class="session-lieu">${session.lieu}</span>
          </div>
        `;
      });
      
      html += `
          </div>
        </div>
      `;
    });
    
    html += `
        </div>
      </div>
    `;
  });
  
  if (html === '') {
    html = '<div class="text-center mt-2"><p>Aucune session trouvée</p></div>';
  }
  
  container.innerHTML = html;
}

/**
 * Rendu de la vue tableau
 */
function renderTableView() {
  const container = document.getElementById('tableView');
  const calendarView = document.getElementById('calendarView');
  
  container.classList.remove('hidden');
  calendarView.classList.add('hidden');
  
  let html = `
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Jour</th>
          <th>Formateur</th>
          <th>Formation</th>
          <th>Lieu</th>
          <th>Statut</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  state.filteredSessions.sort((a, b) => a.date.localeCompare(b.date)).forEach(session => {
    const dateObj = new Date(session.date);
    const formattedDate = `${dateObj.getDate()} ${formatMonthName(dateObj.getMonth() + 1).substring(0, 3)} ${dateObj.getFullYear()}`;
    
    html += `
      <tr>
        <td>${formattedDate}</td>
        <td>${session.jourSemaine}</td>
        <td><strong>${session.formateurNom}</strong></td>
        <td>${session.typeFormation}</td>
        <td>${session.lieu}</td>
        <td><span class="status-badge status-${session.statut}">${session.statut}</span></td>
      </tr>
    `;
  });
  
  html += `
      </tbody>
    </table>
  `;
  
  if (state.filteredSessions.length === 0) {
    html = '<div class="text-center mt-2"><p>Aucune session trouvée</p></div>';
  }
  
  container.innerHTML = html;
}

/**
 * Gestion des événements
 */
function attachEventListeners() {
  // Recherche
  document.getElementById('searchInput').addEventListener('input', (e) => {
    state.filters.search = e.target.value;
    renderCurrentView();
  });
  
  // Filtre formateur
  document.getElementById('trainerFilter').addEventListener('change', (e) => {
    state.filters.trainer = e.target.value;
    renderCurrentView();
  });
  
  // Filtre mois
  document.getElementById('monthFilter').addEventListener('change', (e) => {
    state.filters.month = e.target.value;
    renderCurrentView();
  });
  
  // Basculer entre les vues
  document.querySelectorAll('.view-toggle button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.view-toggle button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentView = btn.dataset.view;
      renderCurrentView();
    });
  });
  
  // Bouton actualiser
  document.getElementById('btnRefresh').addEventListener('click', async () => {
    await initializeApp();
  });
  
  // Modal
  document.getElementById('btnAddSession').addEventListener('click', () => {
    openModal();
  });
  
  document.getElementById('closeModal').addEventListener('click', () => {
    closeModal();
  });
  
  document.getElementById('cancelSession').addEventListener('click', () => {
    closeModal();
  });
  
  // Formulaire de session
  document.getElementById('sessionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveSession();
  });
}

/**
 * Modal
 */
function openModal() {
  document.getElementById('sessionModal').classList.add('active');
  document.getElementById('sessionForm').reset();
}

function closeModal() {
  document.getElementById('sessionModal').classList.remove('active');
}

/**
 * Sauvegarder une session
 */
async function saveSession() {
  const formData = {
    date: document.getElementById('sessionDate').value,
    formateurId: document.getElementById('sessionTrainer').value,
    typeFormation: document.getElementById('sessionType').value,
    lieu: document.getElementById('sessionLieu').value,
    action: 'add'
  };
  
  if (CONFIG.USE_DEMO_DATA) {
    // Mode démo : ajouter localement
    const trainer = state.formateurs.find(t => t.id === formData.formateurId);
    const dateObj = new Date(formData.date);
    
    state.sessions.push({
      id: `S${state.sessions.length + 1}`,
      date: formData.date,
      jourSemaine: ['D', 'L', 'M', 'M', 'J', 'V', 'S'][dateObj.getDay()],
      formateurId: formData.formateurId,
      formateurNom: trainer.nom,
      typeFormation: formData.typeFormation,
      lieu: formData.lieu,
      statut: 'planifie'
    });
    
    closeModal();
    updateStats();
    renderCurrentView();
    showSuccess('Session ajoutée avec succès !');
    return;
  }
  
  try {
    const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'updateSession',
        session: formData
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      closeModal();
      await loadData();
      updateStats();
      renderCurrentView();
      showSuccess('Session ajoutée avec succès !');
    } else {
      showError(result.error || 'Erreur lors de l\'ajout de la session');
    }
  } catch (error) {
    console.error('Erreur:', error);
    showError('Erreur de communication avec le serveur');
  }
}

/**
 * Utilitaires
 */
function formatMonthName(month) {
  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  return months[month - 1];
}

function formatDayName(day) {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  return days[day];
}

function showLoading(show) {
  const loading = document.getElementById('loadingState');
  const calendarView = document.getElementById('calendarView');
  const tableView = document.getElementById('tableView');
  
  if (show) {
    loading.classList.remove('hidden');
    calendarView.classList.add('hidden');
    tableView.classList.add('hidden');
  } else {
    loading.classList.add('hidden');
  }
}

function showError(message) {
  alert('❌ ' + message);
}

function showSuccess(message) {
  alert('✅ ' + message);
}

// Service Worker pour PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(registration => console.log('Service Worker enregistré'))
      .catch(err => console.log('Erreur Service Worker:', err));
  });
}