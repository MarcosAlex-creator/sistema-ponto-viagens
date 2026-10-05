// ========== UTILITÁRIOS ==========
function formatarData(dataStr) {
    const d = new Date(dataStr);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}
function formatarHora(dataStr) {
    const d = new Date(dataStr);
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
}
function dataHoraParaISO(dataInput, horaInput) {
    const [ano, mes, dia] = dataInput.split('-');
    const [h, m, s='00'] = horaInput.split(':');
    return new Date(ano, mes-1, dia, h, m, s).toISOString();
}
function gerarCSV(dados, colunas) {
    const csv = '\uFEFF' + [colunas.join(';'), ...dados.map(l => 
        colunas.map(c => `"${(l[c]||'').toString().replace(/"/g,'""')}"`).join(';')
    )].join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `registros_${new Date().toLocaleDateString('pt-BR').replaceAll('/','-')}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
}
function confirmar(msg) { return window.confirm(msg); }

// ========== ABA ==========
document.querySelectorAll('.tab-btn').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    document.getElementById(b.dataset.tab).classList.add('active');
}));

// ========== TEMA CLARO/ESCURO ==========
const btnTema = document.getElementById('btn-tema');
const TEMA_STORAGE = 'tema_preferido';
function aplicarTema(tipo) {
    if (tipo === 'escuro') {
        document.documentElement.setAttribute('data-tema','escuro');
        btnTema.textContent = '☀️ Claro';
    } else {
        document.documentElement.removeAttribute('data-tema');
        btnTema.textContent = '🌙 Escuro';
    }
    localStorage.setItem(TEMA_STORAGE, tipo);
}
btnTema.addEventListener('click', () => {
    const atual = document.documentElement.getAttribute('data-tema');
    aplicarTema(atual === 'escuro' ? 'claro' : 'escuro');
});

// ========== MÓDULO PONTO ==========
const STORAGE_PONTO = 'registros_ponto';
let tipoPonto = 'Entrada';
const getPonto = () => JSON.parse(localStorage.getItem(STORAGE_PONTO) || '[]');
const setPonto = l => localStorage.setItem(STORAGE_PONTO, JSON.stringify(l)) || renderPonto();

document.getElementById('btn-registrar-ponto').addEventListener('click', () => {
    const lista = getPonto();
    lista.unshift({
        id: Date.now(),
        dataHora: new Date().toISOString(),
        tipo: tipoPonto,
        observacao: document.getElementById('obs-ponto').value.trim()
    });
    setPonto(lista);
    document.getElementById('obs-ponto').value = '';
    tipoPonto = tipoPonto === 'Entrada' ? 'Saída' : 'Entrada';
    document.getElementById('btn-alternar-tipo').textContent = `🔄 Tipo: ${tipoPonto}`;
});
document.getElementById('btn-alternar-tipo').addEventListener('click', () => {
    tipoPonto = tipoPonto === 'Entrada' ? 'Saída' : 'Entrada';
    document.getElementById('btn-alternar-tipo').textContent = `🔄 Tipo: ${tipoPonto}`;
});
document.getElementById('btn-exportar-ponto').addEventListener('click', () => gerarCSV(
    getPonto().map(r => ({Data:formatarData(r.dataHora),Hora:formatarHora(r.dataHora),Tipo:r.tipo,Observação:r.observacao||''})),
    ['Data','Hora','Tipo','Observação']
));
document.getElementById('btn-limpar-ponto').addEventListener('click', () => {
    if (confirmar('Excluir TODOS os registros de ponto?')) setPonto([]);
});
function renderPonto() {
    const lista = getPonto();
    document.getElementById('lista-ponto').innerHTML = lista.map((r,i) => `
        <tr>
            <td>${formatarData(r.dataHora)}</td>
            <td>${formatarHora(r.dataHora)}</td>
            <td>${r.tipo}</td>
            <td>${r.observacao || '-'}</td>
            <td class="acoes-linha">
                <button class="btn-pequeno primary editar" data-base="ponto" data-idx="${i}">✏️</button>
                <button class="btn-pequeno danger excluir" data-base="ponto" data-idx="${i}">🗑️</button>
            </td>
        </tr>`).join('');
    document.getElementById('contador-ponto').textContent = lista.length;
}

// ========== MÓDULO VIAGENS ==========
const STORAGE_VIAGENS = 'registros_viagens';
const TIPOS_VIAGENS = {'inicio-saida':'Início Saída','final-saida':'Final Saída','inicio-volta':'Início Volta','final-volta':'Final Volta'};
const getViagens = () => JSON.parse(localStorage.getItem(STORAGE_VIAGENS) || '[]');
const setViagens = l => localStorage.setItem(STORAGE_VIAGENS, JSON.stringify(l)) || renderViagens();

document.querySelectorAll('[data-viagem]').forEach(btn => btn.addEventListener('click', () => {
    const lista = getViagens();
    lista.unshift({
        id: Date.now(),
        tipo: TIPOS_VIAGENS[btn.dataset.viagem],
        dataHora: new Date().toISOString(),
        observacao: document.getElementById('obs-viagem').value.trim()
    });
    setViagens(lista);
    document.getElementById('obs-viagem').value = '';
    alert('✅ Registrado!');
}));
document.getElementById('btn-exportar-viagens').addEventListener('click', () => gerarCSV(
    getViagens().map(r => ({Tipo:r.tipo,Data:formatarData(r.dataHora),Hora:formatarHora(r.dataHora),Observação:r.observacao||''})),
    ['Tipo','Data','Hora','Observação']
));
document.getElementById('btn-limpar-viagens').addEventListener('click', () => {
    if (confirmar('Excluir TODOS os registros de viagens?')) setViagens([]);
});
function renderViagens() {
    const lista = getViagens();
    document.getElementById('lista-viagens').innerHTML = lista.map((r,i) => `
        <tr>
            <td><strong>${r.tipo}</strong></td>
            <td>${formatarData(r.dataHora)}</td>
            <td>${formatarHora(r.dataHora)}</td>
            <td>${r.observacao || '-'}</td>
            <td class="acoes-linha">
                <button class="btn-pequeno primary editar" data-base="viagens" data-idx="${i}">✏️</button>
                <button class="btn-pequeno danger excluir" data-base="viagens" data-idx="${i}">🗑️</button>
            </td>
        </tr>`).join('');
    document.getElementById('contador-viagens').textContent = lista.length;
}

// ========== EDIÇÃO E EXCLUSÃO ==========
const modal = document.getElementById('modal-editar');
let listaAtual = [];

document.addEventListener('click', e => {
    if (e.target.classList.contains('excluir')) {
        const base = e.target.dataset.base, idx = +e.target.dataset.idx;
        if (!confirmar('Excluir este registro?')) return;
        listaAtual = base === 'ponto' ? getPonto() : getViagens();
        listaAtual.splice(idx,1);
        base === 'ponto' ? setPonto(listaAtual) : setViagens(listaAtual);
    }
    if (e.target.classList.contains('editar')) abrirModal(e.target.dataset.base, +e.target.dataset.idx);
});

function abrirModal(base, idx) {
    listaAtual = base === 'ponto' ? getPonto() : getViagens();
    const reg = listaAtual[idx];
    const d = new Date(reg.dataHora);
    document.getElementById('modal-tipo-base').value = base;
    document.getElementById('modal-indice').value = idx;
    document.getElementById('modal-data').value = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    document.getElementById('modal-hora').value = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
    document.getElementById('modal-obs').value = reg.observacao || '';
    
    const sel = document.getElementById('modal-tipo');
    sel.innerHTML = '';
    if (base === 'ponto') {
        document.getElementById('modal-titulo').textContent = 'Editar Ponto';
        ['Entrada','Saída'].forEach(t => {
            const o = Object.assign(document.createElement('option'),{value:t,textContent:t,selected:reg.tipo===t});
            sel.appendChild(o);
        });
    } else {
        document.getElementById('modal-titulo').textContent = 'Editar Viagem';
        Object.values(TIPOS_VIAGENS).forEach(t => {
            const o = Object.assign(document.createElement('option'),{value:t,textContent:t,selected:reg.tipo===t});
            sel.appendChild(o);
        });
    }
    modal.classList.add('aberto');
}
document.querySelector('.fechar').onclick = document.getElementById('modal-cancelar').onclick = () => modal.classList.remove('aberto');
document.getElementById('modal-salvar').addEventListener('click', () => {
    const base = document.getElementById('modal-tipo-base').value;
    const idx = +document.getElementById('modal-indice').value;
    listaAtual[idx] = {
        ...listaAtual[idx],
        dataHora: dataHoraParaISO(document.getElementById('modal-data').value, document.getElementById('modal-hora').value),
        tipo: document.getElementById('modal-tipo').value,
        observacao: document.getElementById('modal-obs').value
    };
    base === 'ponto' ? setPonto(listaAtual) : setViagens(listaAtual);
    modal.classList.remove('aberto');
});

renderPonto();
renderViagens();
