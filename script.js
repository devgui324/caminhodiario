let pontos = parseInt(localStorage.getItem('pontos')) || 0;
let versaoAtual = localStorage.getItem('versao') || 'nvi';
let bibliaCache = null;

// --- COMPONENTES DA IA PARA GERAR DESAFIOS ---
const iaAcoes = ["Ore por", "Mande uma mensagem para", "Ajude hoje", "Demonstre amor a", "Interceda por", "Abençoe", "Compartilhe uma palavra com", "Encoraje"];
const iaAlvos = ["um vizinho", "um familiar", "alguém do trabalho", "um amigo esquecido", "uma autoridade", "alguém que te feriu", "alguém que você viu na rua"];
const iaTemas = ["com paciência", "com gratidão", "falando sobre a paz", "com humildade", "com alegria", "demonstrando generosidade"];

// Versículos base para a IA (Livro, Capítulo, Versículo)
const versiculosIA = [
    { l: 18, c: 22, v: 0 }, { l: 39, c: 4, v: 43 }, { l: 44, c: 11, v: 1 }, 
    { l: 19, c: 2, v: 4 }, { l: 58, c: 0, v: 4 }, { l: 47, c: 4, v: 21 },
    { l: 18, c: 33, v: 17 }, { l: 49, c: 3, v: 12 }, { l: 50, c: 2, v: 12 },
    { l: 19, c: 14, v: 0 }, { l: 53, c: 1, v: 0 }, { l: 39, c: 5, v: 2 }
];

window.onload = async () => {
    document.getElementById('select-versao').value = versaoAtual;
    await carregarBiblia();
    popularLivros();
    atualizarTudo();
    atualizarPlacar();
};

// --- CARREGAMENTO DE DADOS ---
async function carregarBiblia() {
    try {
        const res = await fetch(`${versaoAtual}.json`);
        bibliaCache = await res.json();
    } catch (e) {
        alert("Erro ao carregar versão: " + versaoAtual + ". Verifique se o arquivo existe.");
    }
}

// 1. Variáveis globais para "travar" o sorteio
let desafioSorteado = null;
let referenciaSorteada = null;

// 2. Modifique sua função de carregar a página para sortear apenas UMA vez
window.onload = async () => {
    document.getElementById('select-versao').value = versaoAtual;
    await carregarBiblia();
    
    // Realiza o sorteio único ao abrir o app
    const acao = iaAcoes[Math.floor(Math.random() * iaAcoes.length)];
    const alvo = iaAlvos[Math.floor(Math.random() * iaAlvos.length)];
    const tema = iaTemas[Math.floor(Math.random() * iaTemas.length)];
    
    desafioSorteado = `${acao} ${alvo} ${tema}.`;
    referenciaSorteada = versiculosIA[Math.floor(Math.random() * versiculosIA.length)];
    
    popularLivros();
    atualizarTudo(); // Exibe o que foi sorteado acima
    atualizarPlacar();
    carregarTema();
};

// 3. Função de trocar versão ajustada (não sorteia mais)
async function trocarVersao() {
    versaoAtual = document.getElementById('select-versao').value;
    localStorage.setItem('versao', versaoAtual);
    
    document.getElementById('texto-biblico').innerText = "Traduzindo...";
    
    await carregarBiblia();
    // Removido popularLivros() daqui para não resetar o seletor de leitura técnica
    atualizarTudo(); 
}

// 4. Função de exibição ajustada (apenas mostra os dados salvos)
function atualizarTudo() {
    if (!bibliaCache || !referenciaSorteada) return;

    // Usa o desafio que foi guardado no window.onload
    document.getElementById('titulo-desafio').innerText = "Desafio do dia";
    document.getElementById('desc-desafio').innerText = desafioSorteado;
    
    // Puxa o texto da tradução nova usando a mesma referência sorteada antes
    const livro = bibliaCache[referenciaSorteada.l];
    const texto = livro.chapters[referenciaSorteada.c][referenciaSorteada.v];
    
    document.getElementById('texto-biblico').innerText = `"${texto}"`;
    document.getElementById('referencia-biblica').innerText = `${livro.abbrev.toUpperCase()} ${referenciaSorteada.c + 1}:${referenciaSorteada.v + 1}`;
}

