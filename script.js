(() => {
  "use strict";

  // Countdown logic with fade effect on update
  const startDate = new Date(2024, 6, 17, 0, 0, 0); // Julho é 6 (zero-based)
  const yearsEl = document.getElementById("years");
  const monthsEl = document.getElementById("months");
  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");

  function animateNumberChange(el, newVal) {
    if (el.textContent === String(newVal)) return;
    el.classList.add('fade');
    setTimeout(() => {
      el.textContent = newVal;
      el.classList.remove('fade');
    }, 300);
  }

  function updateCountdown() {
    const now = new Date();
    let totalSeconds = Math.floor((now - startDate) / 1000);
    if (totalSeconds < 0) totalSeconds = 0;

    let years = now.getFullYear() - startDate.getFullYear();
    let months = now.getMonth() - startDate.getMonth();
    let days = now.getDate() - startDate.getDate();
    let hours = now.getHours() - startDate.getHours();
    let minutes = now.getMinutes() - startDate.getMinutes();
    let seconds = now.getSeconds() - startDate.getSeconds();

    if (seconds < 0) {
      seconds += 60;
      minutes--;
    }
    if (minutes < 0) {
      minutes += 60;
      hours--;
    }
    if (hours < 0) {
      hours += 24;
      days--;
    }
    if (days < 0) {
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
      months--;
    }
    if (months < 0) {
      months += 12;
      years--;
    }
    if (years < 0) years = 0;

    animateNumberChange(yearsEl, years);
    animateNumberChange(monthsEl, months);
    animateNumberChange(daysEl, days);
    animateNumberChange(hoursEl, hours);
    animateNumberChange(minutesEl, minutes);
    animateNumberChange(secondsEl, seconds);
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // Carousel logic
  const track = document.querySelector(".carousel-track");
  const items = Array.from(track.children);
  const prevBtn = document.querySelector(".prev-button");
  const nextBtn = document.querySelector(".next-button");
  let currentIndex = 0;

  function updateCarousel() {
    const width = items[0].getBoundingClientRect().width;
    track.style.transform = `translateX(-${currentIndex * width}px)`;
    items.forEach((item, idx) => {
      item.setAttribute("aria-hidden", idx !== currentIndex);
      item.style.transition = "opacity 0.8s ease, transform 0.6s ease";
    });
  }
  updateCarousel();

  prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    updateCarousel();
  });
  nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % items.length;
    updateCarousel();
  });

  window.addEventListener("resize", updateCarousel);

  track.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") {
      currentIndex = (currentIndex - 1 + items.length) % items.length;
      updateCarousel();
      e.preventDefault();
    } else if (e.key === "ArrowRight") {
      currentIndex = (currentIndex + 1) % items.length;
      updateCarousel();
      e.preventDefault();
    }
  });

  // Calendar logic
  const monthYearEl = document.getElementById("month-year");
  const daysGrid = document.getElementById("days-grid");
  const prevMonthBtn = document.getElementById("prev-month");
  const nextMonthBtn = document.getElementById("next-month");
  const specialDateForm = document.getElementById("special-date-form");
  const specialDateInput = document.getElementById("special-date-input");
  const specialDescInput = document.getElementById("special-desc-input");

  let today = new Date();
  let calendarMonth = today.getMonth();
  let calendarYear = today.getFullYear();

  const STORAGE_KEY = "special-love-dates";

  function loadSpecialDates() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  let specialDates = loadSpecialDates();

  function saveSpecialDates() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(specialDates));
  }

  function isSpecialDate(year, month, day) {
    return specialDates.some(ev =>
      ev.year === year && ev.month === month && ev.day === day
    );
  }

  function getSpecialDateDesc(year, month, day) {
    const event = specialDates.find(ev =>
      ev.year === year && ev.month === month && ev.day === day
    );
    return event ? event.description : null;
  }

  function isMarked17(day) {
    return day === 17;
  }

  function buildCalendar(month, year) {
    daysGrid.innerHTML = "";
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    monthYearEl.textContent = firstDay.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

    for (let i = 0; i < startDayOfWeek; i++) {
      const emptyCell = document.createElement("div");
      emptyCell.classList.add("calendar-day");
      emptyCell.setAttribute("aria-hidden", "true");
      emptyCell.tabIndex = -1;
      daysGrid.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayEl = document.createElement("div");
      dayEl.classList.add("calendar-day");
      dayEl.setAttribute("role", "gridcell");
      dayEl.setAttribute("tabindex", "0");
      dayEl.textContent = day;

      const isToday = (year === today.getFullYear() && month === today.getMonth() && day === today.getDate());
      if (isToday) {
        dayEl.classList.add("today");
      }
      if (isMarked17(day)) {
        dayEl.classList.add("marked-17");
      }
      if (isSpecialDate(year, month, day)) {
        dayEl.classList.add("has-event");
        const desc = getSpecialDateDesc(year, month, day);
        dayEl.setAttribute("title", desc);
        const dot = document.createElement("div");
        dot.classList.add("event-dot");
        dayEl.appendChild(dot);
      }

      dayEl.addEventListener("click", () => {
        if (isSpecialDate(year, month, day)) {
          if (confirm(`Deseja remover a data especial: "${getSpecialDateDesc(year, month, day)}"?`)) {
            specialDates = specialDates.filter(ev => !(ev.year === year && ev.month === month && ev.day === day));
            saveSpecialDates();
            buildCalendar(calendarMonth, calendarYear);
          }
        }
      });

      daysGrid.appendChild(dayEl);
    }
  }
  buildCalendar(calendarMonth, calendarYear);

  prevMonthBtn.addEventListener("click", () => {
    calendarMonth--;
    if (calendarMonth < 0) {
      calendarMonth = 11;
      calendarYear--;
    }
    buildCalendar(calendarMonth, calendarYear);
  });
  nextMonthBtn.addEventListener("click", () => {
    calendarMonth++;
    if (calendarMonth > 11) {
      calendarMonth = 0;
      calendarYear++;
    }
    buildCalendar(calendarMonth, calendarYear);
  });

  specialDateForm.addEventListener("submit", e => {
    e.preventDefault();
    const dateVal = specialDateInput.value;
    const descVal = specialDescInput.value.trim();
    if (!dateVal || !descVal) return;

    const date = new Date(dateVal);
    if (date < startDate) {
      alert("Data especial deve ser após 17/07/2024.");
      return;
    }

    const existing = specialDates.find(ev =>
      ev.year === date.getFullYear() &&
      ev.month === date.getMonth() &&
      ev.day === date.getDate()
    );
    if (existing) {
      existing.description = descVal;
    } else {
      specialDates.push({
        year: date.getFullYear(),
        month: date.getMonth(),
        day: date.getDate(),
        description: descVal,
      });
    }
    saveSpecialDates();

    if (date.getFullYear() === calendarYear && date.getMonth() === calendarMonth) {
      buildCalendar(calendarMonth, calendarYear);
    }
    specialDateForm.reset();
    specialDateInput.focus();
  });

  // Music player logic
  const musicListEl = document.querySelector(".music-list");
  const audioPlayer = document.getElementById("audio-player");

  const songs = [
    {
      title: "LOYALTY",
      artist: "Kendrick Lamar",
      src: "LOYALTY ft. Rihanna - Kendrick Lamar (DAMN).mp3"
    },
    {
      title: "Make Me Wanna",
      artist: "Vedo",
      src: "Vedo - Make Me Wanna (Audio).mp3"
    },
    {
      title: "Tonight",
      artist: "Summer Walker",
      src: "Summer Walker - Tonight [Official Audio].mp3"
    },
    {
      title: "sdp interlude",
      artist: "Travis Scott",
      src: "Travis Scott - SDP Interlude (Lyrics).mp3"
    },
  ];

  let currentSongIndex = -1;

  function renderMusicList() {
    musicListEl.innerHTML = "";
    songs.forEach((song, index) => {
      const item = document.createElement("div");
      item.setAttribute("tabindex", "0");
      item.setAttribute("role", "listitem");
      item.classList.add("music-item");
      if (index === currentSongIndex) item.classList.add("active");

      item.innerHTML = `
        <span class="material-icons" aria-hidden="true">music_note</span>
        <span>${song.title} - <em>${song.artist}</em></span>
      `;

      item.addEventListener("click", () => {
        playSong(index);
      });
      item.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
          playSong(index);
          e.preventDefault();
        }
      });
      musicListEl.appendChild(item);
    });
  }

  function playSong(index) {
    if (index < 0 || index >= songs.length) return;
    if (index === currentSongIndex) {
      if (audioPlayer.paused) audioPlayer.play();
      else audioPlayer.pause();
      return;
    }
    currentSongIndex = index;
    audioPlayer.src = songs[index].src;
    audioPlayer.play();
    renderMusicList();
  }

  audioPlayer.addEventListener("ended", () => {
    const nextIndex = (currentSongIndex + 1) % songs.length;
    playSong(nextIndex);
  });

  renderMusicList();

})();
