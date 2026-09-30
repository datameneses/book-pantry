// --- i18n --------------------------------------------------------------
// EN -> PT-BR dictionary for UI strings built in JS. Static HTML text is
// translated via data-pt attributes (see applyStaticTranslations below).
const DICT_PT = {
  "Country": "País",
  "Rating": "Nota",
  "Not yet rated": "Ainda não avaliado",
  "Disliked": "Não gostei",
  "Average": "Mediano",
  "Good": "Bom",
  "Very good": "Muito bom",
  "Exceptional": "Excepcional",
  "Books by Author": "Livros por autor",
  "Books by Genre": "Livros por gênero",
  "Books by Status": "Livros por status",
  "Books by Format": "Livros por formato",
  "books": "livros",
  "Reading": "Lendo",
  "Read": "Lido",
  "Read + Highlighted": "Lido + Destacado",
  "Read + Highlighted + Distilled": "Lido + Destacado + Destilado em notas",
  "Libby": "Libby",
  "Kobo Store": "Kobo Store",
  "Physical": "Físico",
  "Author": "Autor",
  "Year": "Ano",
  "Genre": "Gênero",
  "Where to read": "Onde ler",
  "Last read": "Última leitura",
  "Status": "Status",
  "Original title": "Título original",
  "No books match these filters.": "Nenhum livro corresponde a esses filtros.",
  "Nothing here yet.": "Nada por aqui ainda.",
  "Could not load data. If you're viewing this via file://, try running a local server (e.g. <code>python3 -m http.server</code>) instead.":
    "Não foi possível carregar os dados. Se você está vendo isso via file://, tente rodar um servidor local (ex.: <code>python3 -m http.server</code>).",
  "Book Pantry (a personal project)": "Book Pantry (um projeto pessoal)"
};

function getLang() {
  return localStorage.getItem("lang") === "pt" ? "pt" : "en";
}

// Translates a literal EN string built in JS via DICT_PT.
function t(str) {
  if (getLang() !== "pt") return str;
  return DICT_PT[str] || str;
}

// Reads a JSON item's field, preferring the `<field>_pt` sibling when the
// site is in PT-BR and that sibling exists (falls back to EN otherwise,
// e.g. titles that have no Brazilian edition).
function tf(item, field) {
  if (getLang() === "pt" && item[field + "_pt"] !== undefined) {
    return item[field + "_pt"];
  }
  return item[field];
}

// Swaps every element carrying a data-pt attribute between its English
// text (cached into data-en on first run) and its PT-BR text.
function applyStaticTranslations() {
  const lang = getLang();
  document.querySelectorAll("[data-pt]").forEach((el) => {
    if (!el.dataset.en) el.dataset.en = el.innerHTML;
    el.innerHTML = lang === "pt" ? el.dataset.pt : el.dataset.en;
  });
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  document.querySelectorAll(".lang-toggle").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
}

function setLang(lang) {
  localStorage.setItem("lang", lang);
  applyStaticTranslations();
  document.dispatchEvent(new CustomEvent("langchange"));
}

document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav.site-nav a").forEach((link) => {
    if (link.getAttribute("href") === path) link.classList.add("active");
  });

  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("nav.site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  document.querySelectorAll(".lang-toggle").forEach((btn) => {
    btn.addEventListener("click", () => setLang(btn.dataset.lang));
  });

  applyStaticTranslations();
});

// ---- shared book helpers ----------------------------------------------
const STATUS_LABEL = {
  reading: "Reading",
  read: "Read",
  highlighted: "Read + Highlighted",
  distilled: "Read + Highlighted + Distilled"
};

function ratingTag(rating) {
  if (rating <= 3.0) return "Disliked";
  if (rating < 4.0) return "Average";
  if (rating < 4.5) return "Good";
  if (rating < 5.0) return "Very good";
  return "Exceptional";
}

function ratingBucket(rating) {
  if (typeof rating !== "number") return "unrated";
  return ratingTag(rating).toLowerCase().replace(" ", "-");
}

function renderRating(rating) {
  if (typeof rating !== "number") {
    return `
      <div class="star-rating-row">
        <div class="star-rating" aria-label="${t("Not yet rated")}"><span class="star-rating-track">★★★★★</span></div>
        <span class="rating-value empty-state">${t("Not yet rated")}</span>
      </div>`;
  }
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  const tag = ratingTag(rating);
  return `
    <div class="star-rating-row">
      <div class="star-rating" aria-label="Rating: ${rating.toFixed(1)} out of 5">
        <span class="star-rating-track">★★★★★</span>
        <span class="star-rating-fill" style="width:${pct}%">★★★★★</span>
      </div>
      <span class="rating-value">${rating.toFixed(1)}</span>
      <span class="rating-tag rating-tag-${tag.toLowerCase().replace(" ", "-")}">${t(tag)}</span>
    </div>`;
}

function formatLastRead(ym) {
  if (!ym) return "";
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(getLang() === "pt" ? "pt-BR" : "en-US", { month: "long", year: "numeric" });
}

function field(label, value) {
  return value ? `<li><strong>${t(label)}:</strong> ${value}</li>` : "";
}

function bookTitle(item) {
  return tf(item, "title");
}

// Shows the original title as a hint when the PT-BR edition is titled differently.
function originalTitleLine(item) {
  return getLang() === "pt" && item.title_pt && item.title_pt !== item.title
    ? field("Original title", item.title)
    : "";
}

function loadJson(path, containerId) {
  return fetch(path).then((res) => res.json()).catch((err) => {
    console.error("Failed to load", path, err);
    document.getElementById(containerId).innerHTML =
      `<p class="empty-state">${t("Could not load data. If you're viewing this via file://, try running a local server (e.g. <code>python3 -m http.server</code>) instead.")}</p>`;
    return null;
  });
}
