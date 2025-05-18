document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.querySelector('.menu-toggle');
    const header = document.querySelector('header'); // Elemento pai que receberá a classe
    const primaryNav = document.querySelector('#primary-navigation'); // A <nav>

    if (menuToggle && header && primaryNav) {
        menuToggle.addEventListener('click', function () {
            // Alterna a classe no <header> para controlar a visibilidade da nav e o estilo do ícone
            header.classList.toggle('menu-open');

            // Atualiza atributos ARIA
            const isExpanded = header.classList.contains('menu-open');
            menuToggle.setAttribute('aria-expanded', isExpanded);
            primaryNav.setAttribute('aria-hidden', !isExpanded);
        });
    }
});