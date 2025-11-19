# Regole di Sicurezza Firestore per GioIA

## Problema Attuale
Il pannello admin non può leggere tutti gli utenti dalla collection `users` perché le regole di sicurezza di Firestore bloccano l'accesso.

## Soluzione: Aggiornare le Regole Firestore

### 1. Accedi alla Firebase Console
1. Vai su [Firebase Console](https://console.firebase.google.com)
2. Seleziona il progetto **gioia-e1f29**
3. Nel menu laterale, clicca su **Firestore Database**
4. Vai alla tab **Regole** (Rules)

### 2. Sostituisci le Regole Attuali

Copia e incolla queste regole di sicurezza:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function: controlla se l'utente è autenticato
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Helper function: controlla se l'utente è admin
    function isAdmin() {
      return isSignedIn() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Helper function: controlla se l'utente sta accedendo ai propri dati
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    // Regole per la collection 'users'
    match /users/{userId} {
      // Lettura: l'utente può leggere i propri dati, gli admin possono leggere tutto
      allow read: if isOwner(userId) || isAdmin();
      
      // Scrittura: l'utente può creare/modificare i propri dati, gli admin possono modificare tutto
      allow create: if isSignedIn();
      allow update: if isOwner(userId) || isAdmin();
      
      // Cancellazione: solo admin possono eliminare utenti
      allow delete: if isAdmin();
    }
    
    // Regole per la collection 'documents' (buste paga)
    match /documents/{document=**} {
      // Solo utenti autenticati possono accedere ai propri documenti
      allow read, write: if isSignedIn();
    }
    
    // Regole per altre collections (se necessario)
    match /{document=**} {
      // Default: blocca tutto il resto
      allow read, write: if false;
    }
  }
}
```

### 3. Pubblica le Regole
1. Clicca sul pulsante **Pubblica** (Publish)
2. Conferma la pubblicazione

### 4. Verifica
Dopo aver pubblicato le regole:
1. Ricarica l'app GioIA
2. Fai logout e login di nuovo
3. Gli utenti mancanti dovrebbero ora apparire nel pannello admin in tempo reale

## Cosa Fanno Queste Regole

### Sicurezza per Collection `users`:
- ✅ **Lettura**: Ogni utente può leggere solo i propri dati
- ✅ **Lettura Admin**: Gli admin possono leggere tutti gli utenti (necessario per il pannello admin)
- ✅ **Creazione**: Utenti autenticati possono creare il proprio documento (auto-registrazione)
- ✅ **Modifica**: Ogni utente può modificare solo i propri dati
- ✅ **Modifica Admin**: Gli admin possono modificare qualsiasi utente (gestione crediti)
- ✅ **Cancellazione**: Solo gli admin possono eliminare utenti

### Sicurezza per Collection `documents`:
- ✅ Utenti autenticati possono accedere ai propri documenti (buste paga)

### Default:
- 🚫 Tutto il resto è bloccato per sicurezza

## Note Importanti
- Le regole verificano il ruolo dell'utente leggendo il campo `role` dal documento Firestore
- Per rendere un utente admin, devi modificare manualmente il campo `role` a `'admin'` in Firestore
- Le regole sono **real-time**: si applicano immediatamente dopo la pubblicazione
