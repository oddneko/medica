// Main dashboard application script
document.addEventListener('DOMContentLoaded', () => {
  const launchParams = new URLSearchParams(window.location.search);
  const arrivingFromWelcome = launchParams.get('launch') === '1';

  if (arrivingFromWelcome) {
    history.replaceState(null, '', 'index.html');
  }

  // 1. Check for first-time user launch
  const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
  if (!hasCompletedOnboarding) {
    window.location.href = 'landing-1.html';
    return;
  }

  // Show the launch welcome once, then keep later dashboard visits direct.
  const skipLaunchWelcome = sessionStorage.getItem('medica_skip_launch_welcome') === '1';
  const hasSeenLaunchWelcome = localStorage.getItem('medica_launch_welcome_seen') === 'true';
  if (!arrivingFromWelcome && !skipLaunchWelcome && !hasSeenLaunchWelcome) {
    window.location.replace('landing-welcome.html');
    return;
  }
  sessionStorage.removeItem('medica_skip_launch_welcome');

  // Add-medicine form opens over the dashboard and reports successful saves here.
  const medicineModal = document.getElementById('medicine-modal');
  const medicineFrame = document.getElementById('medicine-modal-frame');
  let modalCloseTimer = null;
  const closeMedicineModal = (afterClose) => {
    if (!medicineModal) return;
    if (medicineModal.hidden) {
      afterClose?.();
      return;
    }
    if (modalCloseTimer) return;
    medicineModal.classList.add('is-closing');
    modalCloseTimer = window.setTimeout(() => {
      medicineModal.hidden = true;
      medicineModal.classList.remove('is-closing');
      document.body.classList.remove('modal-open');
      medicineFrame.src = 'about:blank';
      modalCloseTimer = null;
      afterClose?.();
    }, 240);
  };
  const handleMedicineSaved = () => {
    closeMedicineModal(() => {
      sessionStorage.setItem('medica_skip_launch_welcome', '1');
      window.location.reload();
    });
  };
  // Same-origin iframe calls this directly after IndexedDB confirms the save.
  window.medicaMedicineSaved = handleMedicineSaved;
  document.querySelectorAll('[data-open-medicine-modal]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      if (!medicineModal || !medicineFrame) return;
      medicineFrame.src = 'landing-3.html?modal=1';
      medicineModal.hidden = false;
      medicineModal.classList.remove('is-closing');
      document.body.classList.add('modal-open');
      medicineModal.querySelector('.medicine-modal-close')?.focus();
    });
  });
  medicineModal?.querySelectorAll('[data-close-medicine-modal]').forEach(button => button.addEventListener('click', closeMedicineModal));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && medicineModal && !medicineModal.hidden) closeMedicineModal();
  });
  window.addEventListener('message', event => {
    if (event.origin !== window.location.origin) return;
    if (event.data?.type === 'medicine-saved') {
      handleMedicineSaved();
    }
  });

  // 2. Populate Independent Welcome Box at the top
  const userName = localStorage.getItem('user_name') || 'Friend';
  const welcomeHeading = document.getElementById('welcome-heading');
  const dateBadge = document.getElementById('today-date-badge');

  if (welcomeHeading) {
    welcomeHeading.textContent = `Welcome back, ${userName}! 👋`;
  }

  if (dateBadge) {
    const today = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const locale = { es: 'es-ES', fr: 'fr-FR', de: 'de-DE', hi: 'hi-IN' }[localStorage.getItem('language')] || undefined;
    dateBadge.textContent = today.toLocaleDateString(locale, options);
  }

  // UI Elements for Upcoming Medicine
  const upcomingName = document.getElementById('upcoming-name');
  const upcomingDosage = document.getElementById('upcoming-dosage');
  const upcomingSchedule = document.getElementById('upcoming-schedule-type');
  const upcomingTimeBadge = document.getElementById('upcoming-time-badge');
  const upcomingExtra = document.getElementById('upcoming-extra');
  const upcomingImg = document.getElementById('upcoming-img');
  const btnMedicineTaken = document.getElementById('btn-medicine-taken');
  const doseStatusText = document.getElementById('dose-status-text');
  const loggedCountBadge = document.getElementById('logged-count-badge');
  const todayDosesList = document.getElementById('today-doses-list');
  const allMedicinesList = document.getElementById('all-medicines-list');

  allMedicinesList?.addEventListener('click', event => {
    const archiveButton = event.target.closest('[data-archive-medicine]');
    if (!archiveButton || !window.MedicineDB?.archiveMedicine) return;

    archiveButton.disabled = true;
    archiveButton.textContent = 'Archiving…';
    window.MedicineDB.archiveMedicine(archiveButton.dataset.archiveMedicine)
      .then(() => {
        sessionStorage.setItem('medica_skip_launch_welcome', '1');
        window.location.reload();
      })
      .catch(error => {
        console.error('Could not archive medicine:', error);
        archiveButton.disabled = false;
        archiveButton.textContent = 'Archive';
      });
  });

  let currentUpcomingMed = null;

  // 3. Render Today's Logged Doses
  function renderTodayDoses() {
    if (!window.MedicineDB || !window.MedicineDB.getTodayDoses) return;

    window.MedicineDB.getTodayDoses().then(doses => {
      if (loggedCountBadge) {
        loggedCountBadge.textContent = `${doses.length} taken`;
      }

      if (!todayDosesList) return;

      if (doses.length === 0) {
        todayDosesList.innerHTML = '<p class="empty-state-text">No medicines logged yet today.</p>';
      } else {
        todayDosesList.innerHTML = doses.map(dose => `
          <div class="dose-log-item">
            <span class="dose-log-name">✓ ${dose.medicine_name}</span>
            <span class="dose-log-time">${dose.timestamp_label}</span>
          </div>
        `).join('');
      }
    }).catch(err => console.error('Error fetching today doses:', err));
  }

  // 4. Load Medicines from IndexedDB
  if (window.MedicineDB && window.MedicineDB.getAllMedicines) {
    window.MedicineDB.getAllMedicines().then(medicines => {
      const activeMedicines = medicines.filter(medicine => !medicine.archived);
      if (activeMedicines.length > 0) {
        // Pick the first/upcoming medicine
        currentUpcomingMed = activeMedicines[0];

        // 1. Image on the right (fallback to assets/medica.svg if not uploaded)
        if (upcomingImg) {
          if (currentUpcomingMed.photo && currentUpcomingMed.photo.trim().length > 0) {
            upcomingImg.src = currentUpcomingMed.photo;
          } else {
            upcomingImg.src = 'assets/medica.svg';
          }
        }

        // 2. Name on the left in large font
        if (upcomingName) {
          upcomingName.textContent = currentUpcomingMed.name;
        }

        // Dosage and schedule
        if (upcomingDosage) {
          upcomingDosage.textContent = currentUpcomingMed.dosage || 'Standard dose';
        }

        if (upcomingSchedule) {
          const scheduleStr = currentUpcomingMed.scheduleType === 'daily'
            ? 'Daily'
            : (currentUpcomingMed.days && currentUpcomingMed.days.length > 0 ? currentUpcomingMed.days.join(', ') : 'Custom days');
          upcomingSchedule.textContent = scheduleStr;
        }

        if (upcomingTimeBadge) {
          upcomingTimeBadge.textContent = currentUpcomingMed.time || 'Scheduled';
        }

        // Additional information with slightly smaller font right below medicine name
        if (upcomingExtra) {
          if (currentUpcomingMed.extra && currentUpcomingMed.extra.trim().length > 0) {
            upcomingExtra.textContent = currentUpcomingMed.extra;
            upcomingExtra.style.display = 'block';
          } else {
            upcomingExtra.textContent = 'No extra instructions specified.';
            upcomingExtra.style.display = 'block';
          }
        }

        // Announce the upcoming medicine as soon as the dashboard loads.
        if (window.TTS && window.TTS.isEnabled()) {
          const announcement = `Upcoming medicine: ${currentUpcomingMed.name}. Dosage: ${currentUpcomingMed.dosage || 'as prescribed'}. Scheduled at ${currentUpcomingMed.time || 'scheduled time'}.`;
          // Let the dashboard render before starting speech.
          window.setTimeout(() => {
            window.TTS.speak(announcement);
          }, 400);
        }

        // 3. Render All Prescriptions
        if (allMedicinesList) {
          allMedicinesList.innerHTML = activeMedicines.map(med => {
            const imgSrc = (med.photo && med.photo.trim().length > 0) ? med.photo : 'assets/medica.svg';
            const sched = med.scheduleType === 'daily' ? 'Daily' : (med.days || []).join(', ');
            return `
              <div class="prescription-item">
                <img src="${imgSrc}" alt="${med.name}" class="prescription-thumb">
                <div class="prescription-info">
                  <h4>${med.name}</h4>
                  <p>${med.dosage} &bull; ${med.time} &bull; ${sched}</p>
                </div>
                <button type="button" class="archive-medicine-btn" data-archive-medicine="${med.id}" aria-label="Archive ${med.name}">Archive</button>
              </div>
            `;
          }).join('');
        }
      } else {
        // No medicines found
        if (upcomingName) upcomingName.textContent = medicines.length ? 'No active medicines' : 'No medicines added yet';
        if (upcomingDosage) {
          upcomingDosage.textContent = medicines.length
            ? 'Archived medicines are hidden from your active schedule.'
            : 'Tap "+ Add Medicine" to create your first schedule';
        }
        if (upcomingExtra) upcomingExtra.style.display = 'none';
        if (upcomingImg) upcomingImg.src = 'assets/medica.svg';
        if (btnMedicineTaken) btnMedicineTaken.style.display = 'none';
        if (allMedicinesList) {
          allMedicinesList.innerHTML = medicines.length
            ? '<p class="empty-state-text">No active medicines. Add a medicine to create a schedule.</p>'
            : '<p class="empty-state-text">No medicines registered yet.</p>';
        }
      }

      // Initial check for today's logs
      renderTodayDoses();
    }).catch(err => {
      console.error('Error fetching medicines:', err);
    });
  }

  // 5. Button in bottom right named "Medicine taken" which logs usage
  if (btnMedicineTaken) {
    btnMedicineTaken.addEventListener('click', () => {
      if (!currentUpcomingMed) return;

      btnMedicineTaken.disabled = true;
      btnMedicineTaken.textContent = 'Logging...';

      if (window.MedicineDB && window.MedicineDB.logDose) {
        window.MedicineDB.logDose(currentUpcomingMed)
          .then((loggedEntry) => {
            btnMedicineTaken.textContent = '✓ Taken Today';
            btnMedicineTaken.classList.add('logged-success');

            if (doseStatusText) {
              doseStatusText.textContent = `Last taken at ${loggedEntry.timestamp_label}`;
            }

            // TTS confirmation read-aloud
            if (window.TTS && window.TTS.isEnabled()) {
              window.TTS.speak(`${currentUpcomingMed.name} dose logged at ${loggedEntry.timestamp_label}. Well done!`);
            }

            // Refresh today's logs
            renderTodayDoses();

            // Re-enable after 3 seconds if they want to log another dose later
            setTimeout(() => {
              btnMedicineTaken.disabled = false;
              btnMedicineTaken.textContent = 'Log another dose';
              btnMedicineTaken.classList.remove('logged-success');
            }, 3500);
          })
          .catch(err => {
            console.error('Failed to log dose:', err);
            btnMedicineTaken.disabled = false;
            btnMedicineTaken.textContent = 'Medicine taken';
          });
      }
    });
  }

  console.log('MEDICA Dashboard initialized.');
});
