// Lightweight offline translations for the app's supported interface languages.
(function () {
  const translations = {
    es: {
      'Welcome to': 'Bienvenido a', 'Local and offline first medicine tracker': 'Control de medicamentos local y sin conexión',
      'Get Started': 'Comenzar', 'Please put the following': 'Por favor, introduce la siguiente', 'information to continue': 'información para continuar',
      'Name:': 'Nombre:', 'User Age:': 'Edad:', 'Language:': 'Idioma:', 'Preferred Language:': 'Idioma preferido:',
      'Would you like to use Text-to-Speech (voice assistance)?': '¿Quieres usar asistencia por voz (texto a voz)?',
      'Yes, enable': 'Sí, activar', 'No, thank you': 'No, gracias', 'Continue': 'Continuar',
      'Please put your medicine': 'Por favor, introduce la información', 'information to continue': 'información necesaria para continuar',
      'Medicine Name:': 'Nombre del medicamento:', 'Schedule:': 'Frecuencia:', 'Daily': 'Diariamente', 'Pick Days': 'Elegir días',
      'Time:': 'Hora:', 'Dosage:': 'Dosis:', 'Additional Info (Optional):': 'Información adicional (opcional):',
      'Save & Continue': 'Guardar y continuar', 'Saving...': 'Guardando…', 'Add Medicine': 'Añadir medicamento', '+ Add Medicine': '+ Añadir medicamento',
      'Settings': 'Configuración', 'Restart Setup': 'Reiniciar configuración', 'Welcome back!': '¡Bienvenido de nuevo!',
      'Here is your medicine schedule for today.': 'Este es tu horario de medicamentos para hoy.', 'UPCOMING MEDICINE': 'PRÓXIMO MEDICAMENTO',
      'No upcoming medicine': 'No hay medicamentos próximos', 'No doses scheduled': 'No hay dosis programadas', 'Medicine taken': 'Medicamento tomado',
      "Today's Logged Doses": 'Dosis registradas hoy', 'Active Medicines': 'Medicamentos activos', 'All Medicines': 'Todos los medicamentos',
      '+ Add New': '+ Añadir', 'No medicines logged yet today.': 'Aún no se han registrado medicamentos hoy.',
      'No medicines registered yet.': 'Aún no hay medicamentos registrados.', 'No active medicines': 'No hay medicamentos activos',
      'No active medicines. Add a medicine to create a schedule.': 'No hay medicamentos activos. Añade uno para crear un horario.',
      'Archived medicines are hidden from your active schedule.': 'Los medicamentos archivados están ocultos del horario activo.',
      'Archive': 'Archivar', 'Restore': 'Restaurar', 'Settings & Preferences': 'Configuración y preferencias',
      'Update your personal information or export your offline medicine tracking logs.': 'Actualiza tu información personal o exporta tus registros de medicamentos.',
      'Basic Information': 'Información básica', 'User Name:': 'Nombre:', 'Age:': 'Edad:', 'Voice Assistance (Text-to-Speech):': 'Asistencia por voz (texto a voz):',
      'Enable Text-to-Speech': 'Activar texto a voz', 'Disabled': 'Desactivado', 'Save Changes': 'Guardar cambios',
      'Changes saved successfully': 'Cambios guardados correctamente', 'Archived Medicines': 'Medicamentos archivados', 'No archived medicines.': 'No hay medicamentos archivados.',
      'Export Medicine Logs': 'Exportar registros de medicamentos', 'Total Doses Logged': 'Dosis registradas en total', 'Active Prescriptions': 'Tratamientos activos',
      'Export Logs as CSV': 'Exportar registros como CSV', 'Export Backup as JSON': 'Exportar copia de seguridad como JSON',
      'Delete All Data': 'Eliminar todos los datos', 'No extra instructions specified.': 'No se especificaron instrucciones adicionales.',
      'Scheduled for today': 'Programado para hoy',
      'Download your complete history of logged medicines and dosages. This is useful for sharing with your doctor, caregiver, or keeping an offline backup.': 'Descarga tu historial de medicamentos y dosis para compartirlo con tu médico o cuidador, o guardar una copia sin conexión.',
      'This permanently removes your profile, preferences, medicines, archived medicines, and dose history from this device.': 'Esto eliminará permanentemente de este dispositivo tu perfil, preferencias, medicamentos y el historial de dosis.',
      'No upcoming medicine': 'No hay medicamentos próximos',
      'No medicines added yet': 'Aún no hay medicamentos añadidos', 'Tap "+ Add Medicine" to create your first schedule': 'Pulsa «+ Añadir medicamento» para crear tu primer horario.'
    },
    fr: {
      'Welcome to': 'Bienvenue chez', 'Local and offline first medicine tracker': 'Suivi des médicaments local et hors ligne',
      'Get Started': 'Commencer', 'Please put the following': 'Veuillez saisir les', 'information to continue': 'informations pour continuer',
      'Name:': 'Nom :', 'User Age:': 'Âge :', 'Language:': 'Langue :', 'Preferred Language:': 'Langue préférée :',
      'Would you like to use Text-to-Speech (voice assistance)?': 'Souhaitez-vous utiliser l’assistance vocale (synthèse vocale) ?',
      'Yes, enable': 'Oui, activer', 'No, thank you': 'Non, merci', 'Continue': 'Continuer',
      'Please put your medicine': 'Veuillez saisir les informations', 'Medicine Name:': 'Nom du médicament :', 'Schedule:': 'Fréquence :',
      'Daily': 'Tous les jours', 'Pick Days': 'Choisir les jours', 'Time:': 'Heure :', 'Dosage:': 'Posologie :',
      'Additional Info (Optional):': 'Informations complémentaires (facultatif) :', 'Save & Continue': 'Enregistrer et continuer',
      'Saving...': 'Enregistrement…', 'Add Medicine': 'Ajouter un médicament', '+ Add Medicine': '+ Ajouter un médicament', 'Settings': 'Paramètres', 'Restart Setup': 'Recommencer la configuration',
      'Welcome back!': 'Bon retour !', 'Here is your medicine schedule for today.': 'Voici votre programme de médicaments du jour.',
      'UPCOMING MEDICINE': 'PROCHAIN MÉDICAMENT', 'No upcoming medicine': 'Aucun médicament à venir', 'No doses scheduled': 'Aucune dose prévue',
      'Medicine taken': 'Médicament pris', "Today's Logged Doses": 'Doses prises aujourd’hui', 'Active Medicines': 'Médicaments actifs',
      'All Medicines': 'Tous les médicaments', '+ Add New': '+ Ajouter', 'No medicines logged yet today.': 'Aucun médicament enregistré aujourd’hui.',
      'No medicines registered yet.': 'Aucun médicament enregistré.', 'No active medicines': 'Aucun médicament actif',
      'No active medicines. Add a medicine to create a schedule.': 'Aucun médicament actif. Ajoutez-en un pour créer un programme.',
      'Archived medicines are hidden from your active schedule.': 'Les médicaments archivés sont masqués du programme actif.',
      'Archive': 'Archiver', 'Restore': 'Restaurer', 'Settings & Preferences': 'Paramètres et préférences',
      'Update your personal information or export your offline medicine tracking logs.': 'Modifiez vos informations ou exportez vos historiques de médicaments.',
      'Basic Information': 'Informations générales', 'User Name:': 'Nom :', 'Age:': 'Âge :', 'Voice Assistance (Text-to-Speech):': 'Assistance vocale (synthèse vocale) :',
      'Enable Text-to-Speech': 'Activer la synthèse vocale', 'Disabled': 'Désactivée', 'Save Changes': 'Enregistrer les modifications',
      'Changes saved successfully': 'Modifications enregistrées', 'Archived Medicines': 'Médicaments archivés', 'No archived medicines.': 'Aucun médicament archivé.',
      'Export Medicine Logs': 'Exporter les historiques', 'Total Doses Logged': 'Nombre total de doses', 'Active Prescriptions': 'Traitements actifs',
      'Export Logs as CSV': 'Exporter en CSV', 'Export Backup as JSON': 'Exporter la sauvegarde JSON', 'Delete All Data': 'Supprimer toutes les données',
      'No extra instructions specified.': 'Aucune instruction complémentaire indiquée.', 'Scheduled for today': 'Prévu aujourd’hui',
      'Download your complete history of logged medicines and dosages. This is useful for sharing with your doctor, caregiver, or keeping an offline backup.': 'Téléchargez l’historique complet des médicaments et des doses pour le partager ou le conserver hors ligne.',
      'This permanently removes your profile, preferences, medicines, archived medicines, and dose history from this device.': 'Cela supprimera définitivement votre profil, vos préférences, vos médicaments et votre historique de doses de cet appareil.'
    },
    de: {
      'Welcome to': 'Willkommen bei', 'Local and offline first medicine tracker': 'Lokale, offlinefähige Medikamentenübersicht',
      'Get Started': 'Los geht’s', 'Please put the following': 'Bitte gib die folgenden', 'information to continue': 'Informationen ein, um fortzufahren',
      'Name:': 'Name:', 'User Age:': 'Alter:', 'Language:': 'Sprache:', 'Preferred Language:': 'Bevorzugte Sprache:',
      'Would you like to use Text-to-Speech (voice assistance)?': 'Möchtest du die Sprachausgabe verwenden?',
      'Yes, enable': 'Ja, aktivieren', 'No, thank you': 'Nein, danke', 'Continue': 'Weiter',
      'Please put your medicine': 'Bitte gib die Medikamenten', 'information to continue': 'Angaben zum Fortfahren',
      'Medicine Name:': 'Medikamentenname:', 'Schedule:': 'Einnahmeplan:', 'Daily': 'Täglich', 'Pick Days': 'Tage auswählen',
      'Time:': 'Uhrzeit:', 'Dosage:': 'Dosierung:', 'Additional Info (Optional):': 'Zusätzliche Hinweise (optional):',
      'Save & Continue': 'Speichern und weiter', 'Saving...': 'Wird gespeichert…', 'Add Medicine': 'Medikament hinzufügen', '+ Add Medicine': '+ Medikament hinzufügen',
      'Settings': 'Einstellungen', 'Restart Setup': 'Einrichtung neu starten', 'Welcome back!': 'Willkommen zurück!',
      'Here is your medicine schedule for today.': 'Hier ist dein Medikamentenplan für heute.', 'UPCOMING MEDICINE': 'NÄCHSTES MEDIKAMENT',
      'No upcoming medicine': 'Keine anstehenden Medikamente', 'No doses scheduled': 'Keine Dosen geplant', 'Medicine taken': 'Medikament eingenommen',
      "Today's Logged Doses": 'Heutige Einnahmen', 'Active Medicines': 'Aktive Medikamente', 'All Medicines': 'Alle Medikamente',
      '+ Add New': '+ Neu hinzufügen', 'No medicines logged yet today.': 'Heute wurden noch keine Medikamente erfasst.',
      'No medicines registered yet.': 'Noch keine Medikamente gespeichert.', 'No active medicines': 'Keine aktiven Medikamente',
      'No active medicines. Add a medicine to create a schedule.': 'Keine aktiven Medikamente. Füge eines hinzu, um einen Plan zu erstellen.',
      'Archived medicines are hidden from your active schedule.': 'Archivierte Medikamente sind im aktiven Plan ausgeblendet.',
      'Archive': 'Archivieren', 'Restore': 'Wiederherstellen', 'Settings & Preferences': 'Einstellungen und Vorgaben',
      'Update your personal information or export your offline medicine tracking logs.': 'Ändere deine persönlichen Daten oder exportiere deine Medikamentenprotokolle.',
      'Basic Information': 'Persönliche Angaben', 'User Name:': 'Name:', 'Age:': 'Alter:', 'Voice Assistance (Text-to-Speech):': 'Sprachunterstützung (Sprachausgabe):',
      'Enable Text-to-Speech': 'Sprachausgabe aktivieren', 'Disabled': 'Deaktiviert', 'Save Changes': 'Änderungen speichern',
      'Changes saved successfully': 'Änderungen gespeichert', 'Archived Medicines': 'Archivierte Medikamente', 'No archived medicines.': 'Keine archivierten Medikamente.',
      'Export Medicine Logs': 'Medikamentenprotokolle exportieren', 'Total Doses Logged': 'Erfasste Dosen insgesamt', 'Active Prescriptions': 'Aktive Verordnungen',
      'Export Logs as CSV': 'Protokolle als CSV exportieren', 'Export Backup as JSON': 'Sicherung als JSON exportieren', 'Delete All Data': 'Alle Daten löschen',
      'No extra instructions specified.': 'Keine zusätzlichen Hinweise angegeben.', 'Scheduled for today': 'Für heute geplant',
      'Download your complete history of logged medicines and dosages. This is useful for sharing with your doctor, caregiver, or keeping an offline backup.': 'Lade deinen vollständigen Verlauf herunter, um ihn zu teilen oder offline zu sichern.',
      'This permanently removes your profile, preferences, medicines, archived medicines, and dose history from this device.': 'Dadurch werden Profil, Einstellungen, Medikamente und Einnahmeverlauf dauerhaft von diesem Gerät gelöscht.'
    },
    hi: {
      'Welcome to': 'स्वागत है', 'Local and offline first medicine tracker': 'ऑफ़लाइन दवा ट्रैकर', 'Get Started': 'शुरू करें',
      'Please put the following': 'कृपया आगे बढ़ने के लिए', 'information to continue': 'यह जानकारी भरें', 'Name:': 'नाम:', 'User Age:': 'उम्र:',
      'Language:': 'भाषा:', 'Preferred Language:': 'पसंदीदा भाषा:', 'Would you like to use Text-to-Speech (voice assistance)?': 'क्या आप बोलकर सहायता चाहते हैं?',
      'Yes, enable': 'हाँ, चालू करें', 'No, thank you': 'नहीं, धन्यवाद', 'Continue': 'आगे बढ़ें',
      'Please put your medicine': 'कृपया दवा की जानकारी', 'information to continue': 'आगे बढ़ने के लिए भरें', 'Medicine Name:': 'दवा का नाम:',
      'Schedule:': 'समय-सारणी:', 'Daily': 'रोज़ाना', 'Pick Days': 'दिन चुनें', 'Time:': 'समय:', 'Dosage:': 'खुराक:',
      'Additional Info (Optional):': 'अतिरिक्त जानकारी (वैकल्पिक):', 'Save & Continue': 'सहेजें और आगे बढ़ें', 'Saving...': 'सहेजा जा रहा है…',
      'Add Medicine': 'दवा जोड़ें', '+ Add Medicine': '+ दवा जोड़ें', 'Settings': 'सेटिंग्स', 'Restart Setup': 'सेटअप फिर शुरू करें', 'Welcome back!': 'वापस स्वागत है!',
      'Here is your medicine schedule for today.': 'आज की दवा-सारणी यहाँ है।', 'UPCOMING MEDICINE': 'अगली दवा',
      'No upcoming medicine': 'कोई अगली दवा नहीं', 'No doses scheduled': 'कोई खुराक निर्धारित नहीं', 'Medicine taken': 'दवा ली',
      "Today's Logged Doses": 'आज ली गई खुराकें', 'Active Medicines': 'चालू दवाएँ', 'All Medicines': 'सभी दवाएँ', '+ Add New': '+ नई दवा',
      'No medicines logged yet today.': 'आज अभी तक कोई दवा दर्ज नहीं हुई।', 'No medicines registered yet.': 'अभी कोई दवा दर्ज नहीं है।',
      'No active medicines': 'कोई चालू दवा नहीं', 'No active medicines. Add a medicine to create a schedule.': 'कोई चालू दवा नहीं। समय-सारणी बनाने के लिए दवा जोड़ें।',
      'Archived medicines are hidden from your active schedule.': 'संग्रहित दवाएँ चालू सारणी में नहीं दिखतीं।',
      'Archive': 'संग्रहित करें', 'Restore': 'बहाल करें', 'Settings & Preferences': 'सेटिंग्स और प्राथमिकताएँ',
      'Update your personal information or export your offline medicine tracking logs.': 'अपनी जानकारी बदलें या दवा रिकॉर्ड निर्यात करें।',
      'Basic Information': 'बुनियादी जानकारी', 'Voice Assistance (Text-to-Speech):': 'आवाज़ सहायता:', 'Enable Text-to-Speech': 'आवाज़ सहायता चालू करें',
      'Disabled': 'बंद', 'Save Changes': 'बदलाव सहेजें', 'Changes saved successfully': 'बदलाव सफलतापूर्वक सहेजे गए',
      'Archived Medicines': 'संग्रहित दवाएँ', 'No archived medicines.': 'कोई संग्रहित दवा नहीं।', 'Export Medicine Logs': 'दवा रिकॉर्ड निर्यात करें',
      'Total Doses Logged': 'कुल दर्ज खुराकें', 'Active Prescriptions': 'चालू दवाएँ', 'Export Logs as CSV': 'CSV में रिकॉर्ड निर्यात करें',
      'Export Backup as JSON': 'JSON बैकअप निर्यात करें', 'Delete All Data': 'सभी डेटा हटाएँ',
      'No extra instructions specified.': 'कोई अतिरिक्त निर्देश नहीं दिए गए।', 'Scheduled for today': 'आज के लिए निर्धारित',
      'Download your complete history of logged medicines and dosages. This is useful for sharing with your doctor, caregiver, or keeping an offline backup.': 'दवा और खुराक का पूरा रिकॉर्ड डाउनलोड करें, ताकि डॉक्टर से साझा कर सकें या ऑफ़लाइन सुरक्षित रख सकें।',
      'This permanently removes your profile, preferences, medicines, archived medicines, and dose history from this device.': 'इससे इस डिवाइस से आपकी प्रोफ़ाइल, प्राथमिकताएँ, दवाएँ और खुराक का इतिहास हमेशा के लिए हट जाएगा।'
    }
  };

  const originalText = new WeakMap();
  let language = 'en';

  function localizeNode(node) {
    if (!originalText.has(node)) originalText.set(node, node.nodeValue);
    const source = originalText.get(node);
    const trimmed = source.trim();
    const prefix = trimmed.match(/^[^\p{L}\p{N}]*/u)?.[0] || '';
    const phrase = trimmed.slice(prefix.length).trimStart();
    const translated = translations[language]?.[trimmed] || translations[language]?.[phrase];
    if (!translated) return;
    const leading = source.match(/^\s*/)?.[0] || '';
    const trailing = source.match(/\s*$/)?.[0] || '';
    const translatedText = translations[language]?.[trimmed] ? translated : `${prefix}${translated}`;
    const value = `${leading}${translatedText}${trailing}`;
    if (node.nodeValue !== value) node.nodeValue = value;
  }

  function applyLanguage(nextLanguage) {
    language = translations[nextLanguage] ? nextLanguage : 'en';
    document.documentElement.lang = language;
    const originalTitle = document.documentElement.dataset.originalTitle || document.title;
    document.documentElement.dataset.originalTitle = originalTitle;
    document.title = translations[language]?.[originalTitle] || originalTitle;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return node.parentElement?.closest('script, style, [data-no-translate]')
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT;
      }
    });
    let node;
    while ((node = walker.nextNode())) localizeNode(node);

    document.querySelectorAll('[placeholder], [title], [aria-label]').forEach(element => {
      for (const attribute of ['placeholder', 'title', 'aria-label']) {
        const value = element.getAttribute(attribute);
        if (!value) continue;
        const originalKey = `original${attribute}`;
        if (!Object.prototype.hasOwnProperty.call(element.dataset, originalKey)) element.dataset[originalKey] = value;
        const source = element.dataset[originalKey];
        element.setAttribute(attribute, translations[language]?.[source] || source);
      }
    });
  }

  function setLanguage(nextLanguage) {
    localStorage.setItem('language', nextLanguage);
    applyLanguage(nextLanguage);
  }

  window.MedicaI18n = { applyLanguage, setLanguage };
  document.addEventListener('DOMContentLoaded', () => {
    applyLanguage(localStorage.getItem('language') || 'en');
    const observer = new MutationObserver(records => {
      records.forEach(record => {
        record.addedNodes.forEach(added => {
          if (added.nodeType === Node.TEXT_NODE) localizeNode(added);
          else if (added.nodeType === Node.ELEMENT_NODE) {
            const walker = document.createTreeWalker(added, NodeFilter.SHOW_TEXT);
            let node;
            while ((node = walker.nextNode())) localizeNode(node);
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