// --- HISTÓRICO E APRENDIZADO ---
function postarAprendizado() {
    const textoInsight = document.getElementById('comentario-texto').value;
    const versiculoEstudado = document.getElementById('texto-biblico').innerText;
    const referenciaEstudada = document.getElementById('referencia-biblica').innerText;

    if (!textoInsight.trim()) {
        alert("Por favor, escreva sua reflexão antes de salvar.");
        return;
    }

    const novoAprendizado = {
        insight: textoInsight,
        versiculo: versiculoEstudado,
        ref: `${referenciaEstudada} (${versaoAtual.toUpperCase()})`,
        data: new Date().toLocaleDateString()
    };

    let histA = JSON.parse(localStorage.getItem('histAprendizados')) || [];
    histA.unshift(novoAprendizado);
    localStorage.setItem('histAprendizados', JSON.stringify(histA));

    document.getElementById('comentario-texto').value = "";
    ganharPontos(5);
    carregarHistorico(); 
    alert("Aprendizado vinculado ao versículo com sucesso!");
}

function concluirTarefa() {
    const titulo = document.getElementById('desc-desafio').innerText; // Usamos a descrição como chave única
    const data = new Date().toLocaleDateString();
    
    let hist = JSON.parse(localStorage.getItem('histDesafios')) || [];
    if(!hist.find(h => h.titulo === titulo && h.data === data)) {
        hist.unshift({ titulo, data });
        localStorage.setItem('histDesafios', JSON.stringify(hist));
        ganharPontos(10);
        alert("Desafio concluído! +10 pontos.");
        carregarHistorico();
    } else {
        alert("Você já concluiu este desafio específico hoje!");
    }
}

function carregarHistorico() {
    const histD = JSON.parse(localStorage.getItem('histDesafios')) || [];
    const histA = JSON.parse(localStorage.getItem('histAprendizados')) || [];
    
    document.getElementById('hist-desafios').innerHTML = histD.map(h => 
        `<div class="item-hist"><strong>${h.data}:</strong> ${h.titulo}</div>`
    ).join('') || "Nenhum desafio concluído.";

    document.getElementById('hist-aprendizados').innerHTML = histA.map(a => `
        <div class="item-hist">
            <small>${a.data} - ${a.ref}</small>
            <blockquote style="font-style: italic; color: #555; border-left: 2px solid #d4af37; padding-left: 10px; margin: 5px 0;">
                ${a.versiculo}
            </blockquote>
            <p style="margin-top: 10px; font-weight: bold;">📝  ${a.insight}</p>
        </div>
    `).join('') || "Nenhum aprendizado salvo.";
}

// --- NAVEGAÇÃO ---
function mostrarAba(aba) {
    // 1. Esconde TODAS as seções primeiro
    const secoes = document.querySelectorAll('.content-section');
    secoes.forEach(s => {
        s.style.display = 'none';
    });

    // 2. Mostra apenas a seção que o usuário clicou
    const abaAlvo = document.getElementById(`aba-${aba}`);
    if (abaAlvo) {
        abaAlvo.style.display = 'block';
    }

    // 3. Gerencia o visual dos botões (cor de destaque)
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    // O 'event' identifica qual botão foi clicado para colocar a cor nele
    if (event && event.target) {
        event.target.classList.add('active');
    }

    // 4. SE a aba for histórico, força a atualização dos dados na tela
    if (aba === 'historico') {
        carregarHistorico();
    }
}

// --- BÍBLIA ---
function popularLivros() {
    const select = document.getElementById('biblia-livro');
    select.innerHTML = "";
    bibliaCache.forEach((livro, idx) => {
        let opt = document.createElement('option');
        opt.value = idx;
        opt.innerText = livro.name;
        select.appendChild(opt);
    });
}

function lerCapitulo() {
    const livroIdx = document.getElementById('biblia-livro').value;
    const capNum = parseInt(document.getElementById('biblia-cap').value) - 1;
    const container = document.getElementById('leitura-biblica');
    
    const capitulos = bibliaCache[livroIdx].chapters;
    if(capitulos[capNum]) {
        let html = `<h4>${bibliaCache[livroIdx].name} - Cap. ${capNum + 1}</h4>`;
        capitulos[capNum].forEach((verso, i) => {
            html += `<p><sup>${i+1}</sup> ${verso}</p>`;
        });
        container.innerHTML = html;
    } else {
        container.innerHTML = "Capítulo não encontrado.";
    }
}

// --- PONTOS ---
function ganharPontos(qtd) {
    pontos += qtd;
    localStorage.setItem('pontos', pontos);
    atualizarPlacar();
}

function atualizarPlacar() {
    document.getElementById('pontos').innerText = pontos;
    const status = document.getElementById('status-fiel');
    if(pontos >= 500) status.innerText = "🏆 Ancião da Fé";
    else if(pontos >= 200) status.innerText = "🛡️ Soldado de Cristo";
    else if(pontos >= 50) status.innerText = "🌱 Servo Fiel";
    else status.innerText = "🌱 Servo Esforçado";
}
// Função para resetar o input de capítulo quando mudar o livro
function resetarCapitulo() {
    document.getElementById('biblia-cap').value = 1;
    lerCapitulo();
}

