(() => {
  "use strict";

  const cards = Array.from(document.querySelectorAll("[data-vantagem-card]"));

  if (!cards.length) {
    return;
  }

  const touchDevice = window.matchMedia("(hover: none), (pointer: coarse)");

  const setPhotoVisible = (card, visible) => {
    const button = card.querySelector(".vantagem-card__toggle");
    const title = card.querySelector("h3")?.textContent.trim() || "esta comodidade";

    card.classList.toggle("is-photo-visible", visible);
    button.setAttribute("aria-expanded", String(visible));
    button.setAttribute(
      "aria-label",
      `${visible ? "Ocultar" : "Mostrar"} foto de ${title}`,
    );
  };

  const closeAllPhotos = (exception = null) => {
    cards.forEach((card) => {
      if (card !== exception) {
        setPhotoVisible(card, false);
      }
    });
  };

  const updateInteractionMode = () => {
    const enableTap = touchDevice.matches;

    cards.forEach((card) => {
      const button = card.querySelector(".vantagem-card__toggle");

      setPhotoVisible(card, false);
      button.hidden = !enableTap;
      button.tabIndex = enableTap ? 0 : -1;
    });
  };

  cards.forEach((card) => {
    const button = card.querySelector(".vantagem-card__toggle");

    button.addEventListener("click", () => {
      if (!touchDevice.matches) {
        return;
      }

      const shouldOpen = !card.classList.contains("is-photo-visible");
      closeAllPhotos(card);
      setPhotoVisible(card, shouldOpen);
    });
  });

  document.addEventListener("click", (event) => {
    if (touchDevice.matches && !event.target.closest("[data-vantagem-card]")) {
      closeAllPhotos();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllPhotos();
    }
  });

  if (typeof touchDevice.addEventListener === "function") {
    touchDevice.addEventListener("change", updateInteractionMode);
  } else {
    touchDevice.addListener(updateInteractionMode);
  }

  updateInteractionMode();
})();
