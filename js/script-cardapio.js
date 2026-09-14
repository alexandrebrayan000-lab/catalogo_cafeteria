document.addEventListener('DOMContentLoaded', async () => {
    // Configura o botão de usuário/login no header
    configurarHeaderUsuario();

    // Tenta carregar os produtos dinamicamente do banco de dados (Prisma + Neon)
    await carregarCardapioDoBanco();

    // Vincula os eventos aos botões
    configurarBotoesAdicionar();
});

function configurarHeaderUsuario() {
    const container = document.getElementById('container-usuario');
    if (!container) return;

    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    if (usuarioLogado && usuarioLogado.name) {
        const primeiroNome = usuarioLogado.name.split(' ')[0];
        container.innerHTML = `
            <div class="user-badge" title="Clique no X para sair">
                <span>☕ Olá, <b>${primeiroNome}</b></span>
                <span id="btn-logout" style="cursor: pointer; margin-left: 6px; font-weight: bold; color: #ff9999;" title="Encerrar sessão">✕</span>
            </div>
        `;

        document.getElementById('btn-logout')?.addEventListener('click', () => {
            if (confirm('Deseja realmente sair da sua conta?')) {
                localStorage.removeItem('usuarioLogado');
                window.location.reload();
            }
        });
    } else {
        container.innerHTML = `
            <a href="login.html" id="btn-login-header" class="btn-icone-header" title="Entrar / Cadastrar">
                <span>👤</span>
            </a>
        `;
    }
}

async function carregarCardapioDoBanco() {
    try {
        const response = await fetch('/api/categorias');
        if (!response.ok) return;

        const categorias = await response.json();
        if (!categorias || categorias.length === 0) return;

        const mainElement = document.querySelector('main');
        if (!mainElement) return;

        // Limpa o conteúdo estático do main
        mainElement.innerHTML = '';

        // Renderiza cada categoria e seus produtos vindos do Neon/Prisma
        categorias.forEach(cat => {
            const h2 = document.createElement('h2');
            h2.textContent = cat.name;
            mainElement.appendChild(h2);

            const section = document.createElement('section');
            section.id = cat.slug || `categoria-${cat.id}`;

            cat.products.forEach(prod => {
                const figure = document.createElement('figure');
                figure.classList.add('produtos');
                figure.dataset.id = prod.id;
                figure.dataset.nome = prod.name;
                figure.dataset.preco = prod.price;
                figure.dataset.img = prod.imageUrl;

                const precoFormatado = Number(prod.price).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                });

                // Normaliza imagem local caso seja relativo
                let imgFinal = prod.imageUrl;
                if (!imgFinal.startsWith('http://') && !imgFinal.startsWith('https://') && !imgFinal.startsWith('data:')) {
                    const limpo = imgFinal.replace(/^(\.\.\/|\/)+/, '');
                    imgFinal = `../${limpo}`;
                }

                figure.innerHTML = `
                    <img src="${imgFinal}" alt="${prod.name}" onerror="this.onerror=null; this.src='../img/logo.png';">
                    <figcaption>
                        <b>${prod.name}</b>
                        <p class="preco-unidade">${precoFormatado}</p>
                        <div class="controle-qtd">
                            <label for="qtd-${prod.id}">Qtd:</label>
                            <input type="number" id="qtd-${prod.id}" class="qtd-produto" value="1" min="1" max="10">
                        </div>
                        <button type="button" class="btn-adicionar link-produto">Adicionar 🛒</button>
                    </figcaption>
                `;

                section.appendChild(figure);
            });

            mainElement.appendChild(section);
        });
    } catch (error) {
        console.warn('Usando catálogo estático offline / fallback:', error);
    }
}

function configurarBotoesAdicionar() {
    document.addEventListener('click', (event) => {
        const botao = event.target.closest('.btn-adicionar');
        if (!botao) return;

        const figure = botao.closest('.produtos');
        if (!figure) return;

        const inputQuantidade = figure.querySelector('.qtd-produto');
        const quantidadeSelecionada = parseInt(inputQuantidade?.value) || 1;

        const produto = {
            id: figure.dataset.id ? Number(figure.dataset.id) : null,
            nome: figure.dataset.nome,
            preco: parseFloat(figure.dataset.preco),
            img: figure.dataset.img,
            quantidade: quantidadeSelecionada
        };

        let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

        // Se o item já existir no carrinho, apenas incrementa a quantidade
        const itemExistente = carrinho.find(item => item.nome === produto.nome);
        if (itemExistente) {
            itemExistente.quantidade += produto.quantidade;
        } else {
            carrinho.push(produto);
        }

        localStorage.setItem('carrinho', JSON.stringify(carrinho));

        // Redireciona para o carrinho
        window.location.href = 'carrinho.html';
    });
}
