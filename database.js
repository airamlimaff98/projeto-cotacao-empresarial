// ========================================
// FUNÇÕES DE BANCO DE DADOS - REALTIME DATABASE
// ========================================

// Inicializar contador de cotações
async function inicializarContador() {
    const contadorRef = database.ref('configuracoes/ultimoNumero');
    const snapshot = await contadorRef.once('value');
    
    if (!snapshot.exists()) {
        await contadorRef.set(0);
    }
}

// Obter próximo número de cotação
async function obterProximoNumero() {
    const contadorRef = database.ref('configuracoes/ultimoNumero');
    
    return new Promise((resolve, reject) => {
        contadorRef.transaction((current) => {
            return (current || 0) + 1;
        }, (error, committed, snapshot) => {
            if (error) {
                reject(error);
            } else if (committed) {
                resolve(snapshot.val());
            }
        });
    });
}

// Coletar dados da cotação atual
function coletarDadosCotacao() {
    const solicitanteSelect = document.querySelector('.assinaturas-diretoria select');
    const aprovacaoInputs = document.querySelectorAll('.assinatura-cargo input');
    
    // Sempre usar a data atual
    const hoje = new Date();
    const dataAtual = hoje.toISOString().split('T')[0];
    
    const dados = {
        numero: document.getElementById('numCotacao').value,
        data: dataAtual,
        centroCusto: document.getElementById('centroCusto').value,
        prioridade: document.getElementById('prioridade').value,
        fornecedores: {
            condec: { 
                nome: document.querySelector('.select-fornecedor[data-fornecedor="condec"]')?.value || 'N/T',
                frete: parseFloat(document.querySelector('.condec .frete-input')?.value) || 0,
                pgto: document.querySelector('.condec .pgto-input')?.value || ''
            },
            teleaco: { 
                nome: document.querySelector('.select-fornecedor[data-fornecedor="teleaco"]')?.value || 'N/T',
                frete: parseFloat(document.querySelector('.teleaco .frete-input')?.value) || 0,
                pgto: document.querySelector('.teleaco .pgto-input')?.value || ''
            },
            premolnitos: { 
                nome: document.querySelector('.select-fornecedor[data-fornecedor="premolnitos"]')?.value || 'N/T',
                frete: parseFloat(document.querySelector('.premolnitos .frete-input')?.value) || 0,
                pgto: document.querySelector('.premolnitos .pgto-input')?.value || ''
            }
        },
        itens: [],
        totais: {
            condec: document.getElementById('totalCondec')?.textContent || 'R$ 0,00',
            teleaco: document.getElementById('totalTeleaco')?.textContent || 'R$ 0,00',
            premolnitos: document.getElementById('totalPremolnitos')?.textContent || 'R$ 0,00',
            melhor: document.getElementById('totalMelhor')?.textContent || 'R$ 0,00'
        },
        solicitante: solicitanteSelect?.value || '',
        autor: 'Airam Filho',
        aprovacao: aprovacaoInputs[1]?.value || '',
        criadoEm: firebase.database.ServerValue.TIMESTAMP,
        atualizadoEm: firebase.database.ServerValue.TIMESTAMP
    };
    
    // Coletar itens
    const linhas = document.querySelectorAll('#tableBody tr');
    linhas.forEach((linha, index) => {
        const itemSelect = linha.querySelector('.item-select');
        const qtdInput = linha.querySelector('.qtd-input');
        const undSelect = linha.querySelector('.und-input');
        
        const material = itemSelect?.value || '';
        const qtd = qtdInput?.value || '';
        const und = undSelect?.value || '';
        
        if (material || qtd) {
            const item = {
                material: material,
                quantidade: parseFloat(qtd) || 0,
                unidade: und,
                precos: {}
            };
            
            // Coletar preços de cada fornecedor
            ['condec', 'teleaco', 'premolnitos'].forEach(forn => {
                const unitInput = linha.querySelector(`.unit-input[data-fornecedor="${forn}"]`);
                const descInput = linha.querySelector(`.desc-input[data-fornecedor="${forn}"]`);
                const totalCell = linha.querySelector(`.total-cell[data-fornecedor="${forn}"]`);
                
                item.precos[forn] = {
                    unitario: parseFloat(unitInput?.value) || 0,
                    desconto: parseFloat(descInput?.value.replace('%', '').replace(',', '.')) || 0,
                    total: totalCell?.textContent || 'R$ 0,00'
                };
            });
            
            // Melhor preço
            const melhorUnit = linha.querySelector('.melhor-unit');
            const melhorDesc = linha.querySelector('.melhor-desc');
            const melhorTotal = linha.querySelector('.melhor-total');
            
            item.melhorPreco = {
                unitario: melhorUnit?.textContent || 'R$ 0,00',
                desconto: melhorDesc?.textContent || '-',
                total: melhorTotal?.textContent || 'R$ 0,00'
            };
            
            dados.itens.push(item);
        }
    });
    
    return dados;
}

