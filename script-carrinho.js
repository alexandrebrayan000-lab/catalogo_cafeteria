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

        figureItem.innerHTML = `
            <figcaption>
                <img src="${produto.img}" alt="${produto.nome}" style="max-width: 150px; display: block; margin-bottom: 10px;">
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

    // 4. Exibe o Total e o Botão de Finalizar Pedido
    totalContainer.innerHTML = `
        <p style="font-size: 1.2rem; margin-bottom: 10px;">
            Total do Pedido: <b>R$ ${totalGeral.toFixed(2).replace('.', ',')}</b>
        </p>
        <button type="button" class="btn-finalizar" onclick="finalizarPedido()">Finalizar Pedido</button>
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

// Função para concluir o pedido e limpar o carrinho
function finalizarPedido() {
    alert('Pedido realizado com sucesso! Obrigado por comprar no Coffee Le Parisien.');
    localStorage.removeItem('carrinho'); // Limpa os dados do navegador
    window.location.href = 'index.html'; // Redireciona para a home
}

// Executa a função assim que o HTML carregar
document.addEventListener('DOMContentLoaded', renderizarCarrinho);