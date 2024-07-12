let menu = document.querySelector(".sandbar");

let navbar = document.querySelector(".menu");

window.addEventListener("scroll", () => {
    header.classList.toggle("shadow", window.scrollY > 0);
});

menu.onclick = () => {
    navbar.classList.toggle("active");
};
