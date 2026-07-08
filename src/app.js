const WIDTHS = [480, 768, 1080, 1440];
const OPTIMIZED_ROOT = "./photos-optimized";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const photoSizes = {
  "other/discord-calls": "(min-width: 760px) 320px, 78vw",
  "other/santa-memory": "(min-width: 760px) 430px, 88vw",
  "other/sad-1": "(min-width: 760px) 320px, 78vw",
  "other/sad-2": "(min-width: 760px) 320px, 78vw",
  "together/cinema-date": "(min-width: 760px) 520px, 90vw",
  "childhood/little-princess": "(min-width: 760px) 340px, 76vw",
  "childhood/little-shaha": "(min-width: 760px) 360px, 76vw",
  "childhood/little-video-call": "(min-width: 760px) 320px, 74vw",
  "together/mountain-date": "(min-width: 760px) 720px, 92vw",
  "together/night-smiles": "(min-width: 760px) 460px, 88vw",
  "together/hero": "(min-width: 760px) 460px, 88vw",
  "shaha/golden-light": "(min-width: 760px) 360px, 82vw",
};

const archiveGroups = [
  {
    label: "мы",
    photos: [
      ["together/first-kiss", "Милашки"],
      ["together/cinema-date", "Кушаем"],
      ["together/warm-hug", "Культурное развитие"],
      ["together/hero", "Отчет маме"],
      ["together/mountain-date", "Колсай"],
      ["together/night-smiles", "Красавчики"],
      ["together/marathon", "Марафон"],
      ["together/love-realization", "День когда я понял что люблю тебя"],
      ["together/still-friends", "Пока что друзья"],
      ["together/award", "Вручение"],
      ["together/your-birthday", "Твое ДР"],
    ],
  },
  {
    label: "Шаха",
    photos: [
      ["shaha/dream-day", "Принцесса из Дисней"],
      ["shaha/flowers-princess", "Роскошная"],
      ["shaha/golden-light", "Фэйверит фото"],
      ["shaha/sunny-girl", "Шикарная"],
      ["shaha/winter-smile", "Очаровательная"],
      ["shaha/cafe-smile", "Нереальная"],
      ["shaha/paris", "Француженка"],
      ["shaha/798A90AF-F291-447E-913E-FC6BA8FF3190", "Милашкрр"],
      ["shaha/086A3D15-E4D0-41A9-8D85-7713696DFD0C", "Великолепная"],
      ["shaha/B4699527-AFB2-414E-9AF3-022503E074F6", "Самая самая"],
      ["shaha/night-girl", "Замечательная"],
      ["shaha/IMG_3228", "Изумительная"],
      ["shaha/D3936633-CBDC-4471-8CFF-6CA52491958A", "Невероятная"],
      ["shaha/CCC891CD-6BDC-479E-9F2A-00682239D1FC", "Бомба пушка"],
      ["shaha/elegant", "Сладкая"],
      ["shaha/museum-day", "Грациозная"],
    ],
  },
  {
    label: "до нас",
    photos: [
      ["childhood/little-princess", "Маленькая принцесса"],
      ["childhood/little-shaha", "Куным сол"],
      ["childhood/little-video-call", "Боташка"],
    ],
  },
];

function fileNameFromPath(photoPath) {
  return photoPath.split("/").at(-1);
}

function srcSet(photoPath, format) {
  const fileName = fileNameFromPath(photoPath);
  return WIDTHS.map(
    (width) => `${OPTIMIZED_ROOT}/${photoPath}/${fileName}-${width}w.${format} ${width}w`,
  ).join(", ");
}

function renderArchiveBoard() {
  const board = document.querySelector("[data-archive-board]");
  if (!board) return;

  board.innerHTML = archiveGroups
    .map(
      (group) => `
        <section class="archive-group" aria-label="${group.label}">
          <h3>${group.label}</h3>
          <div class="archive-strip">
            ${group.photos
              .map(
                ([photoPath, label], index) => `
                  <figure class="photo-card archive-photo archive-photo-${index % 6}">
                    <picture
                      data-photo="${photoPath}"
                      data-alt="${label}"
                      data-size="(min-width: 760px) 260px, 72vw"
                    ></picture>
                    <figcaption>${label}</figcaption>
                  </figure>
                `,
              )
              .join("")}
          </div>
        </section>
      `,
    )
    .join("");
}

