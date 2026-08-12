(function () {
  "use strict";

  var raiz = document.documentElement;
  var animacaoConcluida = false;
  var temporizadorDeSeguranca;

  raiz.classList.add("js-page-reveal");

  function concluirAnimacao() {
    if (animacaoConcluida) return;

    animacaoConcluida = true;
    window.clearTimeout(temporizadorDeSeguranca);
    raiz.classList.add("page-reveal-complete");
  }

  function revelarPagina() {
    if (raiz.classList.contains("page-reveal-ready")) return;

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        raiz.classList.add("page-reveal-ready");

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          concluirAnimacao();
          return;
        }

        window.setTimeout(concluirAnimacao, 850);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", revelarPagina, { once: true });
  } else {
    revelarPagina();
  }

  window.addEventListener("pageshow", revelarPagina);

  /* Evita que uma falha inesperada mantenha a página transparente. */
  temporizadorDeSeguranca = window.setTimeout(function () {
    raiz.classList.add("page-reveal-ready");
    concluirAnimacao();
  }, 1800);
})();
