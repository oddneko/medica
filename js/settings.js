// Settings and Logs Export logic
document.addEventListener('DOMContentLoaded', () => {
  // 1. Load Current Profile Info
  const nameInput = document.getElementById('settings-user-name');
  const ageInput = document.getElementById('settings-user-age');
  const langSelect = document.getElementById('settings-language');
  const profileForm = document.getElementById('profile-form');
  const saveFeedback = document.getElementById('save-feedback');

  const currentName = localStorage.getItem('user_name') || '';
  const currentAge = localStorage.getItem('user_age') || '';
  const currentLang = localStorage.getItem('language') || 'en';
  const currentTTS = localStorage.getItem('tts_enabled') || 'no';

  if (nameInput) nameInput.value = currentName;
  if (ageInput) ageInput.value = currentAge;
  if (langSelect) langSelect.value = currentLang;
  langSelect?.addEventListener('change', () => {
    window.MedicaI18n?.setLanguage(langSelect.value);
  });

  const ttsRadio = document.querySelector(`input[name="settings-tts"][value="${currentTTS}"]`);
  if (ttsRadio) {
    ttsRadio.checked = true;
  }

  // 2. Handle Profile Form Submission
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const newName = nameInput?.value.trim();
      const newAge = ageInput?.value.trim();
      const newLang = langSelect?.value || 'en';
      const newTTS = document.querySelector('input[name="settings-tts"]:checked')?.value || 'no';

      if (newName) localStorage.setItem('user_name', newName);
      if (newAge) localStorage.setItem('user_age', newAge);
      if (newLang) localStorage.setItem('language', newLang);
      if (newTTS) localStorage.setItem('tts_enabled', newTTS);

      if (saveFeedback) {
        saveFeedback.style.display = 'inline-block';
        setTimeout(() => {
          saveFeedback.style.display = 'none';
        }, 3000);
      }
    });
  }

  // 3. Load Database Stats (Total Doses & Total Medicines)
  const statDosesEl = document.getElementById('stat-total-doses');
  const statMedsEl = document.getElementById('stat-total-medicines');
  const exportFeedback = document.getElementById('export-feedback');
  const deleteAllDataButton = document.getElementById('btn-delete-all-data');
  const deleteDataFeedback = document.getElementById('delete-data-feedback');
  const archivedMedicinesList = document.getElementById('archived-medicines-list');
  const archivedMedicineCount = document.getElementById('archived-medicine-count');

  archivedMedicinesList?.addEventListener('click', event => {
    const restoreButton = event.target.closest('[data-restore-medicine]');
    if (!restoreButton || !window.MedicineDB?.restoreMedicine) return;

    restoreButton.disabled = true;
    restoreButton.textContent = 'Restoring…';
    window.MedicineDB.restoreMedicine(restoreButton.dataset.restoreMedicine)
      .then(() => window.location.reload())
      .catch(error => {
        console.error('Could not restore medicine:', error);
        restoreButton.disabled = false;
        restoreButton.textContent = 'Restore';
      });
  });

  let cachedLogs = [];
  let cachedMedicines = [];

  function loadStats() {
    if (window.MedicineDB) {
      if (window.MedicineDB.getAllDoseLogs) {
        window.MedicineDB.getAllDoseLogs().then(logs => {
          cachedLogs = logs;
          if (statDosesEl) statDosesEl.textContent = logs.length;
        }).catch(err => console.error('Error fetching logs:', err));
      }

      if (window.MedicineDB.getAllMedicines) {
        window.MedicineDB.getAllMedicines().then(meds => {
          cachedMedicines = meds;
          const activeMedicines = meds.filter(medicine => !medicine.archived);
          const archivedMedicines = meds.filter(medicine => medicine.archived);
          if (statMedsEl) statMedsEl.textContent = activeMedicines.length;
          if (archivedMedicineCount) archivedMedicineCount.textContent = archivedMedicines.length;
          if (archivedMedicinesList) {
            archivedMedicinesList.innerHTML = archivedMedicines.length
              ? archivedMedicines.map(medicine => `
                <article class="archived-medicine-item">
                  <div class="archived-medicine-info">
                    <h3>${medicine.name}</h3>
                    <p>${medicine.dosage || 'Dosage not specified'} &bull; ${(Array.isArray(medicine.times) && medicine.times.length ? medicine.times : [medicine.time]).filter(Boolean).join(', ') || 'Time not specified'}</p>
                  </div>
                  <button type="button" class="btn-restore-medicine" data-restore-medicine="${medicine.id}" aria-label="Restore ${medicine.name}">Restore</button>
                </article>
              `).join('')
              : '<p class="empty-state-text">No archived medicines.</p>';
          }
        }).catch(err => console.error('Error fetching medicines:', err));
      }
    }
  }

  loadStats();

  deleteAllDataButton?.addEventListener('click', () => {
    const confirmed = window.confirm(
      'Delete all MEDICA data on this device? This permanently removes your profile, preferences, medicines, and dose history.'
    );
    if (!confirmed) return;

    deleteAllDataButton.disabled = true;
    deleteAllDataButton.textContent = 'Deleting…';
    if (!window.MedicineDB?.clearAllData) {
      deleteAllDataButton.disabled = false;
      deleteAllDataButton.textContent = 'Delete All Data';
      if (deleteDataFeedback) deleteDataFeedback.textContent = 'Data storage is unavailable. Nothing was deleted.';
      return;
    }

    window.MedicineDB.clearAllData().then(() => {
      ['user_name', 'user_age', 'language', 'tts_enabled', 'onboarding_completed', 'medica_launch_welcome_seen']
        .forEach(key => localStorage.removeItem(key));
      sessionStorage.removeItem('medica_skip_launch_welcome');
      window.location.replace('landing-1.html');
    }).catch(error => {
      console.error('Could not delete MEDICA data:', error);
      deleteAllDataButton.disabled = false;
      deleteAllDataButton.textContent = 'Delete All Data';
      if (deleteDataFeedback) deleteDataFeedback.textContent = 'Could not delete your data. Please try again.';
    });
  });

  // Helper function to trigger file download
  function triggerDownload(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function showExportNotice(msg) {
    if (exportFeedback) {
      exportFeedback.textContent = msg;
      exportFeedback.style.display = 'block';
      setTimeout(() => {
        exportFeedback.style.display = 'none';
      }, 3500);
    }
  }

  // 4. Export Logs as CSV
  const btnExportCSV = document.getElementById('btn-export-csv');
  if (btnExportCSV) {
    btnExportCSV.addEventListener('click', () => {
      if (!window.MedicineDB || !window.MedicineDB.getAllDoseLogs) return;

      window.MedicineDB.getAllDoseLogs().then(logs => {
        if (logs.length === 0) {
          alert('No dose logs found to export yet. Take a scheduled medicine first!');
          return;
        }

        // CSV Header
        let csvContent = 'Log ID,Medicine Name,Dosage,Date,Time,Timestamp (ISO)\r\n';

        logs.forEach(log => {
          const id = log.id || '';
          const name = `"${(log.medicine_name || '').replace(/"/g, '""')}"`;
          const dosage = `"${(log.dosage || '').replace(/"/g, '""')}"`;
          const date = `"${log.date_label || ''}"`;
          const time = `"${log.timestamp_label || ''}"`;
          const iso = `"${log.logged_at || ''}"`;

          csvContent += `${id},${name},${dosage},${date},${time},${iso}\r\n`;
        });

        const dateStr = new Date().toISOString().split('T')[0];
        triggerDownload(csvContent, `medica_medicine_logs_${dateStr}.csv`, 'text/csv;charset=utf-8;');
        showExportNotice('✓ CSV exported successfully!');
      }).catch(err => {
        console.error('Failed to export CSV:', err);
        alert('Could not export logs.');
      });
    });
  }

  // 5. Export Full Backup as JSON
  const btnExportJSON = document.getElementById('btn-export-json');
  if (btnExportJSON) {
    btnExportJSON.addEventListener('click', () => {
      Promise.all([
        window.MedicineDB?.getAllMedicines ? window.MedicineDB.getAllMedicines() : Promise.resolve([]),
        window.MedicineDB?.getAllDoseLogs ? window.MedicineDB.getAllDoseLogs() : Promise.resolve([])
      ]).then(([meds, logs]) => {
        const backupData = {
          export_timestamp: new Date().toISOString(),
          user_profile: {
            name: localStorage.getItem('user_name') || '',
            age: localStorage.getItem('user_age') || '',
            language: localStorage.getItem('language') || 'en',
            tts_enabled: localStorage.getItem('tts_enabled') || 'no'
          },
          medicines: meds,
          dose_logs: logs
        };

        const jsonString = JSON.stringify(backupData, null, 2);
        const dateStr = new Date().toISOString().split('T')[0];
        triggerDownload(jsonString, `medica_full_backup_${dateStr}.json`, 'application/json;charset=utf-8;');
        showExportNotice('✓ JSON backup exported successfully!');
      }).catch(err => {
        console.error('Failed to export JSON:', err);
        alert('Could not generate JSON backup.');
      });
    });
  }
});