// Salvar cotação (rascunho ou finalizada)
async function salvarCotacao(status = 'rascunho') {
    try {
        const dados = coletarDadosCotacao();
        dados.status = status;
        
        // Se não tem número, gerar novo
        if (!dados.numero || dados.numero === '0') {
            dados.numero = await obterProximoNumero();
            document.getElementById('numCotacao').value = dados.numero;
        }
        
        // Salvar no Realtime Database
        const cotacaoRef = database.ref(`cotacoes/COT-${dados.numero}`);
        await cotacaoRef.set(dados);
        
        // Se for finalizada, incrementar o número para a próxima cotação
        if (status === 'finalizada') {
            const proximoNumero = await obterProximoNumero();
            document.getElementById('numCotacao').value = proximoNumero;
        }
        
        mostrarNotificacao('Cotação salva com sucesso!', 'success');
        return dados.numero;
    } catch (error) {
        console.error('Erro ao salvar cotação:', error);
        mostrarNotificacao('Erro ao salvar cotação: ' + error.message, 'error');
        return null;
    }
}

// Carregar cotação por ID
async function carregarCotacao(cotacaoId) {
    try {
        const snapshot = await database.ref(`cotacoes/${cotacaoId}`).once('value');
        
        if (!snapshot.exists()) {
            mostrarNotificacao('Cotação não encontrada!', 'error');
            return;
        }
        
        const dados = snapshot.val();
        preencherFormulario(dados);
        fecharModalCotacoes();
        mostrarNotificacao('Cotação carregada com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao carregar cotação:', error);
        mostrarNotificacao('Erro ao carregar cotação: ' + error.message, 'error');
    }
}

// Preencher formulário com dados da cotação
function preencherFormulario(dados) {
    // Função auxiliar para definir valor com segurança
    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val || '';
    };

    // Cabeçalho
    setVal('numCotacao', dados.numero);
    setVal('dataCotacao', dados.data);
    setVal('centroCusto', dados.centroCusto);
    setVal('prioridade', dados.prioridade);
    
    // Fornecedores
    if (dados.fornecedores) {
        ['condec', 'teleaco', 'premolnitos'].forEach(fKey => {
            const fData = dados.fornecedores[fKey];
            const nomeStr = typeof fData === 'object' ? fData.nome : fData; // Fallback para formato antigo

            const selectF = document.querySelector(`.select-fornecedor[data-fornecedor="${fKey}"]`);
            if (selectF) selectF.value = nomeStr || 'N/T';

            // Carregar frete e pgto se existirem (novos dados)
            if (typeof fData === 'object') {
                const freteInp = document.querySelector(`.${fKey} .frete-input`);
                if (freteInp) freteInp.value = fData.frete || 0;

                const pgtoInp = document.querySelector(`.${fKey} .pgto-input`);
                if (pgtoInp) pgtoInp.value = fData.pgto || '';
            }
        });
    }
    
    // Limpar tabela atual para recriar conforme a cotação salva
    const tbody = document.getElementById('tableBody');
    if (tbody) tbody.innerHTML = '';
    
    // Preencher itens salvos
    if (dados.itens && Array.isArray(dados.itens) && dados.itens.length > 0) {
        dados.itens.forEach((item) => {
            // Verifica se a função de adicionar item existe no escopo global
            if (typeof adicionarItem === 'function') {
                adicionarItem(); // Cria a linha vazia
                
                // Pega a última linha criada
                const linhas = document.querySelectorAll('#tableBody tr');
                const linha = linhas[linhas.length - 1];
                
                if (linha) {
                    // Preencher item select
                    const selectItem = linha.querySelector('.item-select');
                    if (selectItem) {
                        selectItem.value = item.material;
                        // Se o item não estiver na lista (ex: item antigo), cria a opção visualmente
                        if (selectItem.value !== item.material) {
                            const option = document.createElement('option');
                            option.value = item.material;
                            option.text = item.material;
                            option.selected = true;
                            selectItem.appendChild(option);
                        }
                    }

                    const qtdInput = linha.querySelector('.qtd-input');
                    if (qtdInput) qtdInput.value = item.quantidade;

                    const undInput = linha.querySelector('.und-input');
                    if (undInput) undInput.value = item.unidade;
                    
                    // Preencher preços com segurança
                    if (item.precos) {
                        ['condec', 'teleaco', 'premolnitos'].forEach(forn => {
                            if (item.precos[forn]) {
                                const unitInput = linha.querySelector(`.unit-input[data-fornecedor="${forn}"]`);
                                if (unitInput) unitInput.value = item.precos[forn].unitario;
                                
                                const descInput = linha.querySelector(`.desc-input[data-fornecedor="${forn}"]`);
                                if (descInput) descInput.value = item.precos[forn].desconto;
                            }
                        });
                    }
                }
            }
        });
    } else {
        // Se não houver itens, adiciona 5 linhas padrão
        if (typeof adicionarItem === 'function') {
            for(let i=0; i<5; i++) adicionarItem();
        }
    }
    
    // Recalcular
    if (typeof calcularTudo === 'function') calcularTudo();
    
    // Assinaturas
    const solicitanteSelect = document.querySelector('.assinaturas-diretoria select');
    if (solicitanteSelect) solicitanteSelect.value = dados.solicitante || '';

    const inputsAssinatura = document.querySelectorAll('.assinatura-cargo input');
    // Força preenchimento se houver dados
    if (inputsAssinatura.length > 1) {
        // O index 1 é o campo de Aprovação (Direção / Gerência)
        if (dados.aprovacao) inputsAssinatura[1].value = dados.aprovacao;
    }
}

