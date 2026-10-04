// English-only helpers (kept so existing call sites stay simple).
function t(str) { return str; }
function tf(item, field) { return item[field]; }

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
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function field(label, value) {
  return value ? `<li><strong>${t(label)}:</strong> ${value}</li>` : "";
}

function bookTitle(item) {
  return tf(item, "title");
}

function loadJson(path, containerId) {
  return fetch(path).then((res) => res.json()).catch((err) => {
    console.error("Failed to load", path, err);
    document.getElementById(containerId).innerHTML =
      `<p class="empty-state">${t("Could not load data. If you're viewing this via file://, try running a local server (e.g. <code>python3 -m http.server</code>) instead.")}</p>`;
    return null;
  });
}
