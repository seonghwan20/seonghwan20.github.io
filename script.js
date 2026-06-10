const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav-links");

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const year = document.querySelector("[data-year]");
if (year) {
  year.textContent = String(new Date().getFullYear());
}

const zoomableImages = Array.from(document.querySelectorAll("main img"));

if (zoomableImages.length) {
  const lightbox = document.createElement("div");
  lightbox.className = "image-lightbox";
  lightbox.hidden = true;
  lightbox.innerHTML = `
    <div class="image-lightbox-bar">
      <span class="image-lightbox-title"></span>
      <button class="image-lightbox-close" type="button" aria-label="이미지 닫기">×</button>
    </div>
    <figure class="image-lightbox-figure">
      <img alt="" />
    </figure>
  `;
  document.body.appendChild(lightbox);

  const lightboxImage = lightbox.querySelector("img");
  const lightboxTitle = lightbox.querySelector(".image-lightbox-title");
  const closeButton = lightbox.querySelector(".image-lightbox-close");

  const closeLightbox = () => {
    lightbox.hidden = true;
    document.body.style.overflow = "";
    lightboxImage.removeAttribute("src");
  };

  zoomableImages.forEach((image) => {
    image.setAttribute("tabindex", "0");
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", "이미지 확대");

    const openLightbox = () => {
      const caption = image.closest("figure")?.querySelector("figcaption")?.textContent?.trim();
      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt || caption || "확대 이미지";
      lightboxTitle.textContent = caption || image.alt || "Image preview";
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
      closeButton.focus();
    };

    image.addEventListener("click", openLightbox);
    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox();
      }
    });
  });

  closeButton.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox || event.target === lightboxImage) {
      closeLightbox();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !lightbox.hidden) {
      closeLightbox();
    }
  });
}
