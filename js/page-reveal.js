(function () {
  "use strict";

  var raiz = document.documentElement;
  var iniciado = false;

  function finalizarElemento(elemento) {
    elemento.classList.remove(
      "scroll-reveal-item",
      "scroll-reveal-visible",
    );
    elemento.classList.add("scroll-reveal-shown");
  }

  function mostrarElemento(elemento, observador, semAnimacao) {
    if (elemento.classList.contains("scroll-reveal-shown")) return;

    elemento.classList.add("scroll-reveal-visible");

    if (observador) {
      observador.unobserve(elemento);
    }

    if (semAnimacao) {
      finalizarElemento(elemento);
      return;
    }

    window.setTimeout(function () {
      finalizarElemento(elemento);
    }, 760);
  }

  function iniciarRevelacao() {
    if (iniciado) return;
    iniciado = true;

    try {
      /* Seções e blocos longos recebem o efeito individualmente. Assim, uma
         página extensa não aparece inteira antes de o usuário chegar nela. */
      var seletores = [
        "main > section",
        "main section.bloco-detalhe",
        "main .quarto-card",
        "main .faq-item",
        "main .local-card",
        "main .vantagem-card",
        "main .pilar-card",
        "main .compromisso-card",
        "main .contato-box",
        "main .reserva-informacoes",
        "main .reserva-galeria",
      ].join(",");

      var elementos = Array.prototype.slice.call(
        document.querySelectorAll(seletores),
      );

      if (elementos.length === 0) return;

      elementos.forEach(function (elemento) {
        elemento.classList.add("scroll-reveal-item");
      });

      raiz.classList.add("js-scroll-reveal");

      var reduzirMovimento = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduzirMovimento || !("IntersectionObserver" in window)) {
        elementos.forEach(function (elemento) {
          mostrarElemento(elemento, null, true);
        });
        return;
      }

      var observador = new IntersectionObserver(
        function (entradas) {
          entradas.forEach(function (entrada) {
            if (entrada.isIntersecting) {
              mostrarElemento(entrada.target, observador, false);
            }
          });
        },
        {
          /* Um limite baixo também funciona em blocos com várias telas de
             altura, como a listagem completa de quartos no celular. */
          threshold: 0.01,
          rootMargin: "0px 0px -8% 0px",
        },
      );

      elementos.forEach(function (elemento) {
        observador.observe(elemento);
      });
    } catch (erro) {
      /* Falha segura: o conteúdo nunca permanece invisível. */
      raiz.classList.add("scroll-reveal-fallback");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarRevelacao, {
      once: true,
    });
  } else {
    iniciarRevelacao();
  }
})();
