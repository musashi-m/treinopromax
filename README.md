# 🏋️ IronRoutine - Aplicativo Web de Treino e Gestão de Rotinas

Um aplicativo web moderno, responsivo e focado em alta performance para organizar sua rotina de musculação, execução correta de exercícios com GIFs, acompanhamento de treino em tempo real com cronômetro de descanso (+15s / -15s), contagem de repetições, comparação automática de Recordes Pessoais (PR) e **Calendário Mensal com Registro Detalhado de Treinos**.

---

## 🚀 Funcionalidades Principais

### 1. 📖 Catálogo de Exercícios Editável
- Todos os exercícios do catálogo possuem agora o botão **"Editar"**:
  - **Nome do Exercício**
  - **Descrição / Como Realizar a Execução**
  - **Foto / Link do GIF** com prévia em tempo real
  - **Séries padrão**
  - **Repetições padrão**
  - **Descanso padrão (segundos)**
  - **Grupo Muscular e Equipamento**
- Suas personalizações são salvas no armazenamento local do navegador e refletidas nas rotinas.
- Opção para restaurar os exercícios aos padrões de fábrica a qualquer momento.

### 2. 📅 Calendário Mensal e Registro dos Dias Treinados
- **Visão em Calendário Mensal**:
  - Navegue pelos meses do ano (`<` e `>`).
  - Destaque visual em todos os **dias do mês em que houve treino** (com selo da divisão muscular e marcação luminosa).
  - Selecione qualquer dia do mês para inspecionar os treinos realizados naquela data.
- **Acumuladores do Mês**:
  - Dias treinados no mês.
  - Tempo total decorrido no mês.
  - Carga total acumulada (kg).
  - Total de séries realizadas.
  - Total de repetições executadas.
- **Informações Detalhadas de Cada Treino**:
  1. ⏱️ **Tempo decorrido**: Duração precisa da sessão (ex: `00:52:00` ou `52 min`).
  2. 🏋️ **Carga Total**: Volume total levantado em kg ($\sum \text{Carga} \times \text{Reps}$, ex: `4.200 kg`).
  3. 🔢 **Total de Séries**: Número de séries completadas (ex: `18 séries`).
  4. 🔁 **Total de repetições**: Somatório de todas as repetições realizadas no treino (ex: `184 reps`).
  - Detalhamento por exercício com cargas de cada série e PRs superados.
- **Botão "+ Registrar Treino"**:
  - Permite lançar treinos manuais em qualquer dia do mês (passado ou presente) informando data, divisão muscular, tempo decorrido, carga total, séries, repetições e observações.

### 3. 📅 Organização Semanal e Divisões Musculares
- Organização completa de **Segunda a Domingo**.
- Configuração customizada das divisões musculares (ex: *Peito & Tríceps*, *Costas & Bíceps*, *Pernas / Quadríceps*, *Ombros & Trapézio*, *Posterior & Glúteos* ou *Dia de Descanso*).
- **Templates Prontos**: Suporte com 1 clique para divisões populares como **ABCDE**, **PPL (Push/Pull/Legs)** e **Upper/Lower**.
- Reordene a sequência dos exercícios com facilidade (subir/descer).

### 4. ⏱️ Modo Treino Ativo ("Iniciar Treino")
- **Cronômetro Geral de Treino**: Tempo decorrido em tempo real com controle de pausa/retomada.
- **Tabela de Séries Interativa**:
  - Exibição de carga e repetições anteriores para referência.
  - Campos numéricos com botões rápidos de ajuste de carga (`-1kg`, `+1kg`, `+2.5kg`, `+5kg`).
  - Ajuste rápido de repetições (`-` e `+`).
  - Botão **Concluir Série** que salva os dados e dispara automaticamente o cronômetro de descanso!
- **Volume e Repetições Calculados em Tempo Real**.

### 5. ⏳ Pausa para Descanso Inteligente
- Cronômetro circular e digital com contagem regressiva.
- Botões imediatos:
  - **`+15s`**: Adiciona 15 segundos ao descanso atual.
  - **`-15s`**: Reduz 15 segundos do descanso.
  - **`+30s`**: Extensão rápida de descanso.
  - **Pausar / Retomar**.
  - **Próxima Série / Pular**: Finaliza o descanso instantaneamente.
- **Alertas Sonoros e Vibração (Web Audio API)**:
  - Bipes nos últimos 3 segundos (3, 2, 1).
  - Alarme sonoro triplo quando o descanso encerra.
  - Alerta por vibração no smartphone (`navigator.vibrate`).
- Modo minimizado flutuante.

### 6. 👑 Comparação de PR (Personal Record / Carga Máxima)
- Comparação automática a cada série concluída com seu recorde anterior.
- Ao superar uma carga máxima:
  - 🎊 **Efeito de Confetes na tela**!
  - 🎺 **Fanfarra sonora de comemoração**!
  - 🏷️ **Selo de NOVO PR!**
- **Central de PRs**:
  - Tabela filtrada por grupos musculares com maiores cargas e datas.
  - **Calculadora Interativa de 1RM (Fórmula de Epley)** com faixas percentuais de força e hipertrofia.

### 7. ☁️ Integração com Supabase & Autenticação Biométrica (Passkey)
- **Supabase Cloud Sync**:
  - Sincronização automática em nuvem das suas rotinas, PRs, histórico de treinos e edições de catálogo.
  - Funciona perfeitamente offline com fallback transparente no armazenamento local (`localStorage`).
  - Script SQL incluso ([supabase_schema.sql](file:///c:/Users/Setor%20Fiscal/Downloads/Treinos/supabase_schema.sql)) para criação opcional de tabelas relacionais com RLS ativado.
- **Login e Biometria Nativa (WebAuthn)**:
  - Suporte a Chave de Acesso / Biometria (Touch ID, Face ID, Windows Hello).
  - Usuário Master padrão pré-configurado: `vini@gmail.com` / `123456`.
  - Botão de cadastro e atualização de biometria direto na barra de navegação.

### 8. 💾 Armazenamento e Backup Seguro
- Armazenamento 100% offline via `localStorage` (seus dados não somem ao recarregar a página).
- Botão de **Exportar Backup (JSON)** e **Importar Backup** para transferir para celular ou outro dispositivo.

---

## 💻 Como Rodar o Projeto

1. Clone o repositório ou navegue até a pasta:
   ```bash
   git clone https://github.com/musashi-m/treinopromax.git
   cd treinopromax
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   *(Ou dê dois cliques no arquivo `iniciar_treinos.bat`)*
4. Acesse o endereço exibido no navegador (`http://localhost:5173`).
