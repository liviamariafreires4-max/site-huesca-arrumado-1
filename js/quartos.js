const botoes=document.querySelectorAll(".filtro-btn");
const quartos=document.querySelectorAll(".quarto-card");
botoes.forEach(botao=>botao.addEventListener("click",()=>{const filtro=botao.dataset.filter;botoes.forEach(item=>item.classList.remove("ativo"));botao.classList.add("ativo");quartos.forEach(quarto=>{quarto.hidden=!(filtro==="todos"||quarto.dataset.categoria===filtro);});}));
