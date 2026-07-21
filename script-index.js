document.addEventListener('DOMContentLoaded', () => {
    const botoesAdicionar = document.querySelectorAll('.btn-adicionar');

    botoesAdicionar.forEach(botao => {
        botao.addEventListener('click', (event) => {
            const figure = event.target.closest('.produtos');
            const inputQuantidade = figure.querySelector('.qtd-produto');
            const quantidadeSelecionada = parseInt(inputQuantidade.value) || 1;

            const produto = {
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
    });
});