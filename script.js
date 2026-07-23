// DEVWEBIA Public Interactive Logic & Dynamic CMS Loader
function applyCmsData(data) {
  if (!data) return;
  if (data.siteTitle) {
    document.querySelectorAll('[data-cms="siteTitle"]').forEach(el => el.textContent = data.siteTitle);
    document.title = data.siteTitle;
  }
  if (data.siteSlogan) {
    document.querySelectorAll('[data-cms="siteSlogan"]').forEach(el => el.textContent = data.siteSlogan);
  }
  if (data.siteLogo) {
    const container = document.getElementById("logo-container");
    if (container) {
      container.innerHTML = '<img src="' + data.siteLogo + '" class="w-full h-full object-cover rounded-2xl">';
    }
  }
  if (data.heroTitle) {
    document.querySelectorAll('[data-cms="heroTitle"]').forEach(el => el.textContent = data.heroTitle);
  }
  if (data.heroSubtitle) {
    document.querySelectorAll('[data-cms="heroSubtitle"]').forEach(el => el.textContent = data.heroSubtitle);
  }
  if (data.heroCta) {
    document.querySelectorAll('[data-cms="heroCta"]').forEach(el => el.textContent = data.heroCta);
  }
  if (data.heroImage) {
    const imgEl = document.getElementById("hero-custom-img");
    if (imgEl) {
      imgEl.src = data.heroImage;
    }
  }
  if (data.whatsapp) {
    const cleanWa = data.whatsapp.replace(/[^0-9]/g, "");
    document.querySelectorAll('[data-cms-wa-link]').forEach(el => {
      const origHref = el.getAttribute("href") || "";
      if (origHref.includes("text=")) {
        const txtPart = origHref.split("text=")[1];
        el.href = "https://wa.me/" + cleanWa + "?text=" + txtPart;
      } else {
        el.href = "https://wa.me/" + cleanWa;
      }
    });
    document.querySelectorAll('[data-cms="whatsapp"]').forEach(el => el.textContent = data.whatsapp);
  }
  if (data.footerText) {
    document.querySelectorAll('[data-cms="footerText"]').forEach(el => el.textContent = data.footerText);
  }
}

function loadCmsData() {
  const localData = localStorage.getItem("devwebia_site_cms");
  if (localData) {
    try { applyCmsData(JSON.parse(localData)); } catch(e){}
  }
  if (window.db) {
    window.db.collection("app_data").doc("site_content").get().then(doc => {
      if (doc.exists) {
        const data = doc.data();
        applyCmsData(data);
        localStorage.setItem("devwebia_site_cms", JSON.stringify(data));
      }
    }).catch(err => console.warn("Firestore CMS notice:", err));
  }
}

function toggleReadMore(targetId, btn) {
  const el = document.getElementById(targetId);
  if (el) {
    if (el.classList.contains("hidden")) {
      el.classList.remove("hidden");
      btn.innerHTML = '<span>Afeno ny tohiny</span> <i class="fa-solid fa-chevron-up text-xs"></i>';
    } else {
      el.classList.add("hidden");
      btn.innerHTML = '<span>Jereo ny tohiny</span> <i class="fa-solid fa-chevron-down text-xs"></i>';
    }
  }
}

function toggleFaq(card) {
  const p = card.querySelector("p");
  const icon = card.querySelector("i");
  if (p) {
    if (p.classList.contains("hidden")) {
      p.classList.remove("hidden");
      if (icon) icon.className = "fa-solid fa-minus text-blue-600 transition transform duration-300";
    } else {
      p.classList.add("hidden");
      if (icon) icon.className = "fa-solid fa-plus text-blue-600 transition transform duration-300";
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  loadCmsData();

  // PWA Service Worker Register & Install Prompt
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW reg error:', err));
  }

  let deferredPrompt;
  const pwaBtn = document.getElementById('pwa-install-btn');
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (pwaBtn) pwaBtn.classList.remove('hidden');
  });

  if (pwaBtn) {
    pwaBtn.addEventListener('click', () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            pwaBtn.classList.add('hidden');
          }
          deferredPrompt = null;
        });
      }
    });
  }

  // Hero quick form submit to WhatsApp
  const heroForm = document.getElementById("hero-form");
  if (heroForm) {
    heroForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = document.getElementById("hero-name").value;
      const phone = document.getElementById("hero-phone").value;
      const msg = document.getElementById("hero-msg").value;
      const waText = encodeURIComponent("Manahoana! Izaho dia " + name + " (" + phone + ").\n" + msg);
      const cmsData = localStorage.getItem("devwebia_site_cms") ? JSON.parse(localStorage.getItem("devwebia_site_cms")) : {};
      const activeWa = cmsData.whatsapp ? cmsData.whatsapp.replace(/[^0-9]/g, "") : "261340000000";
      window.open("https://wa.me/" + activeWa + "?text=" + waText, "_blank");
    });
  }

  // Full Enrollment Form Submit
  const enrollForm = document.getElementById("enrollment-form");
  if (enrollForm) {
    enrollForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const sName = document.getElementById("enroll-student-name").value;
      const dob = document.getElementById("enroll-dob").value;
      const eClass = document.getElementById("enroll-class").value;
      const pName = document.getElementById("enroll-parent-name").value;
      const phone = document.getElementById("enroll-phone").value;
      const email = document.getElementById("enroll-email").value;
      const notes = document.getElementById("enroll-notes").value;

      const waText = encodeURIComponent(
        "📝 **DEMANDE D'INSCRIPTION ONLINE**\n" +
        "- Mpianatra: " + sName + " (Daty nahaterahana: " + dob + ")\n" +
        "- Kilasy tiana: " + eClass + "\n" +
        "- Ray aman-dreny: " + pName + "\n" +
        "- Finday: " + phone + "\n" +
        "- Email: " + email + "\n" +
        "- Fanamarihana: " + notes
      );

      const cmsData = localStorage.getItem("devwebia_site_cms") ? JSON.parse(localStorage.getItem("devwebia_site_cms")) : {};
      const activeWa = cmsData.whatsapp ? cmsData.whatsapp.replace(/[^0-9]/g, "") : "261340000000";
      window.open("https://wa.me/" + activeWa + "?text=" + waText, "_blank");
    });
  }
});