// Listar todas as cotações
async function listarCotacoes(filtros = {}) {
    console.log("Iniciando busca de cotações no Firebase...", filtros);
    try {
        const snapshot = await database.ref('cotacoes').once('value');
        const cotacoes = [];
        
        if (!snapshot.exists()) {
            console.log("Nenhuma cotação encontrada no caminho 'cotacoes'.");
            return [];
        }
        
        snapshot.forEach((childSnapshot) => {
            const cotacao = childSnapshot.val();
            
            // Aplicar filtros
            let incluir = true;
            
            if (filtros.status && cotacao.status !== filtros.status) {
                incluir = false;
            }
            
            if (filtros.centroCusto && cotacao.centroCusto !== filtros.centroCusto) {
                incluir = false;
            }
            
            if (incluir) {
                cotacoes.push({
                    id: childSnapshot.key,
                    ...cotacao
                });
            }
        });
        
        console.log(`Foram encontradas ${cotacoes.length} cotações após os filtros.`);
        
        // Ordenar por data (mais recente primeiro)
        cotacoes.sort((a, b) => (b.criadoEm || 0) - (a.criadoEm || 0));
        
        return cotacoes;
    } catch (error) {
        console.error('ERRO GRAVE ao listar cotações do Firebase:', error);
        if (error.code === 'PERMISSION_DENIED') {
            mostrarNotificacao('Erro de permissão! Verifique as regras do Firebase Database.', 'error');
            alert('Erro de Permissão (PERMISSION_DENIED). O banco de dados do Firebase bloqueou a leitura. Verifique se as Regras de Segurança estão em "true" para read/write no console do Firebase.');
        } else {
            mostrarNotificacao('Erro ao listar cotações: ' + error.message, 'error');
        }
        return [];
    }
}

// Excluir cotação
async function excluirCotacao(cotacaoId) {
    if (!confirm('Tem certeza que deseja excluir esta cotação?')) {
        return false;
    }
    
    try {
        await database.ref(`cotacoes/${cotacaoId}`).remove();
        mostrarNotificacao('Cotação excluída com sucesso!', 'success');
        return true;
    } catch (error) {
        console.error('Erro ao excluir cotação:', error);
        mostrarNotificacao('Erro ao excluir cotação: ' + error.message, 'error');
        return false;
    }
}

// Mostrar notificação
function mostrarNotificacao(mensagem, tipo = 'info') {
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao notificacao-${tipo}`;
    notificacao.textContent = mensagem;
    
    document.body.appendChild(notificacao);
    
    setTimeout(() => {
        notificacao.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notificacao.classList.remove('show');
        setTimeout(() => notificacao.remove(), 300);
    }, 3000);
}

// Inicializar ao carregar
window.addEventListener('DOMContentLoaded', () => {
    inicializarContador();
});
