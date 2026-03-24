// Contador de itens
let itemCount = 0;

// Nomes dos fornecedores
const nomesFornecedores = {
    condec: 'CONDEC CONSTRUÇÃO',
    teleaco: 'TELEAÇO',
    premolnitos: 'PREMOLNITOS'
};

// Atualizar nome do fornecedor
function atualizarFornecedor(fornecedor, novoNome) {
    nomesFornecedores[fornecedor] = novoNome;
}
const FORNECEDORES_KEYS = ['condec', 'teleaco', 'premolnitos'];

// Inicializar com 5 itens ao carregar a página
window.addEventListener('DOMContentLoaded', async () => {
    // Definir data atual
    const hoje = new Date();
    const dataFormatada = hoje.toISOString().split('T')[0];
    document.getElementById('dataCotacao').value = dataFormatada;
    
    // Preencher selects de fornecedores
    preencherSelectsFornecedores();

    // Carregar dados dinâmicos dos selects (de gerenciar-selects.js)
    if (typeof inicializarGerenciadorSelects === 'function') {
        await inicializarGerenciadorSelects();
    }
    
    for (let i = 0; i < 5; i++) {
        adicionarItem();
    }

    // Configurar Event Delegation para a tabela
    const tableBody = document.getElementById('tableBody');
    tableBody.addEventListener('input', handleTableInput);
    tableBody.addEventListener('blur', handleTableBlur, true); // Usar captura para o evento blur
});

