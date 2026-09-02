/* =====================================================================
   CONFIGURACIÓN — Editá estos valores con tus datos reales.
   Son los únicos cambios que necesitás para personalizar el sitio.
===================================================================== */
const CONFIG = {
  nombre: "José Gutierrez (Jok)",
  carrera: "Ingeniería Informática",
  githubUsername: "JokGC",       // usuario real de GitHub
  linkedinUrl: "https://www.linkedin.com/in/jose-vicente-2731a3433/",
  whatsappNumber: "595985709377",     // código de país + número, sin + ni espacios
  whatsappMensaje: "Hola José! Vi tu portfolio y quería contactarte.",
  maxReposGithub: 6,                  // cuántos repos mostrar como máximo
};

// Proyectos cargados a mano (mínimo 3, según la consigna).
const MANUAL_PROJECTS = [
  {
    nombre: "Buscador para la base de datos de BECAL",
    descripcion: "Aplicación web para organizar buscar personas que fueron beneficiadas por el programa de becas BECAL, con filtros de busquedas que facilitan y organizan mejor la información.",
    tecnologias: ["HTML", "CSS", "Python" , "Flask", "MySQL"],
    repo: "https://github.com/JokGC/LP3-BECAL",
    demo: "",
  },
  {
    nombre: "Sistema de Reserva de Aulas",
    descripcion: "Un Sistema de Reserva de Aulas realizado como trabajo práctico final de la materia LP2 de la carrera Ingeniería en Informática. Cuenta con interfaces y permisos diferentes para cada tipo de usuario.",
    tecnologias: ["C#"],
    repo: "https://github.com/JokGC/LP2_2025",
    demo: "",
  },
  {
    nombre: "Página estática para dedicatoria de amor",
    descripcion: "Página que muestra una rosa y un mensaje personalizable para enviarla a la persona que quieras.",
    tecnologias: ["HTML"],
    repo: "https://github.com/JokGC/roses",
    demo: "https://jokgc.github.io/roses/",
  },
];

/* =====================================================================
   Utilidades
===================================================================== */
function crearElemento(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

/* =====================================================================
   Aplicar configuración básica al DOM
===================================================================== */
function aplicarConfig() {
  document.title = `${CONFIG.nombre} — Portfolio`;
  document.getElementById("carrera").textContent = CONFIG.carrera;
  //document.getElementById("avatar").src =
    //`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(CONFIG.nombre)}`;

  const githubUrl = `https://github.com/${CONFIG.githubUsername}`;
  document.getElementById("btnGithub").href = githubUrl;
  document.querySelectorAll('a[href*="tu-usuario"]').forEach((a) => {
    if (a.href.includes("github.com")) a.href = githubUrl;
    if (a.href.includes("linkedin.com")) a.href = CONFIG.linkedinUrl;
  });

  const whatsappUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(CONFIG.whatsappMensaje)}`;
  document.getElementById("whatsappLink").href = whatsappUrl;

  document.getElementById("year").textContent = new Date().getFullYear();

  initAnalytics();
}

/* =====================================================================
   Efecto de tipeo del nombre en la "terminal"
===================================================================== */
function efectoTipeo() {
  const el = document.getElementById("typedName");
  const texto = CONFIG.nombre;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduce) {
    el.textContent = texto;
    return;
  }

  let i = 0;
  const intervalo = setInterval(() => {
    el.textContent = texto.slice(0, i + 1);
    i++;
    if (i === texto.length) clearInterval(intervalo);
  }, 90);
}

/* =====================================================================
   Renderizar proyectos manuales
===================================================================== */
function renderProyectosManuales() {
  const contenedor = document.getElementById("manualProjects");
  contenedor.innerHTML = "";

  MANUAL_PROJECTS.forEach((p) => {
    const demoLink = p.demo
      ? `<a href="${escapeHtml(p.demo)}" target="_blank" rel="noopener">Ver proyecto ↗</a>`
      : "";

    const card = crearElemento(`
      <article class="card">
        <h3>${escapeHtml(p.nombre)}</h3>
        <p>${escapeHtml(p.descripcion)}</p>
        <ul class="card__tech">
          ${p.tecnologias.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}
        </ul>
        <div class="card__links">
          <a href="${escapeHtml(p.repo)}" target="_blank" rel="noopener">Ver repositorio ↗</a>
          ${demoLink}
        </div>
      </article>
    `);
    contenedor.appendChild(card);
  });
}

/* =====================================================================
   PARTE 2 — GitHub REST API
   Endpoint público: GET https://api.github.com/users/{usuario}/repos
   No requiere autenticación para uso moderado (rate limit ~60 req/hora
   por IP sin token). Devuelve un array de repositorios del usuario.
===================================================================== */
async function cargarRepositoriosGitHub() {
  const contenedor = document.getElementById("githubRepos");
  const status = document.getElementById("githubStatus");

  const url = `https://api.github.com/users/${CONFIG.githubUsername}/repos?sort=updated&per_page=${CONFIG.maxReposGithub}`;

  try {
    const respuesta = await fetch(url, {
      headers: { Accept: "application/vnd.github+json" },
    });

    if (!respuesta.ok) {
      throw new Error(`GitHub respondió con estado ${respuesta.status}`);
    }

    const repos = await respuesta.json();

    if (!Array.isArray(repos) || repos.length === 0) {
      status.textContent = "Este usuario todavía no tiene repositorios públicos.";
      return;
    }

    status.remove();

    repos
      .filter((r) => !r.fork)
      .forEach((repo) => {
        const card = crearElemento(`
          <article class="card">
            <h3>${escapeHtml(repo.name)}</h3>
            <p>${escapeHtml(repo.description || "Sin descripción todavía.")}</p>
            <p class="card__lang">${escapeHtml(repo.language || "—")}</p>
            <div class="card__links">
              <a href="${escapeHtml(repo.html_url)}" target="_blank" rel="noopener">Ver repositorio ↗</a>
              ${repo.homepage ? `<a href="${escapeHtml(repo.homepage)}" target="_blank" rel="noopener">Sitio publicado ↗</a>` : ""}
            </div>
          </article>
        `);
        contenedor.appendChild(card);
      });
  } catch (error) {
    status.textContent = "No se pudieron cargar los repositorios en este momento. Probá recargar la página.";
    status.classList.add("status--error");
    console.error("Error al consultar la API de GitHub:", error);
  }
}

