document.addEventListener("DOMContentLoaded", () => {
  const botoes = document.querySelectorAll(".filtro-btn");
  const quartos = document.querySelectorAll(".quarto-card");

  if (botoes.length === 0 || quartos.length === 0) {
    return;
  }

  botoes.forEach((botao) => {
    botao.addEventListener("click", () => {
      const filtro = botao.dataset.filter;

      botoes.forEach((item) => item.classList.remove("ativo"));
      botao.classList.add("ativo");

      quartos.forEach((quarto) => {
        const deveExibir =
          filtro === "todos" || quarto.dataset.categoria === filtro;

        quarto.hidden = !deveExibir;
      });
    });
  });
});
