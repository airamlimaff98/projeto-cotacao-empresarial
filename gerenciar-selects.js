// ========================================
// GERENCIAMENTO DE SELECTS
// ========================================
/**
 * Função genérica para adicionar uma nova opção a uma lista, salvando no Firebase e atualizando a UI.
 * @param {object} config - Objeto de configuração.
 * @param {string} config.entidadeNome - Nome da entidade para mensagens (ex: 'Fornecedor').
 * @param {string} config.promptMsg - Mensagem para exibir no prompt.
 * @param {string} config.firebasePath - Caminho no Firebase para salvar o novo item.
 * @param {function} [config.formatoNome] - Função para formatar o nome inserido.
 * @param {function} config.onSuccess - Callback para executar na UI após o sucesso.
 */
async function adicionarNovaOpcao(config) {
    const { entidadeNome, promptMsg, firebasePath, formatoNome = (nome) => nome.trim().toUpperCase(), onSuccess } = config;

// Adicionar novo fornecedor
async function adicionarNovoFornecedor() {
    const nome = prompt('Digite o nome do novo fornecedor:');
    
    const nome = prompt(promptMsg);
    if (!nome || nome.trim() === '') {
        return;
    }
    

    const nomeFormatado = formatoNome(nome);

    try {
        // Salvar no Firebase
        const fornecedorRef = database.ref('fornecedores').push();
        await fornecedorRef.set({
            nome: nome.trim().toUpperCase(),
        const ref = database.ref(firebasePath).push();
        await ref.set({
            nome: nomeFormatado,
            ativo: true,
            criadoEm: firebase.database.ServerValue.TIMESTAMP
        });
        
        // Adicionar à lista local
        fornecedoresLista.push(nome.trim().toUpperCase());
        
        // Atualizar selects
        preencherSelectsFornecedores();
        
        mostrarNotificacao('Fornecedor adicionado com sucesso!', 'success');

        if (onSuccess) {
            onSuccess(nomeFormatado);
        }

        mostrarNotificacao(`${entidadeNome} adicionado com sucesso!`, 'success');
    } catch (error) {
        console.error('Erro ao adicionar fornecedor:', error);
        mostrarNotificacao('Erro ao adicionar fornecedor: ' + error.message, 'error');
        console.error(`Erro ao adicionar ${entidadeNome}:`, error);
        mostrarNotificacao(`Erro ao adicionar ${entidadeNome}: ` + error.message, 'error');
    }
}

// Adicionar novo fornecedor
async function adicionarNovoFornecedor() {
    await adicionarNovaOpcao({
        entidadeNome: 'Fornecedor',
        promptMsg: 'Digite o nome do novo fornecedor:',
        firebasePath: 'fornecedores',
        onSuccess: (nome) => {
            if (!fornecedoresLista.includes(nome)) {
                fornecedoresLista.push(nome);
            }
            // A função preencherSelectsFornecedores já atualiza todos os selects
            preencherSelectsFornecedores();
        }
    });
}

// Adicionar novo centro de custo
async function adicionarNovoCentroCusto() {
    const nome = prompt('Digite o nome do novo Centro de Custo:');
    
    if (!nome || nome.trim() === '') {
        return;
    }
    
    try {
        // Salvar no Firebase
        const centroRef = database.ref('centrosCusto').push();
        await centroRef.set({
            nome: nome.trim().toUpperCase(),
            ativo: true,
            criadoEm: firebase.database.ServerValue.TIMESTAMP
        });
        
        // Adicionar ao select
        const select = document.getElementById('centroCusto');
        
        // Verificar se já existe na lista local antes de adicionar
        if (Array.from(select.options).some(opt => opt.value === nome.trim().toUpperCase())) {
            return; // Já existe, apenas sai
    await adicionarNovaOpcao({
        entidadeNome: 'Centro de Custo',
        promptMsg: 'Digite o nome do novo Centro de Custo:',
        firebasePath: 'centrosCusto',
        onSuccess: (nome) => {
            const select = document.getElementById('centroCusto');
            if (select && !Array.from(select.options).some(opt => opt.value === nome)) {
                const option = document.createElement('option');
                option.value = nome;
                option.textContent = nome;
                select.appendChild(option);
                select.value = nome;
            }
        }

        const option = document.createElement('option');
        option.value = nome.trim().toUpperCase();
        option.textContent = nome.trim().toUpperCase();
        select.appendChild(option);
        select.value = nome.trim().toUpperCase();
        
        mostrarNotificacao('Centro de Custo adicionado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao adicionar centro de custo:', error);
        mostrarNotificacao('Erro ao adicionar centro de custo: ' + error.message, 'error');
    }
    });
}

// Adicionar novo solicitante
async function adicionarNovoSolicitante() {
    const nome = prompt('Digite o nome do novo Solicitante:');
    
    if (!nome || nome.trim() === '') {
        return;
    }
    
    try {
        // Salvar no Firebase
        const solicitanteRef = database.ref('solicitantes').push();
        await solicitanteRef.set({
            nome: nome.trim(),
            ativo: true,
            criadoEm: firebase.database.ServerValue.TIMESTAMP
        });
        
        // Adicionar ao select
        const select = document.querySelector('.assinaturas select');
        const option = document.createElement('option');
        option.value = nome.trim();
        option.textContent = nome.trim();
        select.appendChild(option);
        select.value = nome.trim();
        
        mostrarNotificacao('Solicitante adicionado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao adicionar solicitante:', error);
        mostrarNotificacao('Erro ao adicionar solicitante: ' + error.message, 'error');
    }
    await adicionarNovaOpcao({
        entidadeNome: 'Solicitante',
        promptMsg: 'Digite o nome do novo Solicitante:',
        firebasePath: 'solicitantes',
        formatoNome: (nome) => nome.trim(), // Solicitante não precisa ser maiúsculo
        onSuccess: (nome) => {
            const select = document.querySelector('.assinaturas-diretoria select'); // Seletor mais específico
            if (select && !Array.from(select.options).some(opt => opt.value === nome)) {
                const option = document.createElement('option');
                option.value = nome;
                option.textContent = nome;
                select.appendChild(option);
                select.value = nome;
            }
        }
    });
}

// Carregar fornecedores do Firebase
async function carregarFornecedoresDoFirebase() {
    try {
        const snapshot = await database.ref('fornecedores').once('value');
        const fornecedoresFirebase = [];
        
        snapshot.forEach((childSnapshot) => {
            const fornecedor = childSnapshot.val();
            if (fornecedor.ativo) {
                fornecedoresFirebase.push(fornecedor.nome);
            }
        });
        
        // Mesclar com lista local
        if (fornecedoresFirebase.length > 0) {
            fornecedoresLista.push(...fornecedoresFirebase);
            // Remover duplicatas
            fornecedoresLista = [...new Set(fornecedoresLista)];
        }
    } catch (error) {
        console.error('Erro ao carregar fornecedores:', error);
    }
}

// Carregar centros de custo do Firebase
async function carregarCentrosCustoDoFirebase() {
    try {
        const snapshot = await database.ref('centrosCusto').once('value');
        const select = document.getElementById('centroCusto');
        
        snapshot.forEach((childSnapshot) => {
            const centro = childSnapshot.val();
            if (centro.ativo) {
                // Verificar se já existe
                const existe = Array.from(select.options).some(opt => opt.value === centro.nome);
                if (!existe) {
                    const option = document.createElement('option');
                    option.value = centro.nome;
                    option.textContent = centro.nome;
                    select.appendChild(option);
                }
            }
        });
    } catch (error) {
        console.error('Erro ao carregar centros de custo:', error);
    }
}

// Carregar solicitantes do Firebase
async function carregarSolicitantesDoFirebase() {
    try {
        const snapshot = await database.ref('solicitantes').once('value');
        const select = document.querySelector('.assinaturas select');
        const select = document.querySelector('.assinaturas-diretoria select'); // Seletor mais específico
        
        snapshot.forEach((childSnapshot) => {
            const solicitante = childSnapshot.val();
            if (solicitante.ativo) {
                // Verificar se já existe
                const existe = Array.from(select.options).some(opt => opt.value === solicitante.nome);
                if (!existe) {
                    const option = document.createElement('option');
                    option.value = solicitante.nome;
                    option.textContent = solicitante.nome;
                    select.appendChild(option);
                }
            }
        });
    } catch (error) {
        console.error('Erro ao carregar solicitantes:', error);
    }
}

// Inicializar carregamento ao abrir página
window.addEventListener('DOMContentLoaded', async () => {
async function inicializarGerenciadorSelects() {
    await carregarFornecedoresDoFirebase();
    await carregarCentrosCustoDoFirebase();
    await carregarSolicitantesDoFirebase();
});

}
// ========================================
// FUNÇÕES DE EXCLUSÃO DE LISTAS (OBRAS, FORNECEDORES)
// ========================================

async function excluirCentroCustoSelecionado() {
    const select = document.getElementById('centroCusto');
    const valor = select.value;
    
    if (!valor) {
        alert('Selecione uma Obra/Centro de Custo para excluir.');
        return;
    }
    
    if (confirm(`Deseja realmente excluir a obra "${valor}" da lista?`)) {
        try {
            // Desativar no Firebase, se existir
            const snapshot = await database.ref('centrosCusto').once('value');
            snapshot.forEach(child => {
                if (child.val().nome === valor) {
                    database.ref(`centrosCusto/${child.key}`).update({ ativo: false });
                }
            });
            
            // Remover da DOM
            const option = select.querySelector(`option[value="${valor}"]`);
            if (option) {
                option.remove();
            }
            select.value = '';
            
            mostrarNotificacao('Obra excluída com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao excluir obra:', error);
            mostrarNotificacao('Erro: ' + error.message, 'error');
        }
    }
}

async function excluirFornecedorSelecionado(btnElement) {
    // Achar o select irmão deste botão
    const container = btnElement.closest('.fornecedor-header');
    const select = container.querySelector('.select-fornecedor');
    const valor = select.value;
    
    if (!valor || valor === 'N/T') {
        alert('Selecione um fornecedor válido para excluir.');
        return;
    }
    
    if (confirm(`Deseja realmente excluir o fornecedor "${valor}" de todas as listas?`)) {
        try {
            // Desativar no Firebase, se existir
            const snapshot = await database.ref('fornecedores').once('value');
            snapshot.forEach(child => {
                const f = child.val();
                if (f.nome && f.nome.toUpperCase() === valor.toUpperCase()) {
                    database.ref(`fornecedores/${child.key}`).update({ ativo: false });
                }
            });
            
            // Remover da lista local (fornecedoresLista que fica em memória)
            if (typeof fornecedoresLista !== 'undefined') {
                const index = fornecedoresLista.findIndex(f => f.toUpperCase() === valor.toUpperCase());
                if (index > -1) {
                    fornecedoresLista.splice(index, 1);
                }
            }
            
            // Repreencher todos os selects
            preencherSelectsFornecedores();
            
            mostrarNotificacao('Fornecedor excluído com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao excluir fornecedor:', error);
            mostrarNotificacao('Erro: ' + error.message, 'error');
        }
    }
}
