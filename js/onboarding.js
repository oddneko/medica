// Onboarding flow logic
document.addEventListener('DOMContentLoaded', () => {
  // Medicine setup form (landing-3)
  const medicineForm = document.getElementById('medicine-form');
  if (medicineForm) {
    let photoBase64 = null;
    let selectedHour = '08';
    let selectedMinute = '00';
    let selectedPeriod = 'AM';
    const openedAsModal = new URLSearchParams(window.location.search).get('modal') === '1';

    // 1. Photo Upload & Preview
    const fileInput = document.getElementById('medicine-photo');
    const photoUploadBtn = document.getElementById('photo-upload-btn');
    const photoPreviewImg = document.getElementById('photo-preview-img');
    const photoPlaceholderIcon = document.getElementById('photo-placeholder-icon');

    if (photoUploadBtn && fileInput) {
      photoUploadBtn.addEventListener('click', () => fileInput.click());
      photoUploadBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          fileInput.click();
        }
      });

      fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            photoBase64 = e.target.result;
            if (photoPreviewImg && photoPlaceholderIcon) {
              photoPreviewImg.src = photoBase64;
              photoPreviewImg.style.display = 'block';
              photoPlaceholderIcon.style.display = 'none';
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // 2. Schedule toggle (Daily vs Pick Days)
    const scheduleBtns = document.querySelectorAll('.schedule-btn');
    const scheduleTypeInput = document.getElementById('schedule-type');
    const daysPicker = document.getElementById('days-picker');

    scheduleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        scheduleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const type = btn.getAttribute('data-schedule');
        if (scheduleTypeInput) scheduleTypeInput.value = type;

        if (daysPicker) {
          daysPicker.style.display = type === 'pick-days' ? 'flex' : 'none';
        }
      });
    });

    // Day chip toggling: listen to native checkbox change
    document.querySelectorAll('.day-chip input[type="checkbox"]').forEach(checkbox => {
      const chip = checkbox.closest('.day-chip');
      checkbox.addEventListener('change', () => {
        chip.classList.toggle('selected', checkbox.checked);
      });
      // Set initial state
      if (checkbox.checked) {
        chip.classList.add('selected');
      }
    });

    // 3. Scrollable Clock Logic
    const hourWheel = document.getElementById('clock-hour-wheel');
    const minuteWheel = document.getElementById('clock-minute-wheel');
    const timeInput = document.getElementById('medicine-time');

    function updateTimeValue() {
      if (timeInput) {
        timeInput.value = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;
      }
    }

    function setupWheel(wheel, onSelect) {
      if (!wheel) return;
      const items = wheel.querySelectorAll('.clock-item');

      wheel.addEventListener('scroll', () => {
        clearTimeout(wheel._scrollTimer);
        wheel._scrollTimer = setTimeout(() => {
          const wheelRect = wheel.getBoundingClientRect();
          const wheelCenter = wheelRect.top + wheelRect.height / 2;

          let closestItem = null;
          let minDistance = Infinity;

          items.forEach(item => {
            const itemRect = item.getBoundingClientRect();
            const itemCenter = itemRect.top + itemRect.height / 2;
            const distance = Math.abs(wheelCenter - itemCenter);
            if (distance < minDistance) {
              minDistance = distance;
              closestItem = item;
            }
          });

          if (closestItem) {
            items.forEach(i => i.classList.remove('active'));
            closestItem.classList.add('active');
            onSelect(closestItem.getAttribute('data-val'));
            updateTimeValue();
          }
        }, 80);
      });

      items.forEach(item => {
        item.addEventListener('click', () => {
          items.forEach(i => i.classList.remove('active'));
          item.classList.add('active');
          item.scrollIntoView({ behavior: 'smooth', block: 'center' });
          onSelect(item.getAttribute('data-val'));
          updateTimeValue();
        });
      });
    }

    setupWheel(hourWheel, (val) => { selectedHour = val; });
    setupWheel(minuteWheel, (val) => { selectedMinute = val; });

    // Scroll initial active items into view
    setTimeout(() => {
      const activeHour = hourWheel?.querySelector('.clock-item.active');
      const activeMinute = minuteWheel?.querySelector('.clock-item.active');
      activeHour?.scrollIntoView({ block: 'center' });
      activeMinute?.scrollIntoView({ block: 'center' });
    }, 150);

    // AM/PM buttons
    document.querySelectorAll('.period-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedPeriod = btn.getAttribute('data-period');
        updateTimeValue();
      });
    });

    // 4. Form Submission & Save to IndexedDB
    medicineForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('medicine-name')?.value.trim();
      const scheduleType = scheduleTypeInput?.value || 'daily';
      const selectedDays = Array.from(document.querySelectorAll('#days-picker input:checked')).map(cb => cb.value);
      const time = timeInput?.value || `${selectedHour}:${selectedMinute} ${selectedPeriod}`;
      const dosage = document.getElementById('dosage')?.value.trim();
      const extra = document.getElementById('extra-info')?.value.trim();

      if (!name || !dosage) return;

      const record = {
        name,
        photo: photoBase64,
        scheduleType,
        days: scheduleType === 'pick-days' ? selectedDays : ['Every day'],
        time,
        dosage,
        extra: extra || '',
      };

      const submitBtn = document.getElementById('save-medicine-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
      }

      const proceedToDashboard = () => {
        if (openedAsModal) {
          if (typeof window.parent.medicaMedicineSaved === 'function') {
            window.parent.medicaMedicineSaved();
          } else {
            window.parent.postMessage({ type: 'medicine-saved' }, window.location.origin);
          }
          return;
        }
        localStorage.setItem('onboarding_completed', 'true');
        sessionStorage.setItem('medica_skip_launch_welcome', '1');
        document.body.classList.add('dissolve-out');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 500);
      };

      if (window.MedicineDB && window.MedicineDB.addMedicine) {
        window.MedicineDB.addMedicine(record)
          .then(() => {
            proceedToDashboard();
          })
          .catch((err) => {
            console.error('Error saving medicine into IndexedDB:', err);
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Save & Continue';
            }
            window.alert('Could not save this medicine. Please try again.');
          });
      } else {
        proceedToDashboard();
      }
    });
  }
});
