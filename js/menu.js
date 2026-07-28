const menuButton=document.getElementById("menu-button");
const mobileContainer=document.getElementById("menu-mobile-container");
if(menuButton&&mobileContainer){
menuButton.addEventListener("click",()=>{const expanded=menuButton.getAttribute("aria-expanded")==="true";menuButton.setAttribute("aria-expanded",String(!expanded));mobileContainer.classList.toggle("open");});
mobileContainer.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>{menuButton.setAttribute("aria-expanded","false");mobileContainer.classList.remove("open");}));
}
