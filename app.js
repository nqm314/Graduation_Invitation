(function () {
  const cfg = window.INVITATION_CONFIG;
  if (!cfg) return;

  const $ = (id) => document.getElementById(id);

  // 1. Đổ dữ liệu từ config.js vào giao diện
  function hydrateContent() {
    document.title = `Thiệp Mời Lễ Tốt Nghiệp — ${cfg.graduate.fullName} (${cfg.graduate.university})`;

    // Envelope gate
    $("gate-title").textContent = cfg.graduate.fullName;
    $("gate-subtitle").textContent = `${cfg.graduate.university} · ${cfg.graduate.major} (${cfg.graduate.cohort})`;
    $("gate-meta").querySelector("span").textContent = `${cfg.ceremony.timeDisplay} · ${cfg.ceremony.dayOfWeek}, ${cfg.ceremony.dateDisplay}`;

    // Hero
    $("hero-badge").querySelector("span").textContent = cfg.graduate.titleBadge;
    $("hero-name").textContent = cfg.graduate.fullName;
    $("hero-major").innerHTML = `
      <strong>${escapeHtml(cfg.graduate.university)}</strong>
      <span>${escapeHtml(cfg.graduate.faculty)} · ${escapeHtml(cfg.graduate.major)}</span>
    `;
    $("hero-date").textContent = `${cfg.ceremony.dayOfWeek}, ${cfg.ceremony.dateDisplay}`;
    $("hero-time").textContent = cfg.ceremony.timeDisplay;
    $("hero-venue").textContent = `${cfg.ceremony.venueName} (${cfg.ceremony.campusNote})`;

    $("hero-photo").src = cfg.graduate.heroImage;
    $("hero-caption").textContent = cfg.graduate.heroCaption;
    $("keepsake-photo").src = cfg.graduate.keepsakeImage;

    // Countdown subtitle
    $("countdown-date-desc").textContent = `${cfg.ceremony.dateFull} · Lúc ${cfg.ceremony.timeDisplay.toLowerCase()}`;

    // Letter
    $("letter-greeting").textContent = cfg.letter.greeting;
    const letterBody = $("letter-body");
    letterBody.innerHTML = cfg.letter.paragraphs
      .map((text) => `<p>${escapeHtml(text)}</p>`)
      .join("");
    $("letter-closing").textContent = cfg.letter.closing;
    $("letter-signature").textContent = cfg.letter.signature;

    // Venue & Maps
    $("venue-name").textContent = cfg.ceremony.venueName;
    $("venue-address").textContent = cfg.ceremony.address;
    $("google-map-iframe").src = cfg.ceremony.googleMapsEmbedUrl;
    $("btn-open-maps").href = cfg.ceremony.googleMapsUrl;

    // Parking tips
    $("parking-tips-list").innerHTML = cfg.parkingTips
      .map(
        (tip) => `
        <li>
          <strong>${escapeHtml(tip.title)}</strong>
          <p>${escapeHtml(tip.detail)}</p>
        </li>
      `
      )
      .join("");

    // Contact
    $("contact-phone-link").textContent = cfg.contact.phoneDisplay;
    $("contact-phone-link").href = `tel:${cfg.contact.phoneRaw}`;
    $("btn-call-now").href = `tel:${cfg.contact.phoneRaw}`;
    $("btn-zalo-now").href = cfg.contact.zaloUrl;
    $("contact-note").textContent = cfg.contact.note;

    // Music title
    $("music-title").textContent = cfg.music.trackTitle;

    // Footer
    $("footer-meta").textContent = `Thiệp mời tốt nghiệp · ${cfg.graduate.fullName} · ${cfg.graduate.university} (${cfg.graduate.cohort})`;

    // Google Calendar link
    $("btn-google-calendar").href = buildGoogleCalendarUrl();
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // 2. Đồng hồ đếm ngược trực tiếp
  function startCountdown() {
    const target = new Date(cfg.ceremony.isoDateTime).getTime();
    const endTarget = new Date(cfg.ceremony.isoEndDateTime).getTime();

    function update() {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        $("cd-days").textContent = "00";
        $("cd-hours").textContent = "00";
        $("cd-minutes").textContent = "00";
        $("cd-seconds").textContent = "00";

        if (now <= endTarget) {
          $("countdown-status").innerHTML =
            "<strong>Lễ tốt nghiệp đang diễn ra!</strong> Hẹn gặp bạn tại Hội trường A5 ngay lúc này nhé!";
        } else {
          $("countdown-status").innerHTML =
            "<strong>Buổi lễ đã khép lại thật rực rỡ!</strong> Cảm ơn bạn đã đến chung vui cùng Hoàng.";
        }
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      $("cd-days").textContent = String(days).padStart(2, "0");
      $("cd-hours").textContent = String(hours).padStart(2, "0");
      $("cd-minutes").textContent = String(minutes).padStart(2, "0");
      $("cd-seconds").textContent = String(seconds).padStart(2, "0");
    }

    update();
    setInterval(update, 1000);
  }

  // 3. Tạo link Google Calendar & file .ics
  function toCalendarUtc(isoStr) {
    const d = new Date(isoStr);
    return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  }

  function buildGoogleCalendarUrl() {
    const title = `Lễ Tốt Nghiệp của ${cfg.graduate.fullName} (${cfg.graduate.universityShort})`;
    const details = `Tham dự lễ tốt nghiệp đại học của ${cfg.graduate.fullName} — ${cfg.graduate.major} (${cfg.graduate.cohort}). Liên hệ: ${cfg.contact.phoneDisplay}.`;
    const location = `${cfg.ceremony.venueName}, ${cfg.ceremony.address}`;
    const dates = `${toCalendarUtc(cfg.ceremony.isoDateTime)}/${toCalendarUtc(cfg.ceremony.isoEndDateTime)}`;

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: title,
      dates,
      details,
      location,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  function downloadIcsFile() {
    const start = toCalendarUtc(cfg.ceremony.isoDateTime);
    const end = toCalendarUtc(cfg.ceremony.isoEndDateTime);
    const summary = `Lễ Tốt Nghiệp - ${cfg.graduate.fullName}`;
    const location = `${cfg.ceremony.venueName}, ${cfg.ceremony.address}`;
    const description = `Chào mừng bạn đến dự Lễ Tốt Nghiệp của ${cfg.graduate.fullName} (${cfg.graduate.university} - ${cfg.graduate.major}). Liên hệ: ${cfg.contact.phoneDisplay}`;

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Graduation Invitation//VI",
      "BEGIN:VEVENT",
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${summary}`,
      `LOCATION:${location}`,
      `DESCRIPTION:${description}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Le-Tot-Nghiep-Nguyen-Quang-Minh.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Đã tải file lịch hẹn (.ics)!");
  }

  // 4. Thông báo Toast + Sao chép nhanh
  let toastTimer = null;
  function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("is-visible");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2600);
  }

  async function copyText(text, successMsg) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const temp = document.createElement("textarea");
        temp.value = text;
        temp.style.position = "fixed";
        temp.style.opacity = "0";
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        document.body.removeChild(temp);
      }
      showToast(successMsg);
    } catch {
      showToast("Không thể sao chép tự động, bạn vui lòng chọn thủ công nhé.");
    }
  }

  // 5. Hiệu ứng pháo giấy tông màu ấm khi mở thiệp
  function launchWarmConfetti() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = $("confetti-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    const colors = ["#c66b49", "#d69e4e", "#e8b973", "#385f82", "#f2d2b6", "#df8a68"];
    const pieces = Array.from({ length: 68 }, () => ({
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * 140,
      w: 6 + Math.random() * 6,
      h: 4 + Math.random() * 4,
      vx: (Math.random() - 0.5) * 2.2,
      vy: 2.2 + Math.random() * 3.1,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.14,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 0.9,
    }));

    const startTime = performance.now();
    const duration = 3600;

    function tick(now) {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const fade = elapsed > duration - 900 ? Math.max(0, (duration - elapsed) / 900) : 1;

      pieces.forEach((p) => {
        p.x += p.vx + Math.sin(elapsed * 0.003 + p.rot) * 0.5;
        p.y += p.vy;
        p.rot += p.vrot;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.opacity * fade;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      if (elapsed < duration) {
        requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    }

    requestAnimationFrame(tick);
  }

  // 6. Điều khiển màn hình mở thiệp & trình phát nhạc
  function setupEnvelopeAndMusic() {
    const gate = $("envelope-gate");
    const musicFab = $("music-fab");
    const musicStatus = $("music-status");

    function openInvitation(withMusic) {
      gate.classList.add("is-hidden");
      document.body.style.overflow = "";
      launchWarmConfetti();
      if (withMusic && window.MusicPlayer) {
        window.MusicPlayer.play();
      }
    }

    // Khóa cuộn nhẹ khi màn hình mở thiệp đang hiển thị
    document.body.style.overflow = "hidden";

    $("btn-open-with-music").addEventListener("click", () => openInvitation(true));
    $("btn-open-silent").addEventListener("click", () => openInvitation(false));

    if (window.MusicPlayer) {
      window.MusicPlayer.onStateChange((playing) => {
        musicFab.classList.toggle("is-playing", playing);
        musicFab.setAttribute("aria-pressed", String(playing));
        musicStatus.textContent = playing ? "Đang phát · Nhấn để tạm dừng" : "Đang tắt · Nhấn để bật nhạc";
      });

      musicFab.addEventListener("click", () => {
        window.MusicPlayer.toggle();
      });
    }
  }

  // 7. Scroll reveal mượt mà
  function setupScrollReveal() {
    const elements = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((el) => observer.observe(el));
  }

  // 8. Gắn các sự kiện nút bấm
  function setupActions() {
    $("btn-copy-address").addEventListener("click", () => {
      copyText(cfg.ceremony.address, "Đã sao chép địa chỉ Trường ĐH Bách Khoa!");
    });

    $("btn-copy-phone").addEventListener("click", () => {
      copyText(cfg.contact.phoneRaw, `Đã sao chép số điện thoại ${cfg.contact.phoneDisplay}!`);
    });

    $("btn-download-ics").addEventListener("click", downloadIcsFile);
    $("btn-footer-ics").addEventListener("click", downloadIcsFile);
  }

  hydrateContent();
  startCountdown();
  setupEnvelopeAndMusic();
  setupScrollReveal();
  setupActions();
})();
