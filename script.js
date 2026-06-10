const CONTACT_EMAIL = "testing.prueba2100@gmail.com";
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;

const menuButton = document.querySelector("[data-menu-button]");
const nav = document.querySelector("[data-nav]");
const form = document.querySelector("[data-contact-form]");
const statusEl = document.querySelector("[data-form-status]");
const leadSummary = document.querySelector("[data-lead-summary]");
const replyTo = document.querySelector("[data-replyto]");
const successModal = document.querySelector("[data-success-modal]");
const closeModalButton = document.querySelector("[data-close-modal]");
const modalDate = document.querySelector("[data-modal-date]");
const modalName = document.querySelector("[data-modal-name]");
const modalEmail = document.querySelector("[data-modal-email]");

menuButton?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

nav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    nav.classList.remove("is-open");
    menuButton?.setAttribute("aria-expanded", "false");
  }
});

const formatReceiptDate = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hour24 = date.getHours();
  const hour12 = hour24 % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = hour24 >= 12 ? "p.m." : "a.m.";

  return `${day}/${month}/${year} ${String(hour12).padStart(2, "0")}:${minutes} ${period}`;
};

const closeSuccessModal = () => {
  successModal.hidden = true;
};

const openSuccessModal = ({ name, email }) => {
  modalDate.textContent = formatReceiptDate(new Date());
  modalName.textContent = name;
  modalEmail.textContent = email;
  successModal.hidden = false;
  closeModalButton?.focus();
};

closeModalButton?.addEventListener("click", closeSuccessModal);

successModal?.addEventListener("click", (event) => {
  if (event.target === successModal) {
    closeSuccessModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !successModal?.hidden) {
    closeSuccessModal();
  }
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const name = String(data.get("Nombre") || "").trim();
  const email = String(data.get("Email") || "").trim();
  const phone = String(data.get("Teléfono") || "").trim();
  const size = String(data.get("Tamaño estimado") || "").trim();
  const useCase = String(data.get("Uso previsto") || "").trim();
  const urgency = String(data.get("Urgencia") || "").trim();
  const message = String(data.get("Mensaje") || "").trim();

  if (!name || !email || !phone || !size || !useCase || !urgency || !message) {
    statusEl.textContent = "Completá los datos principales para enviar la consulta.";
    return;
  }

  const summary = `${name} consulta por una pantalla ${size} para ${useCase}. Urgencia: ${urgency}.`;
  leadSummary.value = summary;
  replyTo.value = email;

  const payload = new URLSearchParams({
    _subject: "Consulta calificada | Pantallas LED",
    _template: "table",
    _captcha: "false",
    _replyto: email,
    "Resumen de la consulta": summary,
    Nombre: name,
    Email: email,
    Teléfono: phone,
    "Tamaño estimado": size,
    "Uso previsto": useCase,
    Urgencia: urgency,
    Mensaje: message,
  });

  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  statusEl.textContent = "Enviando consulta...";

  try {
    const response = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: payload,
    });

    if (!response.ok) {
      throw new Error("No se pudo enviar la consulta.");
    }

    form.reset();
    statusEl.textContent = "Consulta enviada correctamente. Gracias por contactarte.";
    openSuccessModal({ name, email });
  } catch (error) {
    statusEl.textContent = "No pudimos enviar la consulta en este momento. Probá nuevamente en unos minutos.";
  } finally {
    submitButton.disabled = false;
  }
});
