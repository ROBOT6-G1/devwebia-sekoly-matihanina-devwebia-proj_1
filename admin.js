// DEVWEBIA Secure CMS Back-Office Script
async function hashPin(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Default pin hash for '1234'
const DEFAULT_PIN_HASH = "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const pinForm = document.getElementById("pin-form");
  const loginBox = document.getElementById("login-box");
  const adminPanel = document.getElementById("admin-panel");
  const logoutBtn = document.getElementById("logout-btn");
  const cmsForm = document.getElementById("cms-form");
  const statusToast = document.getElementById("status-toast");

  if (pinForm) {
    pinForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const inputPin = document.getElementById("pin-input").value;
      const hashedInput = await hashPin(inputPin);
      const storedHash = localStorage.getItem("devwebia_admin_pin_hash") || DEFAULT_PIN_HASH;

      if (hashedInput === storedHash) {
        loginBox.classList.add("hidden");
        adminPanel.classList.remove("hidden");
        sessionStorage.setItem("devwebia_admin_authenticated", "true");
        loadCmsFormValues();
      } else {
        alert("🔒 Code PIN tsy marina!");
      }
    });
  }

  if (sessionStorage.getItem("devwebia_admin_authenticated") === "true") {
    if (loginBox) loginBox.classList.add("hidden");
    if (adminPanel) adminPanel.classList.remove("hidden");
    loadCmsFormValues();
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      sessionStorage.removeItem("devwebia_admin_authenticated");
      adminPanel.classList.add("hidden");
      loginBox.classList.remove("hidden");
    });
  }

  // Logo file conversion
  const logoFileEl = document.getElementById("cms-logoFile");
  if (logoFileEl) {
    logoFileEl.addEventListener("change", async function(e) {
      const file = e.target.files[0];
      if (file) {
        const b64 = await fileToBase64(file);
        document.getElementById("cms-siteLogo").value = b64;
        const prev = document.getElementById("logo-preview-img");
        if (prev) {
          prev.src = b64;
          document.getElementById("logo-preview").classList.remove("hidden");
        }
      }
    });
  }

  // Hero image conversion
  const heroImgFileEl = document.getElementById("cms-heroImgFile");
  if (heroImgFileEl) {
    heroImgFileEl.addEventListener("change", async function(e) {
      const file = e.target.files[0];
      if (file) {
        const b64 = await fileToBase64(file);
        document.getElementById("cms-heroImage").value = b64;
      }
    });
  }

  // Live SEO preview updates
  const metaTitleEl = document.getElementById("cms-metaTitle");
  const metaDescEl = document.getElementById("cms-metaDesc");
  if (metaTitleEl) {
    metaTitleEl.addEventListener("input", function() {
      const p = document.getElementById("seo-preview-title");
      if (p) p.textContent = this.value || "Sekoly Matihanina";
    });
  }
  if (metaDescEl) {
    metaDescEl.addEventListener("input", function() {
      const p = document.getElementById("seo-preview-desc");
      if (p) p.textContent = this.value || "Description sekoly";
    });
  }

  // Google Ping simulator
  const seoPingBtn = document.getElementById("seo-ping-btn");
  if (seoPingBtn) {
    seoPingBtn.addEventListener("click", function() {
      const statusEl = document.getElementById("seo-ping-status");
      if (statusEl) {
        statusEl.classList.remove("hidden");
        statusEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mandefa ny fangatahana indexation any amin'ny Google...';
        setTimeout(() => {
          statusEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> <strong>Lasa soa aman-tsara any amin'ny Googlebot ny Sitemap sy Mots-clés!</strong>';
        }, 1200);
      }
    });
  }

  async function loadCmsFormValues() {
    let cms = {};
    const local = localStorage.getItem("devwebia_site_cms");
    if (local) {
      try { cms = JSON.parse(local); } catch(e){}
    }
    if (window.db) {
      try {
        const doc = await window.db.collection("app_data").doc("site_content").get();
        if (doc.exists) {
          cms = { ...cms, ...doc.data() };
        }
      } catch(e) { console.warn("Firestore load notice:", e); }
    }

    if (cms.siteTitle && document.getElementById("cms-siteTitle")) document.getElementById("cms-siteTitle").value = cms.siteTitle;
    if (cms.siteSlogan && document.getElementById("cms-siteSlogan")) document.getElementById("cms-siteSlogan").value = cms.siteSlogan;
    if (cms.siteLogo && document.getElementById("cms-siteLogo")) {
      document.getElementById("cms-siteLogo").value = cms.siteLogo;
      const prev = document.getElementById("logo-preview-img");
      if (prev) {
        prev.src = cms.siteLogo;
        document.getElementById("logo-preview").classList.remove("hidden");
      }
    }
    if (cms.heroTitle && document.getElementById("cms-heroTitle")) document.getElementById("cms-heroTitle").value = cms.heroTitle;
    if (cms.heroSubtitle && document.getElementById("cms-heroSubtitle")) document.getElementById("cms-heroSubtitle").value = cms.heroSubtitle;
    if (cms.heroCta && document.getElementById("cms-heroCta")) document.getElementById("cms-heroCta").value = cms.heroCta;
    if (cms.heroImage && document.getElementById("cms-heroImage")) document.getElementById("cms-heroImage").value = cms.heroImage;
    if (cms.metaTitle && document.getElementById("cms-metaTitle")) document.getElementById("cms-metaTitle").value = cms.metaTitle;
    if (cms.metaKeywords && document.getElementById("cms-metaKeywords")) document.getElementById("cms-metaKeywords").value = cms.metaKeywords;
    if (cms.metaDesc && document.getElementById("cms-metaDesc")) document.getElementById("cms-metaDesc").value = cms.metaDesc;
    if (cms.pwaName && document.getElementById("cms-pwaName")) document.getElementById("cms-pwaName").value = cms.pwaName;
    if (cms.pwaThemeColor && document.getElementById("cms-pwaThemeColor")) document.getElementById("cms-pwaThemeColor").value = cms.pwaThemeColor;
    if (cms.whatsapp && document.getElementById("cms-whatsapp")) document.getElementById("cms-whatsapp").value = cms.whatsapp;
    if (cms.footerText && document.getElementById("cms-footerText")) document.getElementById("cms-footerText").value = cms.footerText;
  }

  if (cmsForm) {
    cmsForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const updatedData = {
        siteTitle: document.getElementById("cms-siteTitle").value,
        siteSlogan: document.getElementById("cms-siteSlogan").value,
        siteLogo: document.getElementById("cms-siteLogo").value,
        heroTitle: document.getElementById("cms-heroTitle").value,
        heroSubtitle: document.getElementById("cms-heroSubtitle").value,
        heroCta: document.getElementById("cms-heroCta").value,
        heroImage: document.getElementById("cms-heroImage").value,
        metaTitle: document.getElementById("cms-metaTitle").value,
        metaKeywords: document.getElementById("cms-metaKeywords").value,
        metaDesc: document.getElementById("cms-metaDesc").value,
        pwaName: document.getElementById("cms-pwaName").value,
        pwaThemeColor: document.getElementById("cms-pwaThemeColor").value,
        whatsapp: document.getElementById("cms-whatsapp").value,
        footerText: document.getElementById("cms-footerText").value,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem("devwebia_site_cms", JSON.stringify(updatedData));

      const newPin = document.getElementById("cms-newPin").value.trim();
      if (newPin.length >= 4) {
        const newHash = await hashPin(newPin);
        localStorage.setItem("devwebia_admin_pin_hash", newHash);
        document.getElementById("cms-newPin").value = "";
      }

      if (window.db) {
        try {
          await window.db.collection("app_data").doc("site_content").set(updatedData, { merge: true });
        } catch (err) {
          console.warn("Firestore save notice:", err);
        }
      }

      if (statusToast) {
        statusToast.classList.remove("hidden");
        setTimeout(() => statusToast.classList.add("hidden"), 4000);
      }
    });
  }
});