// Função para navegar entre os capítulos
function mudarCapitulo(direcao) {
    const inputCap = document.getElementById('biblia-cap');
    const livroIdx = document.getElementById('biblia-livro').value;
    
    if (!bibliaCache) return;

    let novoCap = parseInt(inputCap.value) + direcao;
    const totalCapitulos = bibliaCache[livroIdx].chapters.length;

    // Verifica se o novo capítulo é válido
    if (novoCap >= 1 && novoCap <= totalCapitulos) {
        inputCap.value = novoCap;
        lerCapitulo();
        // Rola a tela para o topo para facilitar a leitura
        document.getElementById('leitura-biblica').scrollTop = 0;
    } else {
        if (novoCap < 1) alert("Você já está no primeiro capítulo.");
        if (novoCap > totalCapitulos) alert("Este é o último capítulo deste livro.");
    }
}
// --- LÓGICA DO MURAL DE ORAÇÃO ---

// Carrega as orações assim que a página abre
window.addEventListener('load', () => {
    exibirOracoes();
});

function adicionarPedido() {
    const input = document.getElementById('input-oracao');
    const texto = input.value.trim();

    if (texto === "") {
        alert("Por favor, digite um pedido.");
        return;
    }

    let oracoes = JSON.parse(localStorage.getItem('minhasOracoes')) || [];
    
    oracoes.unshift({
        texto: texto,
        data: new Date().toLocaleDateString(),
        concluida: false // Nova propriedade para controlar o estado
    });

    localStorage.setItem('minhasOracoes', JSON.stringify(oracoes));
    input.value = "";
    exibirOracoes();
}

function exibirOracoes() {
    const listaUl = document.getElementById('lista-oracoes');
    const oracoes = JSON.parse(localStorage.getItem('minhasOracoes')) || [];

    listaUl.innerHTML = oracoes.map((o, index) => `
        <li class="item-oracao ${o.concluida ? 'concluida' : ''}">
            <div class="texto-oracao">
                <span>${o.texto}</span>
                <small>${o.data}</small>
            </div>
            
            <div class="acoes-oracao">
                <button onclick="alternarOracao(${index})" class="btn-check" title="Alcançada">
                    ${o.concluida ? '✅' : '✔️'}
                </button>
                <button onclick="removerOracao(${index})" class="btn-remover" title="Remover">
                    ✕
                </button>
            </div>
        </li>
    `).join('') || "<p style='color: #999; font-size: 0.8rem; text-align: center;'>Nenhum pedido registrado.</p>";
}

// Função para marcar como alcançada/concluída
function alternarOracao(index) {
    let oracoes = JSON.parse(localStorage.getItem('minhasOracoes')) || [];
    oracoes[index].concluida = !oracoes[index].concluida; // Inverte o estado
    localStorage.setItem('minhasOracoes', JSON.stringify(oracoes));
    exibirOracoes();
}

function removerOracao(index) {
    let oracoes = JSON.parse(localStorage.getItem('minhasOracoes')) || [];
    oracoes.splice(index, 1);
    localStorage.setItem('minhasOracoes', JSON.stringify(oracoes));
    exibirOracoes();
}
function atualizarPlacar() {
    document.getElementById('pontos').innerText = pontos;
    const status = document.getElementById('status-fiel');
    const labelNivel = document.getElementById('label-nivel');
    const fill = document.getElementById('progress-fill');
    const percentTxt = document.getElementById('percentual-progresso');
    const faltaTxt = document.getElementById('falta-quanto');

    let nivel = "";
    let proxMeta = 0;
    let basePontos = 0;

    if (pontos >= 500) {
        nivel = "🏆 Ancião da Fé";
        proxMeta = 1000;
        basePontos = 500;
    } else if (pontos >= 200) {
        nivel = "🛡️ Soldado de Cristo";
        proxMeta = 500;
        basePontos = 200;
    } else if (pontos >= 50) {
        nivel = "🌱 Servo Fiel";
        proxMeta = 200;
        basePontos = 50;
    } else {
        nivel = "🌱 Servo Esforçado";
        proxMeta = 50;
        basePontos = 0;
    }

    // Atualiza textos
    status.innerText = nivel;
    if(labelNivel) labelNivel.innerText = "Nível: " + nivel;

    // Cálculo da Barra (Regra de 3 para o progresso entre os níveis)
    let progresso = ((pontos - basePontos) / (proxMeta - basePontos)) * 100;
    if (progresso > 100) progresso = 100;
    
    if(fill) fill.style.width = progresso + "%";
    if(percentTxt) percentTxt.innerText = Math.floor(progresso) + "%";
    if(faltaTxt) faltaTxt.innerText = `Faltam ${proxMeta - pontos} pts para o próximo nível`;
}
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // Aqui você poderia mostrar um botão "Baixar App" na sua tela
});

