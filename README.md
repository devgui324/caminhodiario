# 📖 Caminho Diário 3.0

O **Caminho Diário** é uma aplicação interativa de devocional e estudo bíblico que utiliza lógica de "IA Local" para gerar desafios diários de fé, incentivando o hábito da leitura e da prática cristã através de gamificação.

## ✨ Funcionalidades

- **🧠 Desafios Gerados por IA:** O sistema combina ações, alvos e temas para criar missões únicas a cada clique ou a cada dia.
- **📚 Consulta Bíblica Multi-versões:** Suporte para diferentes traduções (NVI, ARA, ACF) carregadas via JSON.
- **🏆 Sistema de Pontuação e Patentes:** Ganhe pontos ao concluir desafios (+10) ou salvar aprendizados (+5). Evolua de *Servo Esforçado* até *Ancião da Fé*.
- **📝 Histórico de Aprendizados:** Salve suas reflexões vinculadas diretamente ao versículo estudado.
- **🙏 Mural de Oração:** Espaço para registrar e acompanhar seus pedidos de oração.
- **📱 Interface Responsiva:** Design limpo e adaptável para dispositivos móveis e desktop.

## 🚀 Tecnologias Utilizadas

* **HTML5:** Estrutura semântica das abas e cards.
* **CSS3:** Estilização moderna com variáveis e layout responsivo.
* **JavaScript (ES6+):** Lógica de geração aleatória, manipulação de DOM e persistência de dados.
* **LocalStorage:** Armazenamento local dos pontos, histórico e preferências de versão.

## 🛠️ Como usar

1. Clone o repositório ou baixe os arquivos.
2. Certifique-se de que os arquivos da Bíblia (`nvi.json`, `aa.json`, etc.) estão na pasta raiz.
3. Abra o arquivo `index.html` em qualquer navegador moderno.

## 📂 Estrutura de Arquivos

```text
├── index.html          # Estrutura principal e abas
├── style.css           # Estilização e temas de cores
├── script.js           # Motor da IA e lógica do app
├── nvi.json            # Base de dados bíblica (exemplo)
└── README.md           # Documentação do projeto