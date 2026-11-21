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
  let currentUpcomingTime = null;
  let activeMedicines = [];

  function renderTodayDoses(doses) {
    if (loggedCountBadge) loggedCountBadge.textContent = `${doses.length} taken`;
    if (!todayDosesList) return;
    todayDosesList.innerHTML = doses.length === 0
      ? '<p class="empty-state-text">No medicines logged yet today.</p>'
      : doses.map(dose => `
        <div class="dose-log-item">
          <span class="dose-log-name">✓ ${dose.medicine_name}</span>
          <span class="dose-log-time">${dose.timestamp_label}</span>
        </div>
      `).join('');
  }

  function getMedicineTimes(medicine) {
    const times = Array.isArray(medicine.times) && medicine.times.length
      ? medicine.times
      : (medicine.time ? [medicine.time] : []);
    return [...new Set(times)].sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
  }

  function timeToMinutes(time) {
    const match = String(time || '').match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return Number.MAX_SAFE_INTEGER;
    let hour = Number(match[1]) % 12;
    if (match[3].toUpperCase() === 'PM') hour += 12;
    return hour * 60 + Number(match[2]);
  }

  function isScheduledToday(medicine) {
    if (medicine.scheduleType === 'daily' || !medicine.scheduleType) return true;
    const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
    return (medicine.days || []).includes(weekday) || (medicine.days || []).includes('Every day');
  }

  function findUpcomingSlot(doses) {
    const candidates = [];
    activeMedicines.forEach(medicine => {
      if (!isScheduledToday(medicine)) return;
      const times = getMedicineTimes(medicine);
      const medicineLogs = doses.filter(dose => String(dose.medicine_id) === String(medicine.id));
      const completedTimes = new Set(medicineLogs.filter(dose => dose.scheduled_time).map(dose => dose.scheduled_time));
      let legacyLogs = medicineLogs.filter(dose => !dose.scheduled_time).length;

      times.forEach(time => {
        if (completedTimes.has(time)) return;
        if (legacyLogs > 0) {
          legacyLogs -= 1;
          return;
        }
        candidates.push({ medicine, time, minutes: timeToMinutes(time) });
      });
    });
    candidates.sort((a, b) => a.minutes - b.minutes);
    return candidates[0] || null;
  }

  function updateUpcomingMedicine(doses, allMedicines) {
    const slot = findUpcomingSlot(doses);
    currentUpcomingMed = slot?.medicine || null;
    currentUpcomingTime = slot?.time || null;

    if (upcomingName) {
      upcomingName.textContent = slot
        ? slot.medicine.name
        : (activeMedicines.length ? 'No more medicine for today' : (allMedicines.length ? 'No active medicines' : 'No medicines added yet'));
    }
    if (upcomingDosage) {
      upcomingDosage.textContent = slot
        ? (slot.medicine.dosage || 'Standard dose')
        : (activeMedicines.length ? '' : (allMedicines.length ? 'Archived medicines are hidden from your active schedule.' : 'Tap "+ Add Medicine" to create your first schedule'));
    }
    if (upcomingSchedule) {
      upcomingSchedule.textContent = slot
        ? (slot.medicine.scheduleType === 'daily' ? 'Daily' : (slot.medicine.days || []).join(', '))
        : '--';
    }
    if (upcomingTimeBadge) upcomingTimeBadge.textContent = slot ? slot.time : '--';
    if (upcomingExtra) {
      upcomingExtra.textContent = slot ? (slot.medicine.extra || 'No extra instructions specified.') : '';
      upcomingExtra.style.display = slot ? 'block' : 'none';
    }
    if (upcomingImg) upcomingImg.src = slot?.medicine.photo?.trim() || 'assets/medica.svg';
    if (btnMedicineTaken) {
      btnMedicineTaken.style.display = slot ? '' : 'none';
      btnMedicineTaken.disabled = false;
      btnMedicineTaken.textContent = 'Medicine taken';
      btnMedicineTaken.classList.remove('logged-success');
    }
    if (doseStatusText) doseStatusText.textContent = slot ? `Scheduled for ${slot.time}` : (activeMedicines.length ? 'All scheduled times are complete' : '');

    if (window.TTS && window.TTS.isEnabled()) {
      const scheduleDescription = slot
        ? (slot.medicine.scheduleType === 'daily' ? 'Daily' : (slot.medicine.days || []).join(', '))
        : '';
      const announcement = slot
        ? `Upcoming medicine: ${slot.medicine.name}. Dosage: ${slot.medicine.dosage || 'as prescribed'}. Scheduled at ${slot.time}. Schedule: ${scheduleDescription}.${slot.medicine.extra ? ` Instructions: ${slot.medicine.extra}.` : ''}`
        : (activeMedicines.length
          ? 'No more medicine for today. All scheduled times are complete.'
          : (allMedicines.length
            ? 'No active medicines. Archived medicines are hidden from your active schedule.'
            : 'No medicines added yet.'));
      window.setTimeout(() => window.TTS.speak(announcement), 400);
    }
  }

  function renderAllMedicines(allMedicines) {
    if (!allMedicinesList) return;
    allMedicinesList.innerHTML = activeMedicines.length
      ? activeMedicines.map(med => {
        const imgSrc = (med.photo && med.photo.trim().length > 0) ? med.photo : 'assets/medica.svg';
        const sched = med.scheduleType === 'daily' ? 'Daily' : (med.days || []).join(', ');
        const times = getMedicineTimes(med).join(', ');
        return `
          <div class="prescription-item">
            <img src="${imgSrc}" alt="${med.name}" class="prescription-thumb">
            <div class="prescription-info">
              <h4>${med.name}</h4>
              <p>${med.dosage} &bull; ${times} &bull; ${sched}</p>
            </div>
            <button type="button" class="archive-medicine-btn" data-archive-medicine="${med.id}" aria-label="Archive ${med.name}">Archive</button>
          </div>
        `;
      }).join('')
      : (allMedicines.length
        ? '<p class="empty-state-text">No active medicines. Add a medicine to create a schedule.</p>'
        : '<p class="empty-state-text">No medicines registered yet.</p>');
  }

  // Select the earliest uncompleted time slot scheduled for today.
  if (window.MedicineDB && window.MedicineDB.getAllMedicines) {
    window.MedicineDB.getAllMedicines().then(allMedicines => {
      activeMedicines = allMedicines.filter(medicine => !medicine.archived);
      renderAllMedicines(allMedicines);
      return window.MedicineDB.getTodayDoses().then(doses => {
        renderTodayDoses(doses);
        updateUpcomingMedicine(doses, allMedicines);
      });
    }).catch(err => console.error('Error loading dashboard medicines:', err));
  }
  // 5. Button in bottom right named "Medicine taken" which logs usage
  if (btnMedicineTaken) {
    btnMedicineTaken.addEventListener('click', () => {
      if (!currentUpcomingMed || !currentUpcomingTime) return;

      btnMedicineTaken.disabled = true;
      btnMedicineTaken.textContent = 'Logging...';

      if (window.MedicineDB && window.MedicineDB.logDose) {
        const loggedMedicine = currentUpcomingMed;
        const loggedTime = currentUpcomingTime;
        window.MedicineDB.logDose(loggedMedicine, loggedTime)
          .then((loggedEntry) => {
            btnMedicineTaken.textContent = '✓ Taken Today';
            btnMedicineTaken.classList.add('logged-success');

            if (doseStatusText) {
              doseStatusText.textContent = `Last taken at ${loggedEntry.timestamp_label}`;
            }

            // Recalculate the next scheduled slot after every completed dose.
            Promise.all([window.MedicineDB.getAllMedicines(), window.MedicineDB.getTodayDoses()])
              .then(([allMedicines, doses]) => {
                activeMedicines = allMedicines.filter(medicine => !medicine.archived);
                renderTodayDoses(doses);
                updateUpcomingMedicine(doses, allMedicines);
              })
              .catch(err => console.error('Could not refresh today schedule:', err));

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