// Função para chamar quando clicarem no seu botão de instalar
function instalarApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
    }
}
window.addEventListener('load', () => {
    const loader = document.getElementById('loading-screen');
    
    // Pequeno atraso para garantir que tudo renderizou bem
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500); // Tempo da transição de opacidade
    }, 1500); // 1.5 segundos de splash screen
});
// --- LÓGICA DE BACKUP ---

// 1. Transforma tudo o que está no LocalStorage em um arquivo .json
function exportarBackup() {
    const dados = {
        aprendizados: JSON.parse(localStorage.getItem('aprendizados')) || [],
        oracoes: JSON.parse(localStorage.getItem('minhasOracoes')) || [],
        pontos: localStorage.getItem('pontos') || "0"
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dados));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "backup_devocional.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

// 2. Lê o arquivo que o usuário enviar e salva no LocalStorage
function importarBackup(event) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const dados = JSON.parse(e.target.result);
            
            if (confirm("Isso irá substituir seus dados atuais. Deseja continuar?")) {
                if (dados.aprendizados) localStorage.setItem('aprendizados', JSON.stringify(dados.aprendizados));
                if (dados.oracoes) localStorage.setItem('minhasOracoes', JSON.stringify(dados.oracoes));
                if (dados.pontos) localStorage.setItem('pontos', dados.pontos);
                
                alert("Backup restaurado com sucesso!");
                window.location.reload(); // Recarrega o app para atualizar tudo
            }
        } catch (err) {
            alert("Arquivo de backup inválido.");
        }
    };
    reader.readAsText(event.target.files[0]);
}
function resetarTudo() {
    // Primeira confirmação
    const confirmacao1 = confirm("ATENÇÃO: Isso apagará permanentemente todos os seus aprendizados, orações e pontos. Tem certeza?");
    
    if (confirmacao1) {
        // Segunda confirmação (segurança extra)
        const confirmacao2 = confirm("Certeza absoluta? Esta ação não pode ser desfeita.");
        
        if (confirmacao2) {
            localStorage.clear(); // Limpa tudo o que está salvo
            alert("Todos os dados foram apagados.");
            window.location.reload(); // Recarrega o app do zero
        }
    }
}
// Chame essa função sempre que o app abrir
function verificarLembreteBackup() {
    const alerta = document.getElementById('alerta-backup');
    const ultimoBackup = localStorage.getItem('data_ultimo_backup');
    
    if (!ultimoBackup) {
        // Se nunca fez backup, mostra o alerta após 3 dias de uso
        alerta.style.display = 'block';
        return;
    }

    const hoje = new Date().getTime();
    const seteDias = 7 * 24 * 60 * 60 * 1000;

    if (hoje - parseInt(ultimoBackup) > seteDias) {
        alerta.style.display = 'block';
    } else {
        alerta.style.display = 'none';
    }
}

// ATUALIZE sua função de exportar para esconder o alerta e salvar a data
function exportarBackup() {
    const dados = {
        aprendizados: JSON.parse(localStorage.getItem('aprendizados')) || [],
        oracoes: JSON.parse(localStorage.getItem('minhasOracoes')) || [],
        pontos: localStorage.getItem('pontos') || "0"
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dados));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "backup_devocional.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    // --- PARTE NOVA: Salva a data e esconde o alerta ---
    localStorage.setItem('data_ultimo_backup', new Date().getTime());
    verificarLembreteBackup(); 
    alert("Backup realizado com sucesso!");
}

// Inicie a verificação ao carregar o app
window.addEventListener('load', verificarLembreteBackup);
    const body = document.body;
  

function mudarVersao(novaVersao) {
    localStorage.setItem('versao_preferida', novaVersao);
    
    // Pegue a referência do versículo atual que já está na tela
    const versiculoAtual = document.getElementById('referencia-atual').innerText;
    
    if (versiculoAtual) {
        // Chame APENAS a função que busca o texto, sem gerar novo desafio
        buscarTextoBiblico(versiculoAtual, novaVersao);
    }
}
function gerarNovoDesafio() {
    // 1. Sorteia novos valores para as variáveis globais
    const acao = iaAcoes[Math.floor(Math.random() * iaAcoes.length)];
    const alvo = iaAlvos[Math.floor(Math.random() * iaAlvos.length)];
    const tema = iaTemas[Math.floor(Math.random() * iaTemas.length)];
    
    desafioSorteado = `${acao} ${alvo} ${tema}.`;
    referenciaSorteada = versiculosIA[Math.floor(Math.random() * versiculosIA.length)];

    // 2. Atualiza a tela com os novos dados
    atualizarTudo();
    
    // 3. Opcional: Feedback visual de que mudou
    console.log("Novo desafio gerado com sucesso!");
}
