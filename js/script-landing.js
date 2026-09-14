document.addEventListener('DOMContentLoaded', () => {
    configurarUsuarioHeader();
    atualizarContadorCarrinho();
});

function configurarUsuarioHeader() {
    const container = document.getElementById('landing-container-usuario');
    if (!container) return;

    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    if (usuarioLogado && usuarioLogado.name) {
        const primeiroNome = usuarioLogado.name.split(' ')[0];
        container.innerHTML = `
            <div class="user-badge" title="Conectado como ${usuarioLogado.name}">
                <span>☕ Olá, <b>${primeiroNome}</b></span>
                <span id="btn-landing-logout" style="cursor: pointer; margin-left: 6px; font-weight: bold; color: #ff9999;" title="Sair">✕</span>
            </div>
        `;

        document.getElementById('btn-landing-logout')?.addEventListener('click', () => {
            if (confirm('Deseja realmente sair da sua conta?')) {
                localStorage.removeItem('usuarioLogado');
                window.location.reload();
            }
        });
    } else {
        container.innerHTML = `
            <a href="pages/login.html" class="btn-icone-header" title="Entrar / Cadastrar">
                <span>👤</span>
            </a>
        `;
    }
}

function atualizarContadorCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const totalItens = carrinho.reduce((acc, item) => acc + (item.quantidade || 1), 0);
    
    const contadorElemento = document.getElementById('carrinho-contador');
    if (contadorElemento) {
        if (totalItens > 0) {
            contadorElemento.textContent = totalItens;
            contadorElemento.style.display = 'inline-flex';
        } else {
            contadorElemento.style.display = 'none';
        }
    }
}