function hydratePictures() {
  document.querySelectorAll("picture[data-photo]").forEach((picture) => {
    const photoPath = picture.dataset.photo;
    const fileName = fileNameFromPath(photoPath);
    const alt = picture.dataset.alt || "";
    const sizes = picture.dataset.size || photoSizes[photoPath] || "(min-width: 760px) 50vw, 92vw";

    picture.innerHTML = `
      <source type="image/avif" srcset="${srcSet(photoPath, "avif")}" sizes="${sizes}">
      <source type="image/webp" srcset="${srcSet(photoPath, "webp")}" sizes="${sizes}">
      <img
        src="${OPTIMIZED_ROOT}/${photoPath}/${fileName}-768w.webp"
        alt="${alt}"
        width="768"
        height="1024"
        loading="lazy"
        decoding="async"
      >
    `;
  });

  const firstImage = document.querySelector(".scene-return img");
  if (firstImage) {
    firstImage.loading = "eager";
    firstImage.fetchPriority = "high";
  }
}

function enableReveals() {
  document.body.classList.add("motion-ready");

  const revealTargets = [
    ...document.querySelectorAll(
      [
        ".scene-inner",
        ".photo-card",
        ".artifact-card",
        ".video-card",
        ".archive-group",
        ".word-pair span",
        ".pause-lines span",
        ".truth-line",
      ].join(", "),
    ),
  ];

  revealTargets.forEach((element, index) => {
    element.classList.add("reveal");
    element.style.setProperty("--delay", `${Math.min(index % 4, 3) * 90}ms`);
  });

  if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
    revealTargets.forEach((element) => element.classList.add("is-visible"));
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
    {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.16,
    },
  );

  revealTargets.forEach((element) => observer.observe(element));
}

function bindStart() {
  const startButton = document.querySelector("[data-start]");
  const nextScene = document.querySelector(".scene-discord");

  startButton?.addEventListener("click", () => {
    nextScene?.scrollIntoView({
      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
      block: "start",
    });
  });
}

function bindSecret() {
  const button = document.querySelector("[data-secret]");
  const answer = document.querySelector("[data-answer]");

  button?.addEventListener("click", () => {
    if (!answer) return;

    answer.hidden = false;
    answer.classList.add("reveal-answer");
    button.hidden = true;

    window.setTimeout(() => {
      answer.scrollIntoView({
        behavior: prefersReducedMotion.matches ? "auto" : "smooth",
        block: "center",
      });
    }, 160);
  });
}

function bindEasterMoment() {
  const button = document.querySelector("[data-easter]");
  const panel = document.querySelector("[data-easter-panel]");

  button?.addEventListener("click", () => {
    if (!panel) return;

    panel.hidden = false;
    panel.classList.add("reveal-answer");
    button.hidden = true;
  });
}

function observeDiscordShapes() {
  const scene = document.querySelector(".scene-discord");
  if (!scene) return;

  if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
    scene.classList.add("shapes-in");
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          scene.classList.add("shapes-in");
          observer.unobserve(scene);
        }
      });
    },
    {
      threshold: 0.38,
    },
  );

  observer.observe(scene);
}

function scrollToRequestedScene() {
  const params = new URLSearchParams(window.location.search);
  const requestedScene = params.get("scene") || window.location.hash.replace("#", "");

  if (!requestedScene) return;

  window.setTimeout(() => {
    document.getElementById(requestedScene)?.scrollIntoView({
      behavior: "auto",
      block: "start",
    });
  }, 120);
}

function enableGentleParallax() {
  if (prefersReducedMotion.matches) return;

  const cards = [...document.querySelectorAll(".photo-card, .artifact-card, .video-card")];
  let ticking = false;

  function update() {
    const viewportHeight = window.innerHeight || 1;

    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const distance = (center - viewportHeight / 2) / viewportHeight;
      const depth = index % 2 === 0 ? -12 : 10;
      const drift = Math.max(-18, Math.min(18, distance * depth));

      card.style.setProperty("--drift", `${drift.toFixed(2)}px`);
    });

    ticking = false;
  }

  function requestUpdate() {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }

  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
}

renderArchiveBoard();
hydratePictures();
enableReveals();
bindStart();
bindSecret();
bindEasterMoment();
observeDiscordShapes();
scrollToRequestedScene();
enableGentleParallax();
