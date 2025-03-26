/**
 * BD Creator - Gestionnaire de sessions
 * Version corrigée avec suppression des écouteurs d'événements redondants
 */

// Classe principale pour gérer les sessions
class SessionManager {
    constructor() {
        console.log("Initialisation du gestionnaire de sessions");
        this.currentSessionId = localStorage.getItem('currentSessionId') || null;
        this.sessions = this.loadAllSessions();
        
        // Initialiser l'UI après que le DOM soit complètement chargé
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initUI());
        } else {
            this.initUI();
        }
    }

    // Initialiser l'interface utilisateur pour la gestion des sessions
    initUI() {
        console.log("Initialisation de l'UI du gestionnaire de sessions");
        
        // Ajouter les écouteurs d'événements
        this.addEventListeners();
        
        // Mettre à jour la liste des sessions disponibles
        this.updateSessionsList();
        
        // Mettre à jour l'information sur la session actuelle
        if (this.currentSessionId && this.sessions[this.currentSessionId]) {
            this.updateCurrentSessionInfo(this.sessions[this.currentSessionId].name);
        } else {
            this.updateCurrentSessionInfo('Nouvelle session');
        }
    }
    
    // Ajouter les écouteurs d'événements pour les boutons
    addEventListeners() {
        console.log("Ajout des écouteurs d'événements");
        
        const saveButton = document.getElementById('save-session-btn');
        const newButton = document.getElementById('new-session-btn');
        const loadSelect = document.getElementById('load-session-select');
        
        if (saveButton) {
            console.log("Bouton 'save-session-btn' trouvé, ajout de l'écouteur d'événements");
            // Enlever les écouteurs existants avant d'en ajouter de nouveaux
            saveButton.removeEventListener('click', this.saveCurrentSession.bind(this));
            saveButton.addEventListener('click', this.saveCurrentSession.bind(this));
        } else {
            console.error("Bouton 'save-session-btn' non trouvé");
        }
        
        if (newButton) {
            console.log("Bouton 'new-session-btn' trouvé, ajout de l'écouteur d'événements");
            // Enlever les écouteurs existants avant d'en ajouter de nouveaux
            newButton.removeEventListener('click', this.startNewSession.bind(this));
            newButton.addEventListener('click', this.startNewSession.bind(this));
        } else {
            console.error("Bouton 'new-session-btn' non trouvé");
        }
        
        if (loadSelect) {
            console.log("Sélecteur 'load-session-select' trouvé, ajout de l'écouteur d'événements");
            // Utiliser une fonction nommée pour pouvoir la supprimer
            this.loadSessionHandler = (e) => {
                const sessionId = e.target.value;
                if (sessionId) {
                    console.log("Sélection d'une session à charger:", sessionId);
                    this.loadSession(sessionId);
                    e.target.value = '';
                }
            };
            
            // Enlever les écouteurs existants avant d'en ajouter de nouveaux
            loadSelect.removeEventListener('change', this.loadSessionHandler);
            loadSelect.addEventListener('change', this.loadSessionHandler);
        } else {
            console.error("Sélecteur 'load-session-select' non trouvé");
        }
    }
    
    // Mettre à jour la liste des sessions dans le sélecteur
    updateSessionsList() {
        const loadSelect = document.getElementById('load-session-select');
        if (loadSelect) {
            // Conserver uniquement l'option par défaut
            loadSelect.innerHTML = '<option value="">Charger une session...</option>';
            
            // Ajouter les sessions sauvegardées
            Object.keys(this.sessions).forEach(sessionId => {
                const session = this.sessions[sessionId];
                const option = document.createElement('option');
                option.value = sessionId;
                option.textContent = `${session.name} (${new Date(session.timestamp).toLocaleString()})`;
                loadSelect.appendChild(option);
            });
        }
    }
    
    // Sauvegarder la session actuelle
    saveCurrentSession() {
        // Demander un nom pour la session
        const sessionName = prompt('Donnez un nom à cette session:', 'Ma BD ' + new Date().toLocaleDateString());
        if (!sessionName) return; // L'utilisateur a annulé
        
        // Collecter les données de la session actuelle
        const sessionData = {
            currentPage: window.location.pathname.split('/').pop(),
            keywords: localStorage.getItem('bdKeywords') || '',
            scenario: localStorage.getItem('bdScenario') || '',
            chapter: localStorage.getItem('bdChapter') || '',
            storyboard: localStorage.getItem('bdStoryboard') || '',
            urlParams: window.location.search,
            name: sessionName,
            timestamp: Date.now()
        };
        
        // Générer un ID unique
        const sessionId = 'session_' + Date.now();
        this.currentSessionId = sessionId;
        
        // Sauvegarder l'ID de session actuelle
        localStorage.setItem('currentSessionId', sessionId);
        
        // Sauvegarder la session
        this.sessions[sessionId] = sessionData;
        this.saveAllSessions();
        
        // Mettre à jour l'interface
        this.updateSessionsList();
        this.updateCurrentSessionInfo(sessionName);
        
        alert('Session sauvegardée avec succès !');
    }
    
    // Démarrer une nouvelle session
    startNewSession() {
        if (confirm('Voulez-vous vraiment commencer une nouvelle session ? Les modifications non sauvegardées seront perdues.')) {
            console.log("Confirmation reçue pour nouvelle session");
            
            try {
                // Effacer les données de session du localStorage
                for (let key in localStorage) {
                    if (key.startsWith('bd') || key === 'currentSessionId') {
                        localStorage.removeItem(key);
                    }
                }
                
                console.log("Données de session effacées du localStorage");
                
                // Redirection directe vers la page d'accueil avec un timestamp pour éviter le cache
                const timestamp = new Date().getTime();
                window.location.href = 'index.html?new=' + timestamp;
            } catch (error) {
                console.error('Erreur lors de la création d\'une nouvelle session:', error);
                alert('Une erreur est survenue lors de la création d\'une nouvelle session. Veuillez réessayer.');
            }
        } else {
            console.log("Création de nouvelle session annulée par l'utilisateur");
        }
    }
    
    // Charger une session sauvegardée
    loadSession(sessionId) {
        if (!this.sessions[sessionId]) {
            alert('Session introuvable !');
            return;
        }
        
        const session = this.sessions[sessionId];
        
        if (confirm(`Voulez-vous charger la session "${session.name}" ? Les modifications non sauvegardées seront perdues.`)) {
            // Définir la session actuelle
            this.currentSessionId = sessionId;
            localStorage.setItem('currentSessionId', sessionId);
            
            // Restaurer les données de la session
            if (session.keywords) localStorage.setItem('bdKeywords', session.keywords);
            if (session.scenario) localStorage.setItem('bdScenario', session.scenario);
            if (session.chapter) localStorage.setItem('bdChapter', session.chapter);
            if (session.storyboard) localStorage.setItem('bdStoryboard', session.storyboard);
            
            // Mettre à jour l'interface
            this.updateCurrentSessionInfo(session.name);
            
            // Rediriger vers la page appropriée
            let targetPage = 'index.html';
            if (session.currentPage) {
                targetPage = session.currentPage;
                if (session.urlParams) {
                    targetPage += session.urlParams;
                }
            }
            
            window.location.href = targetPage;
        }
    }
    
    // Mettre à jour l'information sur la session actuelle
    updateCurrentSessionInfo(sessionName) {
        const sessionNameElement = document.getElementById('current-session-name');
        if (sessionNameElement) {
            sessionNameElement.textContent = sessionName;
        } else {
            console.error("Élément 'current-session-name' non trouvé");
        }
    }
    
    // Charger toutes les sessions depuis le localStorage
    loadAllSessions() {
        try {
            const sessionsJson = localStorage.getItem('bdCreatorSessions');
            return sessionsJson ? JSON.parse(sessionsJson) : {};
        } catch (error) {
            console.error('Erreur lors du chargement des sessions:', error);
            return {};
        }
    }
    
    // Sauvegarder toutes les sessions dans le localStorage
    saveAllSessions() {
        try {
            localStorage.setItem('bdCreatorSessions', JSON.stringify(this.sessions));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des sessions:', error);
            alert('Impossible de sauvegarder les sessions. L\'espace de stockage est peut-être plein.');
        }
    }
}

// Initialiser le gestionnaire de sessions lorsque la page est chargée
// On évite de créer plusieurs instances en vérifiant si elle existe déjà
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM chargé, initialisation du gestionnaire de sessions...");
    if (!window.bdSessionManager) {
        window.bdSessionManager = new SessionManager();
    }
});