/* =====================================================================
   PARTE 4 — QR de la propia página
   Se genera con la URL actual (window.location.href), así siempre
   apunta a donde esté publicado el sitio, sin hardcodear nada.
===================================================================== */
function generarQR() {
  const urlActual = window.location.href;
  const qrImage = document.getElementById("qrImage");
  const qrUrl = document.getElementById("qrUrl");

  qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(urlActual)}`;
  qrUrl.textContent = urlActual;
}

/* =====================================================================
   Inicialización
===================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  aplicarConfig();
  efectoTipeo();
  renderProyectosManuales();
  cargarRepositoriosGitHub();
  generarQR();
});

/* =====================================================================
   GA4 vía Google Tag Manager — eventos personalizados
   Empuja al dataLayer; los tags/triggers se configuran en GTM.
===================================================================== */
function pushDataLayerEvent(eventName, params = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...params });
}

function initAnalytics() {
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;

    const href = link.href || "";
    const card = link.closest(".card");
    const location = link.dataset.gaLocation || (card ? "project_card" : "unknown");

    // Clic en WhatsApp (evento clave / conversión)
    if (link.id === "whatsappLink") {
      pushDataLayerEvent("click_whatsapp", { location });
      return;
    }

    // Clic en GitHub (botón, social, o link de un repo)
    if (href.includes("github.com")) {
      pushDataLayerEvent("click_github", { link_url: href, location });
    }

    // Clic en LinkedIn
    if (href.includes("linkedin.com")) {
      pushDataLayerEvent("click_linkedin", { link_url: href, location });
    }

    // Clic en un link dentro de una tarjeta de proyecto (repo o demo)
    if (card) {
      const projectName = card.querySelector("h3")?.textContent?.trim() || "desconocido";
      const linkType = link.textContent.toLowerCase().includes("repo") ? "repo" : "demo";
      pushDataLayerEvent("view_project", { project_name: projectName, link_type: linkType });
    }
  });
}

// Agregá esta línea dentro de tu listener DOMContentLoaded existente:
// initAnalytics();