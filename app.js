// ===================== ALTERNÂNCIA DE TEMA =====================
const btnTema = document.getElementById('btn-tema');
const TEMA_STORAGE = 'tema_preferido';

function aplicarTema(tipo) {
    if (tipo === 'escuro') {
        document.documentElement.setAttribute('data-tema', 'escuro');
        btnTema.textContent = '☀️ Claro';
    } else {
        document.documentElement.removeAttribute('data-tema');
        btnTema.textContent = '🌙 Escuro';
    }
    localStorage.setItem(TEMA_STORAGE, tipo);
}

function inicializarTema() {
    const salvo = localStorage.getItem(TEMA_STORAGE);
    const prefereEscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
    aplicarTema(salvo || (prefereEscuro ? 'escuro' : 'claro'));
}

btnTema.addEventListener('click', () => {
    const atual = document.documentElement.getAttribute('data-tema');
    aplicarTema(atual === 'escuro' ? 'claro' : 'escuro');
});

// Aplicar ao carregar
inicializarTema();