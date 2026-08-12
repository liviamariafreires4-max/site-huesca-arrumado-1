(() => {
  "use strict";

  const iniciarCarrossel = (carrossel) => {
    const viewport = carrossel.querySelector("[data-carrossel-viewport]");
    const trilho = carrossel.querySelector("[data-carrossel-trilho]");
    const botaoAnterior = carrossel.querySelector(
      "[data-carrossel-anterior]",
    );
    const botaoProximo = carrossel.querySelector("[data-carrossel-proximo]");

    if (!viewport || !trilho || !botaoAnterior || !botaoProximo) {
      return;
    }

    const cards = Array.from(
      trilho.querySelectorAll(".card-acomodacao-link"),
    );
    const imagemReferencia = cards[0]?.querySelector(".card-imagem-hover");

    if (cards.length < 2) {
      return;
    }

    let paginaAtual = 0;
    let quantidadeVisivel = 1;
    let quadroRedimensionamento = 0;
    let toqueInicial = null;
    let bloquearCliqueDoCard = false;

    /*
     * Mede a posição sem considerar transformações visuais dos cards. Isso
     * mantém as setas no centro da foto mesmo durante hover, animações, zoom
     * do navegador ou alterações responsivas de altura.
     */
    const obterCentroVerticalRelativo = (elemento, ancestral) => {
      let topo = 0;
      let atual = elemento;

      while (atual && atual !== ancestral) {
        topo += atual.offsetTop;
        const proximoPai = atual.offsetParent;

        /* offsetTop parte da área interna do elemento pai; a borda precisa
           ser somada para coincidir com o centro visual da fotografia. */
        if (proximoPai && proximoPai !== ancestral) {
          topo += proximoPai.clientTop;
        }

        atual = proximoPai;
      }

      if (atual === ancestral) {
        return topo + elemento.offsetHeight / 2;
      }

      const retanguloElemento = elemento.getBoundingClientRect();
      const retanguloAncestral = ancestral.getBoundingClientRect();

      return (
        retanguloElemento.top -
        retanguloAncestral.top +
        retanguloElemento.height / 2
      );
    };

    const atualizarCentroDasSetas = () => {
      if (
        !imagemReferencia ||
        !window.matchMedia("(min-width: 1200px)").matches
      ) {
        carrossel.style.removeProperty("--carrossel-seta-topo");
        return;
      }

      const centro = obterCentroVerticalRelativo(imagemReferencia, carrossel);

      if (Number.isFinite(centro) && centro > 0) {
        carrossel.style.setProperty(
          "--carrossel-seta-topo",
          `${centro.toFixed(2)}px`,
        );
      }
    };

    const obterQuantidadeVisivel = () => {
      // No celular, cada navegação corresponde sempre a exatamente um quarto.
      if (window.matchMedia("(max-width: 767px)").matches) {
        return 1;
      }

      if (window.matchMedia("(max-width: 900px)").matches) {
        return 2;
      }

      return 3;
    };

    const obterTotalPaginas = () =>
      Math.max(1, Math.ceil(cards.length / quantidadeVisivel));

    const normalizarPagina = () => {
      const totalPaginas = obterTotalPaginas();
      paginaAtual = ((paginaAtual % totalPaginas) + totalPaginas) % totalPaginas;
    };

    const atualizarAcessibilidade = (inicio, fim) => {
      cards.forEach((card, indice) => {
        const estaVisivel = indice >= inicio && indice < fim;

        if (estaVisivel) {
          card.removeAttribute("aria-hidden");
          card.removeAttribute("tabindex");
          return;
        }

        card.setAttribute("aria-hidden", "true");
        card.setAttribute("tabindex", "-1");
      });
    };

    const atualizarCarrossel = () => {
      normalizarPagina();

      const primeiroCard = cards[0];
      const larguraCard = primeiroCard.getBoundingClientRect().width;
      const estilosTrilho = window.getComputedStyle(trilho);
      const espacamento =
        Number.parseFloat(estilosTrilho.columnGap || estilosTrilho.gap) || 0;
      const primeiroIndice = paginaAtual * quantidadeVisivel;
      const ultimoIndice = Math.min(
        primeiroIndice + quantidadeVisivel,
        cards.length,
      );
      const deslocamentoPretendido =
        primeiroIndice * (larguraCard + espacamento);
      const larguraVisivel =
        quantidadeVisivel * larguraCard +
        Math.max(0, quantidadeVisivel - 1) * espacamento;
      const deslocamentoMaximo = Math.max(
        0,
        trilho.scrollWidth - larguraVisivel,
      );
      const deslocamento = Math.min(
        deslocamentoPretendido,
        deslocamentoMaximo,
      );

      trilho.style.transform = `translate3d(-${deslocamento}px, 0, 0)`;
      atualizarAcessibilidade(primeiroIndice, ultimoIndice);
      atualizarCentroDasSetas();
    };

    const irParaPagina = (direcao) => {
      paginaAtual += direcao;
      atualizarCarrossel();
    };

    botaoAnterior.addEventListener("click", (evento) => {
      evento.preventDefault();
      evento.stopPropagation();
      irParaPagina(-1);
    });

    botaoProximo.addEventListener("click", (evento) => {
      evento.preventDefault();
      evento.stopPropagation();
      irParaPagina(1);
    });

    carrossel.addEventListener("keydown", (evento) => {
      if (evento.key === "ArrowLeft") {
        evento.preventDefault();
        irParaPagina(-1);
      }

      if (evento.key === "ArrowRight") {
        evento.preventDefault();
        irParaPagina(1);
      }
    });

    viewport.addEventListener(
      "touchstart",
      (evento) => {
        if (evento.touches.length !== 1) {
          toqueInicial = null;
          return;
        }

        toqueInicial = {
          x: evento.touches[0].clientX,
          y: evento.touches[0].clientY,
        };
      },
      { passive: true },
    );

    viewport.addEventListener(
      "touchend",
      (evento) => {
        if (!toqueInicial || evento.changedTouches.length !== 1) {
          toqueInicial = null;
          return;
        }

        const deslocamentoX =
          evento.changedTouches[0].clientX - toqueInicial.x;
        const deslocamentoY =
          evento.changedTouches[0].clientY - toqueInicial.y;
        const gestoHorizontal =
          Math.abs(deslocamentoX) >= 48 &&
          Math.abs(deslocamentoX) > Math.abs(deslocamentoY) * 1.2;

        toqueInicial = null;

        if (!gestoHorizontal) {
          return;
        }

        bloquearCliqueDoCard = true;
        irParaPagina(deslocamentoX > 0 ? -1 : 1);

        window.setTimeout(() => {
          bloquearCliqueDoCard = false;
        }, 450);
      },
      { passive: true },
    );

    viewport.addEventListener(
      "click",
      (evento) => {
        if (!bloquearCliqueDoCard) {
          return;
        }

        evento.preventDefault();
        evento.stopPropagation();
        bloquearCliqueDoCard = false;
      },
      true,
    );

    window.addEventListener("resize", () => {
      if (quadroRedimensionamento) {
        window.cancelAnimationFrame(quadroRedimensionamento);
      }

      quadroRedimensionamento = window.requestAnimationFrame(() => {
        const primeiroIndiceAnterior = paginaAtual * quantidadeVisivel;
        quantidadeVisivel = obterQuantidadeVisivel();
        paginaAtual = Math.floor(primeiroIndiceAnterior / quantidadeVisivel);
        atualizarCarrossel();
        quadroRedimensionamento = 0;
      });
    });

    if (imagemReferencia && "ResizeObserver" in window) {
      const observadorImagem = new ResizeObserver(atualizarCentroDasSetas);
      observadorImagem.observe(imagemReferencia);
    }

    if (imagemReferencia) {
      imagemReferencia.querySelectorAll("img").forEach((imagem) => {
        if (!imagem.complete) {
          imagem.addEventListener("load", atualizarCentroDasSetas, {
            once: true,
          });
        }
      });
    }

    window.addEventListener("load", atualizarCentroDasSetas, { once: true });

    quantidadeVisivel = obterQuantidadeVisivel();
    carrossel.classList.add("carrossel-ativo");
    atualizarCarrossel();
  };

  const iniciar = () => {
    document
      .querySelectorAll("[data-carrossel-quartos]")
      .forEach(iniciarCarrossel);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar, { once: true });
  } else {
    iniciar();
  }
})();
