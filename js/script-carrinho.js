// Função para resolver o caminho da imagem de forma compatível com páginas em subpastas (pages/)
function resolverUrlImagem(imgUrl) {
    if (!imgUrl) return '../img/logo.png';

    // Se for URL completa externa ou base64
    if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://') || imgUrl.startsWith('data:')) {
        return imgUrl;
    }

    // Remove barras e caminhos relativos iniciais
    const caminhoLimpo = imgUrl.replace(/^(\.\.\/|\/)+/, '');

    // Retorna caminho relativo a partir de pages/
    return `../${caminhoLimpo}`;
}

// Função principal para carregar e renderizar os itens
function renderizarCarrinho() {
    const listaContainer = document.getElementById('lista-carrinho');
    const totalContainer = document.getElementById('total-carrinho');
    
    // Pega o carrinho atualizado do localStorage
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

    // 1. Se o carrinho estiver vazio
    if (carrinho.length === 0) {
        listaContainer.innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio.</p>';
        totalContainer.innerHTML = '';
        return;
    }

    // 2. Limpa o container antes de renderizar
    listaContainer.innerHTML = ''; 
    let totalGeral = 0;

    // 3. Monta cada item do carrinho
    carrinho.forEach((produto, index) => {
        const subtotal = produto.preco * produto.quantidade;
        totalGeral += subtotal;

        const figureItem = document.createElement('figure');
        figureItem.classList.add('produtos-carrinho');

        const imagemSrc = resolverUrlImagem(produto.img);

        figureItem.innerHTML = `
            <figcaption>
                <img src="${imagemSrc}" alt="${produto.nome}" onerror="this.onerror=null; this.src='../img/logo.png';" style="max-width: 150px; height: 100px; object-fit: cover; border-radius: 8px; display: block; margin-bottom: 10px;">
                <b>${produto.nome}</b><br>
                Preço un: R$ ${produto.preco.toFixed(2).replace('.', ',')}<br>
                
                <!-- Controles de Quantidade -->
                <div class="controles-qtd" style="margin: 8px 0;">
                    <button type="button" onclick="alterarQuantidade(${index}, -1)">-</button>
                    <span style="margin: 0 8px; font-weight: bold;">${produto.quantidade}</span>
                    <button type="button" onclick="alterarQuantidade(${index}, 1)">+</button>
                </div>

                Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}<br><br>

                <!-- Botão Remover -->
                <button type="button" class="btn-remover" onclick="removerItem(${index})">Remover item</button>
            </figcaption>
        `;

        listaContainer.appendChild(figureItem);
    });

    // 4. Verifica status de login do usuário
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado')) || null;

    let htmlUsuarioStatus = '';
    let htmlBotaoAcao = '';

    if (usuarioLogado && usuarioLogado.name) {
        htmlUsuarioStatus = `
            <div class="usuario-logado-badge">
                <span>👤 Comprando como: <b>${usuarioLogado.name}</b></span>
            </div>
        `;
        htmlBotaoAcao = `
            <button type="button" class="btn-finalizar" onclick="finalizarPedido()">Finalizar Pedido ☕</button>
        `;
    } else {
        htmlUsuarioStatus = `
            <div class="aviso-login-carrinho">
                <span>🔒 <b>Atenção:</b> Você precisa estar conectado à sua conta para finalizar o pedido.</span>
            </div>
        `;
        htmlBotaoAcao = `
            <button type="button" class="btn-finalizar btn-pedir-login" onclick="finalizarPedido()">
                🔑 Fazer Login para Finalizar Pedido
            </button>
        `;
    }

    // 5. Exibe o Total e a Ação correspondente
    totalContainer.innerHTML = `
        <p style="font-size: 1.2rem; margin-bottom: 10px;">
            Total do Pedido: <b>R$ ${totalGeral.toFixed(2).replace('.', ',')}</b>
        </p>
        ${htmlUsuarioStatus}
        ${htmlBotaoAcao}
    `;
}

// Função para aumentar (+1) ou diminuir (-1) a quantidade
function alterarQuantidade(index, mudanca) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

    carrinho[index].quantidade += mudanca;

    // Se chegar a 0, remove o produto
    if (carrinho[index].quantidade <= 0) {
        carrinho.splice(index, 1);
    }

    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    renderizarCarrinho(); // Recarrega a tela com os novos valores
}

// Função para remover o produto por completo
function removerItem(index) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    
    carrinho.splice(index, 1); // Remove pelo índice

    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    renderizarCarrinho();
}

// Função para concluir o pedido, salvar no banco Neon e limpar o carrinho
async function finalizarPedido() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    if (carrinho.length === 0) return;

    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado')) || null;

    // TRAVA DE LOGIN: Redireciona para login se não estiver autenticado
    if (!usuarioLogado || !usuarioLogado.id) {
        alert('Você precisa estar conectado à sua conta para concluir seu pedido no Coffee Le Parisien. Redirecionando para login...');
        window.location.href = '/pages/login.html?redirect=carrinho';
        return;
    }

    try {
        const btnFinalizar = document.querySelector('.btn-finalizar');
        if (btnFinalizar) {
            btnFinalizar.disabled = true;
            btnFinalizar.textContent = 'Enviando pedido...';
        }

        // Envia os itens para a API registrar no Neon PostgreSQL via Prisma
        const itemsFormatados = carrinho.map(item => ({
            productId: item.id || 1,
            quantity: item.quantidade || 1
        }));

        const response = await fetch('/api/pedidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: usuarioLogado.id,
                customerName: usuarioLogado.name,
                items: itemsFormatados
            })
        });

        if (!response.ok) {
            const erroData = await response.json();
            throw new Error(erroData.error || 'Erro ao registrar pedido no servidor.');
        }

        alert(`Obrigado, ${usuarioLogado.name}! Seu pedido foi registrado com sucesso no Coffee Le Parisien.`);
        localStorage.removeItem('carrinho'); // Limpa o carrinho
        window.location.href = '/index.html'; // Redireciona para a página inicial

    } catch (e) {
        console.error('Erro ao finalizar pedido:', e);
        alert('Ocorreu um erro ao processar seu pedido. Por favor, tente novamente.');
        renderizarCarrinho();
    }
}

// Executa a função assim que o HTML carregar
document.addEventListener('DOMContentLoaded', renderizarCarrinho);