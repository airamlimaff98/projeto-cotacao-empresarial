// ========================================
// GERENCIAMENTO DE SELECTS
// ========================================

/**
 * Função genérica para adicionar uma nova opção a uma lista, salvando no Firebase e atualizando a UI.
 */
async function adicionarNovaOpcao(config) {
    const { entidadeNome, promptMsg, firebasePath, formatoNome = (nome) => nome.trim().toUpperCase(), onSuccess } = config;
    const nome = prompt(promptMsg);
    
    if (!nome || nome.trim() === '') {
        return;
    }
    
    const nomeFormatado = formatoNome(nome);

    try {
        // Salvar no Firebase
        const ref = database.ref(firebasePath).push();
        await ref.set({
            nome: nomeFormatado,
            ativo: true,
            criadoEm: firebase.database.ServerValue.TIMESTAMP
        });
        
        if (onSuccess) {
            onSuccess(nomeFormatado);
        }

        mostrarNotificacao(`${entidadeNome} adicionado com sucesso!`, 'success');
    } catch (error) {
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
            if (typeof fornecedoresLista !== 'undefined' && !fornecedoresLista.includes(nome)) {
                fornecedoresLista.push(nome);
            }
            if (typeof preencherSelectsFornecedores === 'function') {
                preencherSelectsFornecedores();
            }
        }
    });
}

// Adicionar novo centro de custo
async function adicionarNovoCentroCusto() {
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
    });
}

// Adicionar novo solicitante
async function adicionarNovoSolicitante() {
    await adicionarNovaOpcao({
        entidadeNome: 'Solicitante',
        promptMsg: 'Digite o nome do novo Solicitante:',
        firebasePath: 'solicitantes',
        formatoNome: (nome) => nome.trim(), // Solicitante não precisa ser maiúsculo
        onSuccess: (nome) => {
            const select = document.querySelector('.assinaturas-diretoria select');
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
        
        if (typeof fornecedoresLista !== 'undefined' && fornecedoresFirebase.length > 0) {
            fornecedoresLista.push(...fornecedoresFirebase);
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
        if (!select) return;
        
        snapshot.forEach((childSnapshot) => {
            const centro = childSnapshot.val();
            if (centro.ativo) {
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
        const select = document.querySelector('.assinaturas-diretoria select');
        if (!select) return;
        
        snapshot.forEach((childSnapshot) => {
            const solicitante = childSnapshot.val();
            if (solicitante.ativo) {
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

// Inicializar carregamento
async function inicializarGerenciadorSelects() {
    await carregarFornecedoresDoFirebase();
    await carregarCentrosCustoDoFirebase();
    await carregarSolicitantesDoFirebase();
}

// ========================================
// FUNÇÕES DE EXCLUSÃO DE LISTAS
// ========================================

async function excluirCentroCustoSelecionado() {
    const select = document.getElementById('centroCusto');
    const valor = select?.value;
    
    if (!valor) {
        alert('Selecione uma Obra/Centro de Custo para excluir.');
        return;
    }
    
    if (confirm(`Deseja realmente excluir a obra "${valor}" da lista?`)) {
        try {
            const snapshot = await database.ref('centrosCusto').once('value');
            snapshot.forEach(child => {
                if (child.val().nome === valor) {
                    database.ref(`centrosCusto/${child.key}`).update({ ativo: false });
                }
            });
            
            const option = select.querySelector(`option[value="${valor}"]`);
            if (option) option.remove();
            select.value = '';
            
            mostrarNotificacao('Obra excluída com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao excluir obra:', error);
            mostrarNotificacao('Erro: ' + error.message, 'error');
        }
    }
}

async function excluirFornecedorSelecionado(btnElement) {
    const container = btnElement.closest('.fornecedor-header');
    const select = container?.querySelector('.select-fornecedor');
    const valor = select?.value;
    
    if (!valor || valor === 'N/T') {
        alert('Selecione um fornecedor válido para excluir.');
        return;
    }
    
    if (confirm(`Deseja realmente excluir o fornecedor "${valor}" de todas as listas?`)) {
        try {
            const snapshot = await database.ref('fornecedores').once('value');
            snapshot.forEach(child => {
                const f = child.val();
                if (f.nome && f.nome.toUpperCase() === valor.toUpperCase()) {
                    database.ref(`fornecedores/${child.key}`).update({ ativo: false });
                }
            });
            
            if (typeof fornecedoresLista !== 'undefined') {
                const index = fornecedoresLista.findIndex(f => f.toUpperCase() === valor.toUpperCase());
                if (index > -1) {
                    fornecedoresLista.splice(index, 1);
                }
            }
            
            if (typeof preencherSelectsFornecedores === 'function') {
                preencherSelectsFornecedores();
            }
            
            mostrarNotificacao('Fornecedor excluído com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao excluir fornecedor:', error);
            mostrarNotificacao('Erro: ' + error.message, 'error');
        }
    }
}
