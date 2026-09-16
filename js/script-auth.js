document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('form-login');
    const formCadastro = document.getElementById('form-cadastro');

    // Preserva o parâmetro de redirect nos links entre login e cadastro
    preservarParametrosDeRedirect();

    if (formLogin) {
        configurarFormLogin(formLogin);
    }

    if (formCadastro) {
        configurarFormCadastro(formCadastro);
    }
});

function obterDestinoAposAutenticacao() {
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');

    if (redirect === 'carrinho') {
        return '/pages/carrinho.html';
    }
    return '/index.html';
}

function preservarParametrosDeRedirect() {
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');

    if (redirect) {
        const linksAlternancia = document.querySelectorAll('a[href*="cadastro.html"], a[href*="login.html"]');
        linksAlternancia.forEach(link => {
            const hrefAtual = link.getAttribute('href');
            if (hrefAtual && !hrefAtual.includes('?')) {
                link.setAttribute('href', `${hrefAtual}?redirect=${encodeURIComponent(redirect)}`);
            }
        });
    }
}

function exibirMensagem(elementoId, texto, tipo = 'erro') {
    const container = document.getElementById(elementoId);
    if (!container) return;

    container.textContent = texto;
    container.className = `mensagem-feedback ${tipo}`;
}

function limparMensagem(elementoId) {
    const container = document.getElementById(elementoId);
    if (!container) return;

    container.textContent = '';
    container.className = 'mensagem-feedback';
}

function configurarFormLogin(form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        limparMensagem('feedback-login');

        const email = form.email.value.trim();
        const password = form.password.value;
        const btnSubmit = form.querySelector('.btn-submit');

        if (!email || !password) {
            exibirMensagem('feedback-login', 'Por favor, preencha todos os campos.', 'erro');
            return;
        }

        try {
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Autenticando...';

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                exibirMensagem('feedback-login', data.error || 'Falha ao autenticar.', 'erro');
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Entrar ☕';
                return;
            }

            // Salva dados do usuário na sessão local
            localStorage.setItem('usuarioLogado', JSON.stringify(data.user));

            const destino = obterDestinoAposAutenticacao();
            exibirMensagem('feedback-login', `Bem-vindo(a), ${data.user.name}! Redirecionando...`, 'sucesso');

            setTimeout(() => {
                window.location.href = destino;
            }, 1000);

        } catch (error) {
            console.error('Erro na requisição de login:', error);
            exibirMensagem('feedback-login', 'Erro ao conectar ao servidor. Verifique sua conexão.', 'erro');
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Entrar ☕';
        }
    });
}

function configurarFormCadastro(form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        limparMensagem('feedback-cadastro');

        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const password = form.password.value;
        const confirmPassword = form.confirmPassword.value;
        const btnSubmit = form.querySelector('.btn-submit');

        if (!name || !email || !password || !confirmPassword) {
            exibirMensagem('feedback-cadastro', 'Por favor, preencha todos os campos.', 'erro');
            return;
        }

        if (password.length < 6) {
            exibirMensagem('feedback-cadastro', 'A senha deve conter no mínimo 6 caracteres.', 'erro');
            return;
        }

        if (password !== confirmPassword) {
            exibirMensagem('feedback-cadastro', 'As senhas digitadas não coincidem.', 'erro');
            return;
        }

        try {
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Criando conta...';

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                exibirMensagem('feedback-cadastro', data.error || 'Falha ao realizar cadastro.', 'erro');
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Criar Conta ✨';
                return;
            }

            // Salva sessão local
            localStorage.setItem('usuarioLogado', JSON.stringify(data.user));

            const destino = obterDestinoAposAutenticacao();
            exibirMensagem('feedback-cadastro', 'Conta criada com sucesso! Redirecionando...', 'sucesso');

            setTimeout(() => {
                window.location.href = destino;
            }, 1200);

        } catch (error) {
            console.error('Erro na requisição de cadastro:', error);
            exibirMensagem('feedback-cadastro', 'Erro ao conectar ao servidor. Verifique sua conexão.', 'erro');
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Criar Conta ✨';
        }
    });
}
