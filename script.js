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
      <div class="image-lightbox-meta">
        <span class="image-lightbox-title"></span>
        <span class="image-lightbox-counter"></span>
      </div>
      <div class="image-lightbox-actions">
        <button class="image-lightbox-button" type="button" data-action="prev" aria-label="이전 이미지">‹</button>
        <button class="image-lightbox-button" type="button" data-action="zoom-out" aria-label="축소">−</button>
        <button class="image-lightbox-button" type="button" data-action="reset" aria-label="확대 초기화">Reset</button>
        <button class="image-lightbox-button" type="button" data-action="zoom-in" aria-label="확대">+</button>
        <button class="image-lightbox-button" type="button" data-action="next" aria-label="다음 이미지">›</button>
        <button class="image-lightbox-close" type="button" aria-label="이미지 닫기">×</button>
      </div>
    </div>
    <figure class="image-lightbox-figure">
      <img alt="" />
    </figure>
  `;
  document.body.appendChild(lightbox);

  const lightboxImage = lightbox.querySelector("img");
  const lightboxTitle = lightbox.querySelector(".image-lightbox-title");
  const lightboxCounter = lightbox.querySelector(".image-lightbox-counter");
  const closeButton = lightbox.querySelector(".image-lightbox-close");
  const actionButtons = lightbox.querySelectorAll("[data-action]");
  let currentIndex = 0;
  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragOriginX = 0;
  let dragOriginY = 0;

  const getCaption = (image) => image.closest("figure")?.querySelector("figcaption")?.textContent?.trim();

  const updateTransform = () => {
    lightboxImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    lightboxImage.classList.toggle("is-draggable", scale > 1);
  };

  const resetImagePosition = () => {
    scale = 1;
    translateX = 0;
    translateY = 0;
    updateTransform();
  };

  const setZoom = (nextScale) => {
    const clampedScale = Math.min(4, Math.max(0.6, nextScale));
    scale = Number(clampedScale.toFixed(2));
    if (scale <= 1) {
      translateX = 0;
      translateY = 0;
    }
    updateTransform();
  };

  const panImage = (deltaX, deltaY) => {
    if (scale <= 1) {
      setZoom(1.6);
    }
    translateX += deltaX;
    translateY += deltaY;
    updateTransform();
  };

  const showImage = (index) => {
    currentIndex = (index + zoomableImages.length) % zoomableImages.length;
    const image = zoomableImages[currentIndex];
    const caption = getCaption(image);
    const source = image.currentSrc || image.src;

    lightboxImage.src = source;
    lightboxImage.alt = image.alt || caption || "확대 이미지";
    lightboxTitle.textContent = caption || image.alt || "Image preview";
    lightboxCounter.textContent = `${currentIndex + 1} / ${zoomableImages.length}`;
    resetImagePosition();
  };

  const closeLightbox = () => {
    lightbox.hidden = true;
    document.body.style.overflow = "";
    lightboxImage.removeAttribute("src");
    isDragging = false;
  };

  const openLightbox = (index) => {
    showImage(index);
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    closeButton.focus();
  };

  zoomableImages.forEach((image, index) => {
    image.setAttribute("tabindex", "0");
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", "이미지 확대");

    image.addEventListener("click", () => openLightbox(index));
    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(index);
      }
    });
  });

  actionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      if (action === "prev") showImage(currentIndex - 1);
      if (action === "next") showImage(currentIndex + 1);
      if (action === "zoom-in") setZoom(scale + 0.35);
      if (action === "zoom-out") setZoom(scale - 0.35);
      if (action === "reset") resetImagePosition();
    });
  });

  closeButton.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });
  lightboxImage.addEventListener("dblclick", () => {
    setZoom(scale > 1 ? 1 : 2);
  });
  lightboxImage.addEventListener("wheel", (event) => {
    event.preventDefault();
    setZoom(scale + (event.deltaY < 0 ? 0.18 : -0.18));
  }, { passive: false });
  lightboxImage.addEventListener("pointerdown", (event) => {
    if (scale <= 1) return;
    isDragging = true;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    dragOriginX = translateX;
    dragOriginY = translateY;
    lightboxImage.setPointerCapture(event.pointerId);
  });
  lightboxImage.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    translateX = dragOriginX + event.clientX - dragStartX;
    translateY = dragOriginY + event.clientY - dragStartY;
    updateTransform();
  });
  lightboxImage.addEventListener("pointerup", () => {
    isDragging = false;
  });
  lightboxImage.addEventListener("pointercancel", () => {
    isDragging = false;
  });
  document.addEventListener("keydown", (event) => {
    if (lightbox.hidden) return;
    if (event.key === "Escape") {
      closeLightbox();
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (scale > 1) panImage(-90, 0);
      else showImage(currentIndex - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      if (scale > 1) panImage(90, 0);
      else showImage(currentIndex + 1);
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      panImage(0, -90);
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      panImage(0, 90);
    }
    if (event.key === "+" || event.key === "=") setZoom(scale + 0.35);
    if (event.key === "-") setZoom(scale - 0.35);
    if (event.key === "0") resetImagePosition();
  });
}