// Preencher selects de fornecedores com a lista completa
function preencherSelectsFornecedores() {
    const selects = document.querySelectorAll('.select-fornecedor');
    const fornecedoresOrdenados = ['N/T', ...fornecedoresLista.filter(f => f !== 'N/T').sort()];
    
    selects.forEach(select => {
        const fornecedorAtual = select.value;
        // Preserva o valor selecionado se ele já existir na nova lista, senão usa o padrão do dataset
        const fornecedorKey = select.dataset.fornecedor;
        const nomePadrao = nomesFornecedores[fornecedorKey] || 'N/T';
        const valorAtual = select.value || nomePadrao;

        select.innerHTML = '';
        fornecedoresOrdenados.forEach(fornecedor => {
            const option = document.createElement('option');
            option.value = fornecedor;
            option.textContent = fornecedor;
            if (fornecedor === fornecedorAtual) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    });
}

// Adicionar novo item à tabela
function adicionarItem() {
    itemCount++;
    const tbody = document.getElementById('tableBody');
    const tr = document.createElement('tr');
    tr.dataset.item = itemCount;
    
    tr.innerHTML = `
        <td>
            <div class="input-with-button" style="display:flex;gap:5px;align-items:center;">
                <select class="item-select" data-item="${itemCount}" style="flex:1;">
                    <option value="">Selecione ou digite novo</option>
                </select>
                <button class="btn-edit-item" onclick="editarItem(${itemCount})" title="Editar Item" aria-label="Editar Item" style="padding:4px 8px;font-size:12px;background:#ffc107;border:none;border-radius:4px;cursor:pointer;font-weight:bold;">✏️</button>
                <button class="btn-add-select" onclick="adicionarNovoItem(${itemCount})" title="Adicionar Novo Item" aria-label="Adicionar Novo Item" style="padding:4px 8px;font-size:12px;">+</button>
                <button class="btn-remove-select-item" onclick="excluirItemSelecionado(${itemCount})" title="Excluir Item da Lista" aria-label="Excluir Item da Lista" style="padding:4px 8px;font-size:12px;background:#dc3545;color:white;border:none;border-radius:4px;cursor:pointer;font-weight:bold;">X</button>
            </div>
        </td>
        <td><input type="text" class="qtd-input" data-item="${itemCount}" inputmode="numeric" oninput="mascaraQuantidade(this); calcularLinha(${itemCount})"></td>
        <td>
            <select class="und-input" onchange="calcularLinha(${itemCount})">
                <option value="">-</option>
                <option value="UN">UN</option>
                <option value="M">M</option>
                <option value="M²">M²</option>
                <option value="M³">M³</option>
                <option value="KG">KG</option>
                <option value="L">L</option>
                <option value="CX">CX</option>
                <option value="PC">PC</option>
            </select>
        </td>
        <td class="condec unit-cell"><input type="text" class="unit-input" data-item="${itemCount}" data-fornecedor="condec" inputmode="decimal" oninput="mascaraMoeda(this)" placeholder="R$ 0,00"></td>
        <td class="condec desc-cell"><input type="text" class="desc-input" data-item="${itemCount}" data-fornecedor="condec" value="0,00" placeholder="0,00" inputmode="decimal" oninput="calcularLinha(${itemCount})"></td>
        <td class="condec total-cell" data-item="${itemCount}" data-fornecedor="condec">R$ 0,00</td>
        <td class="teleaco unit-cell"><input type="text" class="unit-input" data-item="${itemCount}" data-fornecedor="teleaco" inputmode="decimal" oninput="mascaraMoeda(this)" placeholder="R$ 0,00"></td>
        <td class="teleaco desc-cell"><input type="text" class="desc-input" data-item="${itemCount}" data-fornecedor="teleaco" value="0,00" placeholder="0,00" inputmode="decimal" oninput="calcularLinha(${itemCount})"></td>
        <td class="teleaco total-cell" data-item="${itemCount}" data-fornecedor="teleaco">R$ 0,00</td>
        <td class="premolnitos unit-cell"><input type="text" class="unit-input" data-item="${itemCount}" data-fornecedor="premolnitos" inputmode="decimal" oninput="mascaraMoeda(this)" placeholder="R$ 0,00"></td>
        <td class="premolnitos desc-cell"><input type="text" class="desc-input" data-item="${itemCount}" data-fornecedor="premolnitos" value="0,00" placeholder="0,00" inputmode="decimal" oninput="calcularLinha(${itemCount})"></td>
        <td class="premolnitos total-cell" data-item="${itemCount}" data-fornecedor="premolnitos">R$ 0,00</td>
        <td class="melhor total-cell melhor-unit unit-cell" data-item="${itemCount}">R$ 0,00</td>
        <td class="melhor total-cell melhor-desc" data-item="${itemCount}">-</td>
        <td class="melhor total-cell melhor-total" data-item="${itemCount}">
            <div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
                <span class="melhor-valor">R$ 0,00</span>
                <span class="melhor-fornecedor" style="font-size:7px;font-weight:normal;">-</span>
            </div>
        </td>
    `;
    
    tbody.appendChild(tr);
    
    // Carregar itens salvos no select
    carregarItensNoSelect(itemCount);
    
}

// Manipulador de eventos da tabela (Event Delegation)
function handleTableInput(event) {
    const target = event.target;
    if (target.matches('.qtd-input, .unit-input, .desc-input, .und-input')) {
        const itemNum = target.closest('tr')?.dataset.item;
        if (itemNum) {
            calcularLinha(itemNum);
        }
    }
}

// Manipulador de evento blur para formatação decimal (Event Delegation)
function handleTableBlur(event) {
    const target = event.target;
    // Formata campos numéricos ao perder foco
    if (target.matches('.qtd-input')) {
        if (target.value && target.value.trim() !== '') {
            target.value = formatarQuantidade(desformatarReais(target.value));
        }
    } else if (target.matches('.unit-input, .frete-input')) {
        if (target.value && target.value.trim() !== '') {
            target.value = formatarMoeda(desformatarReais(target.value));
        }
    } else if (target.matches('.desc-input')) {
        if (target.value && target.value.trim() !== '') {
            const num = desformatarReais(target.value);
            target.value = isNaN(num) ? '0,00' : num.toFixed(2).replace('.', ',');
        }
    }
    
    const itemNum = target.closest('tr')?.dataset.item;
    if (itemNum) calcularLinha(itemNum);
}

// Máscara de Moeda em Tempo Real (BRL)
function mascaraMoeda(input) {
    let valor = input.value.replace(/\D/g, "");
    if (valor === "") {
        input.value = "";
        return;
    }
    let num = (parseFloat(valor) / 100).toFixed(2);
    input.value = formatarMoeda(parseFloat(num));
}

// Máscara de Quantidade em Tempo Real (Decimal 2 casas)
function mascaraQuantidade(input) {
    let valor = input.value.replace(/\D/g, "");
    if (valor === "") {
        input.value = "";
        return;
    }
    let num = (parseFloat(valor) / 100).toFixed(2).replace(".", ",");
    input.value = num;
}

// Excluir Item do Select (Material)
async function excluirItemSelecionado(itemNum) {
    const select = document.querySelector(`.item-select[data-item="${itemNum}"]`);
    const valor = select.value;
    
    if (!valor) {
        mostrarNotificacao('Selecione um item material para excluir.', 'error');
        return;
    }
    
    if (confirm(`Deseja realmente excluir o material "${valor}" da lista?`)) {
        try {
            // Buscar o ID do item no Firebase
            const snapshot = await database.ref('itens').once('value');
            let itemId = null;
            
            snapshot.forEach(child => {
                if (child.val().nome === valor) {
                    itemId = child.key;
                }
            });
            
            if (itemId) {
                // Remover do Firebase
                await database.ref(`itens/${itemId}`).remove();
                
                // Recarregar todos os selects
                const selects = document.querySelectorAll('.item-select');
                for (let i = 0; i < selects.length; i++) {
                    const sel = selects[i];
                    const itemNumAtual = sel.dataset.item;
                    await carregarItensNoSelect(itemNumAtual);
                }
                
                // Remover a opção de todos os selects na tela
                document.querySelectorAll('.item-select').forEach(s => {
                    const optionToRemove = s.querySelector(`option[value="${valor}"]`);
                    if (optionToRemove) optionToRemove.remove();
                });

                mostrarNotificacao('Item excluído com sucesso da lista!', 'success');
            } else {
                mostrarNotificacao('Item não encontrado ou você já excluiu localmente.', 'error');
            }
        } catch (error) {
            console.error('Erro ao excluir item:', error);
            mostrarNotificacao('Erro: ' + error.message, 'error');
        }
    }
}

// Editar item existente
async function editarItem(itemNum) {
    const select = document.querySelector(`.item-select[data-item="${itemNum}"]`);
    const itemAtual = select.value;
    
    if (!itemAtual) {
        mostrarNotificacao('Selecione um item primeiro!', 'error');
        return;
    }
    
    const novoNomeCru = prompt('Digite o novo nome do item:', itemAtual);
    const novoNome = novoNomeCru ? novoNomeCru.trim() : '';
    if (!novoNome || novoNome === '' || novoNome === itemAtual) {
        return;
    }
    
    try {
        // Buscar o ID do item no Firebase
        const snapshot = await database.ref('itens').once('value');
        let itemId = null;
        
        snapshot.forEach(child => {
            if (child.val().nome === itemAtual) {
                itemId = child.key;
            }
        });
        
        if (itemId) {
            // Atualizar no Firebase
            await database.ref(`itens/${itemId}`).update({
                nome: novoNome,
                atualizadoEm: firebase.database.ServerValue.TIMESTAMP
            });
            
            // Atualizar o nome em todos os selects da tela
            document.querySelectorAll('.item-select').forEach(s => {
                const optionToUpdate = s.querySelector(`option[value="${itemAtual}"]`);
                if (optionToUpdate) {
                    const isSelected = s.value === itemAtual;
                    optionToUpdate.value = novoNome;
                    optionToUpdate.textContent = novoNome;
                    if (isSelected) s.value = novoNome;
                }
            });
            
            mostrarNotificacao('Item atualizado com sucesso!', 'success');
        }
    } catch (error) {
        console.error('Erro ao editar item:', error);
        mostrarNotificacao('Erro ao editar item: ' + error.message, 'error');
    }
}

// Carregar itens salvos no select
async function carregarItensNoSelect(itemNum) {
    try {
        const snapshot = await database.ref('itens').once('value');
        const select = document.querySelector(`.item-select[data-item="${itemNum}"]`);
        const valorPreviamenteSelecionado = select.value; // Salvar valor atual caso já tenha sido setado (ex: ao carregar cotação)

        if (!select) return;
        
        // Limpar e adicionar opção padrão
        select.innerHTML = '<option value="">Selecione ou digite novo</option>';
        
        if (snapshot.exists()) {
            const itens = [];
            snapshot.forEach(child => {
                itens.push(child.val().nome);
            });
            
            // Se houver um valor prévio que não está na lista do banco, adicione-o visualmente para não perder
            if (valorPreviamenteSelecionado && !itens.includes(valorPreviamenteSelecionado)) {
                 itens.push(valorPreviamenteSelecionado);
            }

            // Ordenar alfabeticamente
            itens.sort().forEach(item => {
                const option = document.createElement('option');
                option.value = item;
                option.textContent = item;
                if (item === valorPreviamenteSelecionado) {
                    option.selected = true;
                }
                select.appendChild(option);
            });
        }
        
    } catch (error) {
        console.error('Erro ao carregar itens:', error);
    }
}

// Adicionar novo item ao banco
async function adicionarNovoItem(itemNum) {
    const novoItem = prompt('Digite o nome do novo item:');
    
    if (!novoItem || novoItem.trim() === '') {
        return;
    }
    
    try {
        // Salvar no Firebase
        const itemRef = database.ref('itens').push();
        await itemRef.set({
            nome: novoItem.trim(),
            criadoEm: firebase.database.ServerValue.TIMESTAMP,
        });

        const nomeNovoItem = novoItem.trim();
        const todosOsSelectsDeItem = document.querySelectorAll('.item-select');

        // Adiciona a nova opção a todos os selects e reordena
        todosOsSelectsDeItem.forEach(select => {
            if (!select.querySelector(`option[value="${nomeNovoItem}"]`)) {
                const option = document.createElement('option');
                option.value = nomeNovoItem;
                option.textContent = nomeNovoItem;
                select.appendChild(option);

                // Reordena as opções mantendo a seleção
                const valorSelecionado = select.value;
                Array.from(select.options)
                    .sort((a, b) => a.text.localeCompare(b.text, undefined, { numeric: true }))
                    .forEach(option => select.appendChild(option));
                select.value = valorSelecionado;
            }
        });

        // Seleciona o novo item no select da linha que o criou
        document.querySelector(`.item-select[data-item="${itemNum}"]`).value = nomeNovoItem;
        mostrarNotificacao('Item adicionado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao adicionar item:', error);
        mostrarNotificacao('Erro ao adicionar item: ' + error.message, 'error');
    }
}

// Calcular valores de uma linha específica
function calcularLinha(item) {
    const qtdInput = document.querySelector(`.qtd-input[data-item="${item}"]`);
    if (!qtdInput) return; // Linha não existe
    
    // Captura segura e imune a formatação de milhares
    const qtd = desformatarReais(qtdInput.value) || 0;
    
    const valores = [];
    
    // Calcular total para cada fornecedor
    FORNECEDORES_KEYS.forEach(fornecedor => {
        const unitInput = document.querySelector(`.unit-input[data-item="${item}"][data-fornecedor="${fornecedor}"]`);
        const descInput = document.querySelector(`.desc-input[data-item="${item}"][data-fornecedor="${fornecedor}"]`);
        const totalCell = document.querySelector(`td.total-cell[data-item="${item}"][data-fornecedor="${fornecedor}"]`);
        
        if (!unitInput || !totalCell) return;
        
        const unitValue = desformatarReais(unitInput.value) || 0;
        const descValue = desformatarReais(descInput?.value) || 0;
        
        // Regra: TOTAL = QTD * (Unitário com Desconto %)
        let unitComDesconto = unitValue;
        if (descValue > 0) {
            unitComDesconto = unitValue * (1 - descValue / 100);
        }
        
        const total = qtd * unitComDesconto;
        
        totalCell.textContent = formatarMoeda(total);
        
        // Garantir exibição de % na célula de desconto (mesmo para 0)
        if (descInput) {
            const descNum = desformatarReais(descInput.value);
            descInput.dataset.formatted = descNum.toFixed(2).replace('.', ',') + '%';
        }
        
        if (unitValue > 0) {
            valores.push({
                fornecedor,
                unit: unitValue,
                desc: descValue,
                total: total
            });
        }
    });
    
    // Identificar melhor preço
    const melhorUnitCell = document.querySelector(`.melhor-unit[data-item="${item}"]`);
    const melhorDescCell = document.querySelector(`.melhor-desc[data-item="${item}"]`);
    const melhorTotalCell = document.querySelector(`.melhor-total[data-item="${item}"]`);
    
    if (!melhorUnitCell || !melhorDescCell || !melhorTotalCell) return;
    
    if (valores.length > 0) {
        const melhor = valores.reduce((min, curr) => curr.total < min.total ? curr : min);
        const nomeFornecedor = document.querySelector(`.select-fornecedor[data-fornecedor="${melhor.fornecedor}"]`)?.value || melhor.fornecedor.toUpperCase();
        
        melhorUnitCell.textContent = formatarMoeda(melhor.unit);
        melhorDescCell.textContent = melhor.desc.toFixed(2).replace('.', ',') + '%'; // v61: Sempre exibir % no Melhor Preço
        
        const melhorValorSpan = melhorTotalCell.querySelector('.melhor-valor');
        const melhorFornecedorSpan = melhorTotalCell.querySelector('.melhor-fornecedor');
        
        if (melhorValorSpan) melhorValorSpan.textContent = formatarMoeda(melhor.total);
        if (melhorFornecedorSpan) melhorFornecedorSpan.textContent = nomeFornecedor;
        
        // Destacar melhor preço nas 3 colunas (unit, desc, total) do fornecedor vencedor
        FORNECEDORES_KEYS.forEach(f => {
            const linha = document.querySelector(`tr[data-item="${item}"]`);
            if (linha) {
                const tds = linha.querySelectorAll(`td.${f}`);
                tds.forEach(td => {
                    if (f === melhor.fornecedor) {
                        td.classList.add('melhor-preco');
                    } else {
                        td.classList.remove('melhor-preco');
                    }
                });
            }
        });
    } else {
        melhorUnitCell.textContent = 'R$ 0,00';
        melhorDescCell.textContent = '0,00%'; // v61: Padrão 0% quando vazio
        
        const melhorValorSpan = melhorTotalCell.querySelector('.melhor-valor');
        const melhorFornecedorSpan = melhorTotalCell.querySelector('.melhor-fornecedor');
        
        if (melhorValorSpan) melhorValorSpan.textContent = 'R$ 0,00';
        if (melhorFornecedorSpan) melhorFornecedorSpan.textContent = '-';
        
        // Remover destaque de todas as colunas
        FORNECEDORES_KEYS.forEach(f => {
            const linha = document.querySelector(`tr[data-item="${item}"]`);
            if (linha) {
                const tds = linha.querySelectorAll(`td.${f}`);
                tds.forEach(td => td.classList.remove('melhor-preco'));
            }
        });
    }
    
    // Recalcular totais gerais
    calcularTotais();
}

function calcularSubtotais() {
    const subtotais = {};
    const todosOsFornecedores = [...FORNECEDORES_KEYS, 'melhor'];
    todosOsFornecedores.forEach(fornecedor => {
        let subtotal = 0;
        
        if (fornecedor === 'melhor') {
            document.querySelectorAll('.melhor-valor').forEach(cell => {
                const texto = cell.textContent.replace(/[^\d,-]/g, '').replace(',', '.').trim();
                subtotal += parseFloat(texto) || 0;
            });
        } else {
            document.querySelectorAll(`td.total-cell[data-fornecedor="${fornecedor}"]`).forEach(cell => {
                const texto = cell.textContent.replace(/[^\d,-]/g, '').replace(',', '.').trim();
                subtotal += parseFloat(texto) || 0;
            });
        }
        subtotais[fornecedor] = subtotal;
    });
    return subtotais;
}

function rankearFornecedores(resultFornecedores) {
    const fornecedoresAtivos = Object.entries(resultFornecedores)
        .filter(([f, dados]) => f !== 'melhor' && dados.totalFinal > 0)
        .map(([f, dados]) => ({ id: f, ...dados }));
        
        // 1. Atualizar Subtotal
    fornecedoresAtivos.sort((a, b) => a.totalFinal - b.totalFinal);
    return fornecedoresAtivos;
}

function gerarResumoExecutivo(resultFornecedores, ranking) {
    let textEconomia = '';
    let vencedorGlobal = null;
    let nomeVencedor = '';

    if (ranking.length > 0) {
        vencedorGlobal = ranking[0].id;
        const selectVencedor = document.querySelector(`.select-fornecedor[data-fornecedor="${vencedorGlobal}"]`);
        nomeVencedor = (selectVencedor && selectVencedor.options[selectVencedor.selectedIndex] && selectVencedor.options[selectVencedor.selectedIndex].text !== '(Selecionar Fornecedor)') 
            ? selectVencedor.options[selectVencedor.selectedIndex].text.toUpperCase() 
            : vencedorGlobal.toUpperCase();

        if (ranking.length >= 2) {
            const maisBarato = ranking[0].totalFinal;
            const maisCaro = ranking[ranking.length - 1].totalFinal;
            const economiaReal = maisCaro - maisBarato;
            const economiaPerc = (economiaReal / maisCaro) * 100;

            if (economiaReal > 0) {
                textEconomia = `<div style="margin-top: 10px; padding: 6px; background: #f0fdf4; border: 1px solid #000; border-radius: 4px; color: #000;">
                    💎 <strong>Economia gerada:</strong> ${formatarMoeda(economiaReal)} (${economiaPerc.toFixed(1)}%) em relação à proposta mais cara.
                </div>`;
            }
        }
    }

    // Adicionar Medalhas no DOM
    const medalhas = ['🥇 ', '🥈 ', '🥉 ', '🏅 '];
    ranking.forEach((fav, index) => {
        fav.medalha = medalhas[index] || '';
        const totalEl = document.getElementById(`total${capitalize(fav.id)}`);
        if (totalEl) {
            totalEl.innerHTML = `<span style="font-size:14px">${fav.medalha}</span> ${formatarMoeda(fav.totalFinal)}`;
        }
    });

    // Atualizar subtotais e totais na interface
    Object.entries(resultFornecedores).forEach(([fornecedor, dados]) => {
        const subtotalElement = document.getElementById(`subtotal${capitalize(fornecedor)}`);
        if (subtotalElement) subtotalElement.textContent = formatarMoeda(dados.subtotal);

        const totalElement = document.getElementById(`total${capitalize(fornecedor)}`);
        if (totalElement) {
            // Preserva medalhas se existirem
            let spanMedalha = '';
            const existingSpan = totalElement.querySelector('span');
            if (existingSpan) spanMedalha = existingSpan.outerHTML + ' ';
            totalElement.innerHTML = spanMedalha + formatarMoeda(dados.totalFinal);
        }

        if (fornecedor === 'melhor') {
            const freteMelhorDisplay = document.getElementById('freteMelhorDisplay');
            if (freteMelhorDisplay) freteMelhorDisplay.textContent = formatarMoeda(dados.frete);
        }
    });

    // Atualizar Resumo Executivo
    const resumoDiv = document.getElementById('textoResumoVencedor');
    if (resumoDiv) {
        if (vencedorGlobal) {
            const fDados = resultFornecedores[vencedorGlobal];
            resumoDiv.innerHTML = `
                <div style="width: 100%; color: #000;">
                    <strong style="color: #000;">Fornecedor Recomendado:</strong> <span style="color: #000; font-size: 15px; font-weight: bold;">${nomeVencedor}</span><br>
                    <strong style="color: #000;">Custo Total:</strong> ${formatarMoeda(fDados.totalFinal)}
                    ${textEconomia}
                </div>
            `;
        } else {
            resumoDiv.innerHTML = '<em>Nenhuma cotação finalizada / Valores zerados.</em>';
        }
    }
}

// Calcular totais por fornecedor e Fretes
function calcularTotais() {
    const subtotais = calcularSubtotais();
    const resultFornecedores = {};

    // --- CÁLCULO MESTRE UNIFICADO (v61) ---
    // Descobrir Fornecedores Vencedores para agregar o Frete do "Melhor Preço"
    const fornecedoresGanhadores = new Set();
    document.querySelectorAll('#tableBody tr:not(.details-row)').forEach(linha => {
        linha.querySelectorAll('.total-cell.melhor-preco').forEach(td => {
            const f = td.dataset.fornecedor;
            if (f) fornecedoresGanhadores.add(f);
        });
    });

    [...FORNECEDORES_KEYS, 'melhor'].forEach(fornecedor => {
        const subtotal = subtotais[fornecedor] || 0;
        
        // v61: Garantia matemática absoluta - O Total é a soma rigorosa de cada item
        resultFornecedores[fornecedor] = {
            subtotal: subtotal,
            frete: 0, 
            totalFinal: subtotal 
        };
    });

    const ranking = rankearFornecedores(resultFornecedores);

    // Sincronização final com a Interface e Resumo
    Object.entries(resultFornecedores).forEach(([fornecedor, dados]) => {
        const subtotalElement = document.getElementById(`subtotal${capitalize(fornecedor)}`);
        if (subtotalElement) subtotalElement.textContent = formatarMoeda(dados.subtotal);

        const totalElement = document.getElementById(`total${capitalize(fornecedor)}`);
        if (totalElement) {
            // Preserva medalhas do ranking se existirem
            let spanMedalha = '';
            const winnerData = ranking.find(r => r.id === fornecedor);
            if (winnerData && winnerData.medalha) spanMedalha = `<span style="font-size:14px">${winnerData.medalha}</span> `;
            
            totalElement.innerHTML = spanMedalha + formatarMoeda(dados.totalFinal);
        }
    });

    gerarResumoExecutivo(resultFornecedores, ranking);

    // Destacar com fundo verde a célula vencedora no Total Líquido Final
    document.querySelectorAll('.total-final-row td.melhor-preco').forEach(td => td.classList.remove('melhor-preco'));
    if (ranking.length > 0) {
        const valVencedor = ranking[0].id;
        const celulaFinalVencedora = document.getElementById(`total${capitalize(valVencedor)}`);
        if (celulaFinalVencedora) celulaFinalVencedora.classList.add('melhor-preco');
    }
}

// Formatar valor como moeda brasileira (Regra Exigida: Intl.NumberFormat)
function formatarMoeda(valor) {
    const num = parseFloat(valor);
    if (isNaN(num)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
}

// Capitalizar primeira letra
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Calcular todos os itens
function calcularTudo() {
    // 1. Recalcular todas as linhas existentes do DOM
    const linhas = document.querySelectorAll('#tableBody tr');
    linhas.forEach(linha => {
        const itemNum = linha.dataset.item;
        if (itemNum) {
            calcularLinha(parseInt(itemNum));
        }
    });
    
    // 2. Invocação direta da Macro Mestre de Matemática e Enforcer de Totais
    calcularTotais();
    
    mostrarNotificacao('Cálculos atualizados de ponta a ponta!', 'success');
}

// Formatar quantidade com 2 casas decimais (Regra 1: 1,00)
function formatarQuantidade(valor) {
    const num = parseFloat(valor);
    if (isNaN(num)) return '0,00';
    return num.toLocaleString('pt-BR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
}

// Formatar valor em Reais
function formatarReais(valor) {
    if (!valor && valor !== 0) return 'R$ 0,00';
    const num = parseFloat(valor);
    if (isNaN(num)) return 'R$ 0,00';
    return formatarMoeda(num);
}

// =================================================================
// FUNÇÕES DE GERAÇÃO DE PDF
// =================================================================

// Prepara o visual da página para a impressão, trocando inputs por texto.
function prepararParaImpressao() {
    // A conversão dinâmica JS foi substituída por estilização nativa no CSS de impressão (style.css) 
    // para evitar conflitos de renderização (Desaparecimento de Item/Qtd/Und) no navegador.
}

// Restaura a tela para o modo de edição após a impressão.
function restaurarAposImpressao() {
    // Sem necessidade de restaurar, pois o DOM não é mais alterado por JS no beforeprint.
}

// Função principal chamada pelo botão "Gerar PDF".
async function gerarPDF() {
    try {
        // Garantir que os cálculos estão atualizados
        if (typeof calcularTudo === 'function') {
            calcularTudo();
        }

        // Obter número da cotação se ainda for 0 ou vazio
        const numInput = document.getElementById('numCotacao');
        if (numInput && (!numInput.value || numInput.value === '0')) {
            if (typeof obterProximoNumero === 'function') {
                try {
                    numInput.value = await obterProximoNumero();
                } catch (numErr) {
                    console.error('Nao foi possivel obter prox numero. Omitindo.', numErr);
                }
            }
        }

        // Gera o PDF (vai disparar os eventos beforeprint/afterprint que cuidam do visual)
        window.print();

    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        mostrarNotificacao('Erro: Falha estrutural ao gerar PDF, forçando impressão...', 'error');
        window.print();
    }
}

// Evento beforeprint UNIFICADO - removido o listener duplicado que existia no fundo do arquivo.
// O listener definitivo está logo abaixo, na seção de Tratamento Definitivo para PDF.

// Abrir modal de cotações
async function abrirModalCotacoes() {
    document.getElementById('modalCotacoes').style.display = 'block';
    await carregarListaCotacoes();
}

// Fechar modal de cotações
function fecharModalCotacoes() {
    document.getElementById('modalCotacoes').style.display = 'none';
}

// Carregar lista de cotações
async function carregarListaCotacoes(filtros = {}) {
    const lista = document.getElementById('listaCotacoes');
    lista.innerHTML = '<p>Carregando...</p>';
    
    const cotacoes = await listarCotacoes(filtros);
    
    if (cotacoes.length === 0) {
        lista.innerHTML = '<p>Nenhuma cotação encontrada.</p>';
        return;
    }
    
    lista.innerHTML = '';
    cotacoes.forEach(cotacao => {
        const item = document.createElement('div');
        item.className = 'cotacao-item';
        item.innerHTML = `
            <div class="cotacao-info">
                <strong>Cotação #${cotacao.numero}</strong>
                <span class="badge badge-${cotacao.status}">${cotacao.status}</span>
                <p>Data: ${cotacao.data} | Centro: ${cotacao.centroCusto}</p>
                <p>Itens: ${cotacao.itens.length} | Total Melhor: ${cotacao.totais.melhor}</p>
            </div>
            <div class="cotacao-acoes">
                <button onclick="carregarCotacao('${cotacao.id}')">Carregar</button>
                <button onclick="excluirCotacaoEAtualizar('${cotacao.id}')">Excluir</button>
            </div>
        `;
        lista.appendChild(item);
    });
}

// Excluir cotação e atualizar lista
async function excluirCotacaoEAtualizar(cotacaoId) {
    const sucesso = await excluirCotacao(cotacaoId);
    if (sucesso) {
        await carregarListaCotacoes();
    }
}

// Aplicar filtros
function aplicarFiltros() {
    const filtros = {
        status: document.getElementById('filtroStatus').value,
        centroCusto: document.getElementById('filtroCentroCusto').value
    };
    carregarListaCotacoes(filtros);
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('modalCotacoes');
    if (event.target === modal) {
        fecharModalCotacoes();
    }
}

// Zerar contador de cotação
async function zerarContadorCotacao() {
    if (!confirm('Tem certeza que deseja zerar o contador de cotação?\n\nEsta ação não pode ser desfeita!\nO próximo número será 1.')) {
        return;
    }

    try {
        const contadorRef = database.ref('configuracoes/ultimoNumero');
        await contadorRef.set(0);
        
        // Atualizar o campo na tela
        document.getElementById('numCotacao').value = '0';
        
        mostrarNotificacao('Contador zerado com sucesso! O próximo número será 1.', 'success');
    } catch (error) {
        console.error('Erro ao zerar contador:', error);
        mostrarNotificacao('Erro ao zerar contador: ' + error.message, 'error');
    }
}

// Limpar cotação
function limparCotacao() {
    if (!confirm('Tem certeza que deseja limpar todas as informações da cotação?')) {
        return;
    }
    
    // Para garantir que a página volte exatamente ao estado original de abertura
    // (completamente zerada e no padrão) recarregamos a aba atual.
    window.location.reload();
}

// (formatarQuantidade e formatarReais já definidas acima - NÃO duplicar)

// --- Funções Auxiliares de Máscara de Frete ---
function desformatarReais(valorCustom) {
    if (!valorCustom) return 0;
    let limpo = valorCustom.toString().replace(/[^\d.,-]/g, '');

    // Caso possua ambos (ex: 1.500,50) ou só vírgula (ex: 15,50)
    if (limpo.indexOf('.') > -1 && limpo.indexOf(',') > -1) {
        limpo = limpo.replace(/\./g, '');
        limpo = limpo.replace(',', '.');
    } else if (limpo.indexOf(',') > -1) {
        limpo = limpo.replace(',', '.');
    } else if (limpo.indexOf('.') > -1) {
        // Possui apenas ponto num padrão que simula Milhar do Brasil (Ex: '5.000' querendo dizer 5000)
        // Ignorar decimal caso tenha formatado milhares no preenchimento seco.
        if (/^\d{1,3}(\.\d{3})+$/.test(limpo)) {
            limpo = limpo.replace(/\./g, '');
        }
    }
    
    return parseFloat(limpo) || 0;
}

function handleFreteFocus(input) {
    let num = desformatarReais(input.value);
    if (num === 0) {
        input.value = '';
    } else {
        input.value = num.toFixed(2).replace('.', ',');
    }
}

function handleFreteBlur(input) {
    let num = desformatarReais(input.value);
    input.value = formatarMoeda(num);
    calcularTotais();
}

// === TRATAMENTO PARA PDF: formata valores dos inputs antes de imprimir ===
let _valoresOriginais = [];

window.addEventListener('beforeprint', () => {
    // 1. Forçar blur para garantir que o último input seja processado
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
    }

    // 2. Recalcular tudo para o PDF refletir a tela
    calcularTudo();

    // 3. Salvar valores originais e aplicar formatação de impressão
    _valoresOriginais = [];

    // Formatar QTD (Regra 2: 1,00)
    document.querySelectorAll('.qtd-input').forEach(input => {
        _valoresOriginais.push({ el: input, val: input.value });
        const num = desformatarReais(input.value);
        input.value = num > 0 ? formatarQuantidade(num) : '';
    });

    // Formatar UNIT (Regra 2: R$ X,XX)
    document.querySelectorAll('.unit-input').forEach(input => {
        _valoresOriginais.push({ el: input, val: input.value });
        const num = desformatarReais(input.value);
        input.value = num > 0 ? formatarMoeda(num) : '';
    });

    // Formatar DESC (v61: Obrigatoriamente X,XX%)
    document.querySelectorAll('.desc-input').forEach(input => {
        _valoresOriginais.push({ el: input, val: input.value });
        const num = desformatarReais(input.value);
        input.value = num.toFixed(2).replace('.', ',') + '%';
    });

    // Formatar FRETE (R$ X,XX)
    document.querySelectorAll('.frete-input').forEach(input => {
        _valoresOriginais.push({ el: input, val: input.value });
        const num = desformatarReais(input.value);
        input.value = formatarMoeda(num);
    });
});

window.addEventListener('afterprint', () => {
    // Restaurar valores originais para a tela de edição
    _valoresOriginais.forEach(item => {
        item.el.value = item.val;
    });
    _valoresOriginais = [];
});
