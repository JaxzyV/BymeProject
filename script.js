/**
 * BymeProject - Form Pemesanan Mahar & Seserahan
 * Client-side Controller dengan Custom Toast, Animated Checkmark, & Social Media CSV
 */

document.addEventListener("DOMContentLoaded", function () {
  // -----------------------------------------------------------
  // 1. OBFUSCATED APPS SCRIPT URL
  // -----------------------------------------------------------
  const _0x4a21 = [
    "aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy9BS2Z5Y2J6emF3S0J4Ym5uU3RvTjMwNzlMQ0NucnFQMlhUWElWWEREMWVDdmdCZkFNQlNUWUVkLUw1eXRHdlFpZVo3czVodlZMQS9leGVj",
  ];

  function getEndpoint() {
    try {
      return atob(_0x4a21[0]);
    } catch (e) {
      console.error("Endpoint decoding failed", e);
      return "";
    }
  }

  // -----------------------------------------------------------
  // 2. STATE & DOM ELEMENTS
  // -----------------------------------------------------------
  let currentStep = 1;
  const totalSteps = 4;

  const skeletonLoader = document.getElementById("skeletonLoader");
  const appContent = document.getElementById("appContent");
  const progressBar = document.getElementById("progressBar");
  const stepIndicator = document.getElementById("stepIndicator");

  const btnNext = document.getElementById("btnNext");
  const btnPrev = document.getElementById("btnPrev");

  const btnSharelock = document.getElementById("btnSharelock");
  const btnSharelockText = document.getElementById("btnSharelockText");
  const mapsUrlInput = document.getElementById("mapsUrl");
  const sharelockStatus = document.getElementById("sharelockStatus");
  const alamatInput = document.getElementById("alamat");

  const btnAddItem = document.getElementById("btnAddItem");
  const seserahanContainer = document.getElementById("seserahanContainer");

  const successModal = document.getElementById("successModal");
  const modalCard = document.getElementById("modalCard");

  // Initial render simulation
  setTimeout(() => {
    if (skeletonLoader && appContent) {
      skeletonLoader.classList.add("hidden");
      appContent.classList.remove("hidden");
    }
  }, 800);

  // -----------------------------------------------------------
  // 3. HELPER: CUSTOM TOAST NOTIFICATION
  // -----------------------------------------------------------
  function showToast(message) {
    let toast = document.getElementById("customToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "customToast";
      toast.className =
        "fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-stone-900/90 backdrop-blur-md text-white text-xs sm:text-sm font-medium py-3 px-5 rounded-2xl shadow-xl transition-all duration-300 transform -translate-y-10 opacity-0 flex items-center gap-2 max-w-[90%] text-center border border-amber-900/20";
      document.body.appendChild(toast);
    }

    toast.innerHTML = `<i class="fa-solid fa-circle-exclamation text-amber-400 text-base"></i> <span>${message}</span>`;
    toast.classList.remove("-translate-y-10", "opacity-0");
    toast.classList.add("translate-y-0", "opacity-100");

    setTimeout(() => {
      toast.classList.remove("translate-y-0", "opacity-100");
      toast.classList.add("-translate-y-10", "opacity-0");
    }, 3200);
  }

  // -----------------------------------------------------------
  // 4. HELPER: SOSIAL MEDIA CSV FORMATTER (Platform + Akun)
  // -----------------------------------------------------------
  function getSosmedCSV() {
    const platformElem = document.getElementById("sosmedPlatform");
    const accountElem = document.getElementById("sosmedAccount");

    const platform = platformElem ? platformElem.value.trim() : "Instagram";
    const account = accountElem ? accountElem.value.trim() : "";

    if (!account) return "";
    return `${platform},${account}`; // Menghasilkan format: "Platform,Akun"
  }

  // -----------------------------------------------------------
  // 5. MULTI-STEP NAVIGATION LOGIC
  // -----------------------------------------------------------
  function updateStepUI() {
    for (let i = 1; i <= totalSteps; i++) {
      const panel = document.getElementById(`step${i}`);
      if (panel) {
        if (i === currentStep) {
          panel.classList.remove("hidden");
          setTimeout(() => {
            panel.classList.remove("translate-x-12", "opacity-0");
            panel.classList.add("translate-x-0", "opacity-100");
          }, 50);
        } else {
          panel.classList.add("hidden", "translate-x-12", "opacity-0");
          panel.classList.remove("translate-x-0", "opacity-100");
        }
      }
    }

    const progressPercent = (currentStep / totalSteps) * 100;
    if (progressBar) progressBar.style.width = `${progressPercent}%`;
    if (stepIndicator)
      stepIndicator.textContent = `Langkah ${currentStep} dari ${totalSteps}`;

    if (btnPrev) {
      if (currentStep === 1) {
        btnPrev.classList.add("hidden");
      } else {
        btnPrev.classList.remove("hidden");
      }
    }

    if (btnNext) {
      if (currentStep === totalSteps) {
        btnNext.innerHTML = `<span>Kirim Pesanan</span> <i class="fa-solid fa-paper-plane"></i>`;
      } else {
        btnNext.innerHTML = `<span>Lanjut</span> <i class="fa-solid fa-arrow-right"></i>`;
      }
    }
  }

  function validateCurrentStep() {
    if (currentStep === 2) {
      const nama = document.getElementById("namaLengkap").value.trim();
      const sosmedCSV = getSosmedCSV();
      const tgl = document.getElementById("tanggalAcara").value.trim();

      if (!nama || !sosmedCSV || !tgl) {
        showToast("Mohon lengkapi Nama, Akun Media Sosial, dan Tanggal Acara.");
        return false;
      }
    } else if (currentStep === 3) {
      const alamat = alamatInput ? alamatInput.value.trim() : "";
      if (!alamat) {
        showToast("Mohon isi alamat lengkap Anda.");
        return false;
      }
    }
    return true;
  }

  if (btnNext) {
    btnNext.addEventListener("click", function () {
      if (!validateCurrentStep()) return;

      if (currentStep < totalSteps) {
        currentStep++;
        updateStepUI();
      } else {
        submitForm();
      }
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener("click", function () {
      if (currentStep > 1) {
        currentStep--;
        updateStepUI();
      }
    });
  }

  // -----------------------------------------------------------
  // 6. GEOLOCATION & REVERSE GEOCODING (Sharelock)
  // -----------------------------------------------------------
  if (btnSharelock) {
    btnSharelock.addEventListener("click", function () {
      if (!navigator.geolocation) {
        showToast("Perangkat Anda tidak mendukung fitur lokasi GPS.");
        return;
      }

      btnSharelockText.textContent = "Mengambil Lokasi...";
      btnSharelock.disabled = true;

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const mapsLink = `https://www.google.com/maps?q=${lat},${lon}`;
          if (mapsUrlInput) mapsUrlInput.value = mapsLink;

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
            );
            const data = await response.json();

            if (data && data.display_name) {
              alamatInput.value = data.display_name;
            } else {
              alamatInput.value = `Lokasi GPS (${lat}, ${lon})`;
            }
          } catch (err) {
            console.error("Geocoding error:", err);
            alamatInput.value = `Tandai Lokasi: ${mapsLink}`;
          }

          btnSharelockText.textContent = "Lokasi Berhasil Ditandai!";
          if (sharelockStatus) sharelockStatus.classList.remove("hidden");
          btnSharelock.disabled = false;
        },
        (error) => {
          showToast("Gagal mengambil lokasi. Pastikan izin GPS diaktifkan.");
          btnSharelockText.textContent = "Tandai Otomatis dengan Sharelock";
          btnSharelock.disabled = false;
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  // -----------------------------------------------------------
  // 7. DYNAMIC SESERAHAN LIST
  // -----------------------------------------------------------
  if (btnAddItem && seserahanContainer) {
    btnAddItem.addEventListener("click", function () {
      const items = seserahanContainer.querySelectorAll(".seserahan-item");
      const nextIndex = items.length + 1;

      const newItem = document.createElement("div");
      newItem.className = "flex items-center gap-2 seserahan-item";
      newItem.innerHTML = `
              <input type="text" placeholder="Item ${nextIndex}"
                  class="item-input flex-1 bg-white/90 border border-amber-900/15 rounded-xl py-2 px-3 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-blue-500 transition">
              <button type="button" class="btn-remove-item text-stone-400 hover:text-rose-500 p-2 transition" aria-label="Hapus item">
                  <i class="fa-solid fa-trash-can"></i>
              </button>
          `;

      seserahanContainer.appendChild(newItem);
      updateRemoveButtons();
      seserahanContainer.scrollTop = seserahanContainer.scrollHeight;
    });

    seserahanContainer.addEventListener("click", function (e) {
      if (e.target.closest(".btn-remove-item")) {
        const items = seserahanContainer.querySelectorAll(".seserahan-item");
        if (items.length > 1) {
          e.target.closest(".seserahan-item").remove();
          updateRemoveButtons();
        }
      }
    });
  }

  function updateRemoveButtons() {
    const items = seserahanContainer.querySelectorAll(".seserahan-item");
    items.forEach((item) => {
      const btn = item.querySelector(".btn-remove-item");
      if (btn) {
        if (items.length === 1) {
          btn.disabled = true;
          btn.classList.add("opacity-40", "cursor-not-allowed");
        } else {
          btn.disabled = false;
          btn.classList.remove("opacity-40", "cursor-not-allowed");
        }
      }
    });
  }

  function getSeserahanCSV() {
    const inputs = seserahanContainer.querySelectorAll(".item-input");
    const itemList = [];
    inputs.forEach((input) => {
      const val = input.value.trim();
      if (val) itemList.push(val);
    });
    return itemList.join(",");
  }

  // -----------------------------------------------------------
  // 8. FORM SUBMISSION TO GOOGLE APPS SCRIPT
  // -----------------------------------------------------------
// CONFIGURATION: Nomor WhatsApp Admin (Gunakan format 62...)
  const ADMIN_WA_NUMBER = "6281234567890"; // <-- GANTI DENGAN NOMOR WA ANDA

  // Helper: Membuat URL WhatsApp dengan Templat Pesan
  function buildWhatsAppUrl(payload) {
    // Merapikan format daftar seserahan (CSV ke list berpoin)
    const itemsList = payload.seserahanList
      .split(",")
      .map((item, idx) => `   ${idx + 1}. ${item.trim()}`)
      .join("\n");

    // Templat Pesan WhatsApp
    const message = `Halo BymeProject, saya ingin mengonfirmasi pesanan baru:

  *DATA PEMESAN:*
  • *Nama Lengkap:* ${payload.namaLengkap}
  • *Media Sosial:* ${payload.sosmedCSV}
  • *Tanggal Acara:* ${payload.tanggalAcara}
  Mohon diproses pesanan saya. Terima kasih!`;

    // Encode teks agar aman untuk URL
    return `https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  // -----------------------------------------------------------
  // SUBMIT FORM & REDIRECT WA
  // -----------------------------------------------------------
  async function submitForm() {
    const seserahanCSV = getSeserahanCSV();
    if (!seserahanCSV) {
      showToast("Mohon isi minimal 1 item barang seserahan.");
      return;
    }

    const sosmedValue = getSosmedCSV();

    const payload = {
      namaLengkap: document.getElementById("namaLengkap").value.trim(),
      sosmedCSV: sosmedValue,
      usernameIg: sosmedValue,
      tanggalAcara: document.getElementById("tanggalAcara").value.trim(),
      alamat: alamatInput ? alamatInput.value.trim() : "",
      mapsUrl: mapsUrlInput ? mapsUrlInput.value.trim() : "",
      seserahanList: seserahanCSV,
    };

    const endpoint = getEndpoint();

    btnNext.disabled = true;
    btnNext.innerHTML = `<i class="fa-solid fa-circle-notch animate-spin"></i> <span>Mengirim...</span>`;

    try {
      if (endpoint && !endpoint.includes("XXXXXXXX")) {
        await fetch(endpoint, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await new Promise((res) => setTimeout(res, 1200));
      }

      // Buat URL WA berdasarkan payload
      const waUrl = buildWhatsAppUrl(payload);

      // Tampilkan Modal Sukses terlebih dahulu
      showSuccessModal(waUrl);

    } catch (err) {
      console.error("Submission error:", err);
      showToast("Terjadi kesalahan pengiriman. Coba lagi.");
    } finally {
      btnNext.disabled = false;
      updateStepUI();
    }
  }

  function showSuccessModal(waUrl) {
    if (!successModal || !modalCard) return;

    // Trigger Ulang Animasi SVG Circle & Checkmark
    const svgCircle = modalCard.querySelector(".checkmark-circle");
    const svgCheck = modalCard.querySelector(".checkmark-check");

    if (svgCircle && svgCheck) {
      svgCircle.style.animation = "none";
      svgCheck.style.animation = "none";
      void svgCircle.offsetWidth; // Reflow
      svgCircle.style.animation = "";
      svgCheck.style.animation = "";
    }

    // Setel Aksi Tombol di Modal untuk Mengarah ke WA
    const btnModal = modalCard.querySelector("button");
    if (btnModal && waUrl) {
      btnModal.innerHTML = `<i class="fa-brands fa-whatsapp text-base mr-1"></i> Konfirmasi ke WhatsApp`;
      btnModal.className = "w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-semibold shadow-md shadow-emerald-500/20 transition active:scale-95 flex items-center justify-center gap-1";
      btnModal.onclick = function () {
        window.open(waUrl, "_blank");
        location.reload(); // Reset form setelah membuka WA
      };
    }

    // Tampilkan Modal
    successModal.classList.remove("hidden");
    setTimeout(() => {
      modalCard.classList.remove("scale-95", "opacity-0");
      modalCard.classList.add("scale-100", "opacity-100");
    }, 50);

    // Opsi Otomatis Buka WA setelah 2 detik (Opsional)
    setTimeout(() => {
      if (waUrl) {
        window.open(waUrl, "_blank");
      }
    }, 2000);
  }
});