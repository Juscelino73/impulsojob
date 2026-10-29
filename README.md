# Impulsojob

com o nome de Impulso

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://impulsojob.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f4908bd1-8115-496f-816e-a8867932d2ee).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
Mega Prompt
"
CONSTRUA UM SAAS COMPLETO DE MATCHMAKING DE VAGAS E CURRÍCULOS COM IA — DO ZERO
Atue como um designer de produto sênior, arquiteto de design systems, engenheiro full-stack e desenvolvedor de produtos com inteligência artificial. Construa uma aplicação SaaS completa, funcional e preparada para evoluir para produção, do zero, usando Lovable.
O produto deve ser uma plataforma real e funcional de ponta a ponta, não apenas uma landing page, um dashboard estático ou um protótipo visual.
A aplicação deve utilizar um design system consistente baseado em Shadcn/UI, uma identidade visual em azul-escuro, branco e laranja, armazenamento persistente no backend, funcionalidades reais de IA e fluxos funcionais de matchmaking de vagas e otimização de currículos.
Implemente de forma incremental, valide cada funcionalidade e priorize recursos conectados e funcionais em vez de telas meramente decorativas.
IMPORTANTE: NÃO IMPLEMENTE LOGIN, CADASTRO, AUTENTICAÇÃO, RECUPERAÇÃO DE SENHA OU QUALQUER BARREIRA DE ACESSO NESTA PRIMEIRA VERSÃO.
O usuário deve abrir a aplicação e começar a utilizá-la imediatamente, sem precisar criar uma conta, informar e-mail, cadastrar senha ou passar por qualquer processo de autenticação.
Priorize a experiência de uso imediato. A persistência inicial pode ser feita por meio de uma sessão anônima e de um identificador aleatório de workspace, sem exigir dados pessoais ou credenciais. Prepare a arquitetura para permitir a adição futura de contas e autenticação, mas não implemente esses recursos agora.
1. VISÃO DO PRODUTO
Nome provisório do produto: CareerMatch AI.
Construa uma plataforma de carreira com inteligência artificial que ajude os usuários a descobrir oportunidades de emprego relevantes, entender sua compatibilidade com cada vaga, criar currículos personalizados e compatíveis com sistemas ATS para vagas específicas e gerenciar todo o processo de candidatura.
A principal proposta de valor é:
"Encontre as vagas certas. Personalize seu currículo. Candidate-se com confiança."
O fluxo principal do usuário deve funcionar da seguinte forma:
Abrir o app → Importar currículo → Analisar perfil profissional → Encontrar vagas → Calcular compatibilidade → Analisar requisitos → Gerar currículo personalizado → Editar e aprovar → Exportar documento → Acompanhar candidatura.
Desenvolva o produto para um público internacional que busca uma experiência SaaS moderna, premium, confiável e simples de utilizar. Prepare a arquitetura para os idiomas inglês e português brasileiro, usando português brasileiro como idioma inicial de toda a interface.
2. DESIGN SYSTEM — SHADCN/UI
Utilize Shadcn/UI como sistema principal de componentes, com React, TypeScript, Tailwind CSS e ícones Lucide.
Use variáveis CSS semânticas e tokens centralizados de design. Todas as páginas, componentes, diálogos, formulários, gráficos, elementos de navegação e estados interativos devem seguir as mesmas regras visuais.
Identidade visual da marca
A identidade visual deve utilizar três cores principais:
•	Azul-escuro: #102A43
•	Branco: #FFFFFF
•	Laranja: #F97316
Utilize tons neutros de cinza-azulado para bordas, textos secundários, superfícies discretas e estados desabilitados. Utilize cores semânticas acessíveis para sucesso, alertas e erros quando necessário.
O laranja deve funcionar como cor de destaque, e não como cor dominante de grandes áreas da interface. Utilize-o em chamadas para ação, estados selecionados, indicadores importantes e elementos interativos prioritários.
O azul-escuro deve ser a principal cor de identidade da marca. O branco deve ser a cor predominante do espaço de trabalho.
Tokens de cores
Defina tokens centralizados:
•	--background: #FFFFFF
•	--foreground: #102A43
•	--primary: #102A43
•	--primary-foreground: #FFFFFF
•	--accent: #F97316
•	--accent-foreground: #FFFFFF
•	--card: #FFFFFF
•	--card-foreground: #102A43
•	--secondary: #F1F5F9
•	--secondary-foreground: #102A43
•	--muted: #F1F5F9
•	--muted-foreground: #64748B
•	--border: #E2E8F0
•	--input: #E2E8F0
•	--ring: #F97316
•	--destructive: #DC2626
•	--success: #0F766E
•	--warning: #B45309
Ajuste as cores de texto e fundo sempre que necessário para garantir contraste acessível. Os estados semânticos devem continuar visualmente distintos das cores principais da marca.
Crie um tema escuro consistente com a mesma identidade em azul-escuro, branco e laranja. O tema claro deve ser o padrão inicial.
Tipografia
Utilize Inter ou Geist Sans.
Hierarquia tipográfica:
•	Títulos principais: 28–32 px, semibold ou bold.
•	Títulos de seções: 18–22 px, semibold.
•	Títulos de cards: 15–17 px, semibold.
•	Texto principal: 14–16 px.
•	Rótulos secundários: 12–13 px.
•	Métricas do dashboard: 28–36 px.
Utilize tipografia equilibrada, hierarquia visual clara, linhas de texto legíveis e pesos consistentes.
Espaçamento e geometria
•	Unidade básica de espaçamento: 4 px.
•	Escala consistente de 4, 8, 12, 16, 24, 32 e 48 px.
•	Raio padrão dos cards: 12 px.
•	Raio de inputs e botões: 8 px.
•	Cards com fundo branco, borda neutra sutil e sombras mínimas.
•	Botões com hierarquia visual clara e alturas consistentes.
•	Inputs com aproximadamente 40 px de altura.
•	Conteúdo do dashboard com espaços generosos, sem desperdício de área útil.
Evite gradientes excessivos, glassmorphism, elementos decorativos desnecessários, grandes áreas vazias, excesso de componentes em formato de pílula e estilos inconsistentes entre cards.
Componentes Shadcn/UI
Utilize e personalize os seguintes componentes:
Button, Card, Input, Textarea, Label, Select, Checkbox, RadioGroup, Switch, Tabs, Badge, Avatar, Progress, Skeleton, Separator, Tooltip, DropdownMenu, Dialog, Sheet, AlertDialog, Popover, Calendar, Table, Pagination, Breadcrumb, Sidebar, Form, Command, Toast ou Sonner e Chart quando apropriado.
Crie variantes consistentes para:
•	Botões primários: fundo azul-escuro e texto branco.
•	Botões de destaque: fundo laranja e texto branco.
•	Botões secundários: fundo neutro claro e texto azul-escuro.
•	Botões outline: fundo branco e borda neutra.
•	Botões ghost: fundo transparente.
•	Botões destrutivos: estilo vermelho acessível.
•	Estados de carregamento, desabilitado, hover, foco, sucesso e erro.
Utilize ícones Lucide de forma consistente. Não utilize emojis como ícones da interface.
Todos os componentes devem ser reutilizáveis, acessíveis, responsivos e coerentes com o design system.
3. LAYOUT DA APLICAÇÃO
Construa um dashboard SaaS responsivo com navegação lateral persistente no desktop, navegação superior e navegação adaptada para dispositivos móveis.
Navegação lateral
Inclua:
•	Logotipo e nome do produto.
•	Dashboard.
•	Encontrar vagas.
•	Meus matches.
•	Resume Studio.
•	Minhas candidaturas.
•	Perfil profissional.
•	Configurações.
Na parte inferior, inclua preferências da interface e informações relevantes sobre o workspace, quando necessário.
Não exiba avatar, nome de usuário ou informações de conta que exijam cadastro. Utilize uma área de preferências locais em seu lugar.
Utilize azul-escuro para a navegação ativa e laranja para indicadores selecionados ou ações importantes. Mantenha a interface predominantemente branca.
Navegação superior
Inclua:
•	Breadcrumbs ou título da página atual.
•	Atalho de busca quando relevante.
•	Preferências de tema.
•	Acesso às configurações do workspace.
Não inclua controles de login, cadastro ou perfil autenticado.
Requisitos globais da interface
Todas as rotas devem apresentar:
•	Cabeçalhos consistentes.
•	Skeletons de carregamento.
•	Estados vazios úteis.
•	Estados de erro.
•	Feedback de confirmação.
•	Navegação funcional.
•	Layout responsivo.
•	Interações acessíveis por teclado.
Não crie controles meramente decorativos que não executem nenhuma ação.
4. ROTAS E PÁGINAS
Implemente as seguintes rotas.
Páginas públicas:
•	/
•	/privacy
•	/terms
Páginas funcionais do aplicativo:
•	/onboarding
•	/dashboard
•	/jobs
•	/jobs/:id
•	/matches
•	/resume
•	/resume/:id
•	/applications
•	/profile
•	/settings
Não crie páginas de login, cadastro, recuperação de senha ou qualquer rota que exija autenticação.
Todas as páginas funcionais devem ser acessíveis diretamente, sem uma conta de usuário.
O onboarding deve ser opcional e não pode bloquear o acesso ao restante do aplicativo.
Ao abrir o app, apresente uma experiência de início rápido, permitindo importar um currículo, colar uma descrição de vaga ou começar a explorar as funcionalidades.
5. LANDING PAGE
Crie uma landing page moderna e profissional usando o design system azul-escuro, branco e laranja.
Inclua:
1.	Navegação com logotipo, links do produto e CTA principal.
2.	Título principal: "Sua próxima oportunidade começa com o match certo."
3.	Texto explicando o matchmaking personalizado e a otimização de currículos ATS com IA.
4.	CTA principal: "Começar agora".
5.	CTA secundário: "Ver como funciona".
6.	Prévia visual do dashboard.
7.	Explicação em três etapas:
o	Importe seu currículo.
o	Descubra vagas compatíveis com seu perfil.
o	Crie um currículo personalizado para cada oportunidade.
8.	Seções de funcionalidades para matchmaking, otimização de currículos e acompanhamento de candidaturas.
9.	Seção explicando transparência, privacidade e geração de currículos baseada em informações verdadeiras.
10.	Seção de preços preparada para planos futuros.
11.	Perguntas frequentes.
12.	Rodapé com links legais.
Utilize prévias reais da interface em vez de fotografias genéricas de banco de imagens.
Não invente depoimentos, logotipos de clientes, taxas de sucesso, estatísticas ou parcerias com empresas.
O botão "Começar agora" deve levar diretamente ao fluxo de uso do aplicativo, sem exigir login, cadastro ou preenchimento de formulário de conta.
6. ACESSO IMEDIATO E PRIMEIRA EXPERIÊNCIA
O usuário deve conseguir utilizar o produto assim que abrir o aplicativo.
Não implemente autenticação nesta versão.
Crie uma experiência de início rápido com três opções:
•	Importar meu currículo.
•	Colar uma descrição de vaga.
•	Explorar o aplicativo.
Permita que o usuário utilize o produto sem informar nome, e-mail, telefone ou senha.
O usuário pode fornecer dados profissionais apenas quando forem necessários para o processamento solicitado.
Sessão anônima
Se for necessário associar dados entre diferentes operações durante a utilização, crie um identificador aleatório de workspace ou sessão anônima.
Esse identificador não deve funcionar como uma credencial pública de acesso a dados privados.
Implemente controles de acesso no backend para impedir que alguém acesse documentos ou informações de terceiros simplesmente alterando um identificador no navegador.
Se for utilizado armazenamento local para manter a experiência entre visitas, explique suas limitações e ofereça uma forma de limpar os dados.
A arquitetura deve permitir adicionar autenticação no futuro sem exigir que a aplicação seja reconstruída.
Não implemente cadastro, login, recuperação de senha, verificação de e-mail ou bloqueios de acesso nesta etapa.
7. PERFIL PROFISSIONAL E CURRÍCULO MESTRE
Crie um perfil profissional estruturado que funcione como fonte principal de informações para todas as versões do currículo.
Suporte:
•	Título profissional.
•	Resumo profissional.
•	Experiências de trabalho.
•	Nome das empresas.
•	Cargos.
•	Datas de início e término.
•	Responsabilidades.
•	Conquistas.
•	Formação acadêmica.
•	Certificações.
•	Competências.
•	Idiomas.
•	Projetos.
•	Links de portfólio.
•	Links profissionais.
O usuário deve conseguir adicionar, editar, reordenar e excluir seções do perfil.
Implemente importação de currículos nos formatos PDF e DOCX, quando suportados.
Utilize um parser de documentos no backend ou uma biblioteca apropriada para extrair texto e estrutura. Apresente uma etapa de revisão para que o usuário corrija erros de interpretação antes de salvar os dados.
Armazene o arquivo original de forma privada somente quando necessário e apropriado.
Nunca considere os dados extraídos automaticamente como corretos sem permitir revisão pelo usuário.
O perfil deve poder ser criado manualmente, sem necessidade de importar um arquivo.
8. DESCOBERTA DE VAGAS
Crie uma interface funcional para descoberta de oportunidades.
O usuário deve poder:
•	Colar uma descrição completa de vaga.
•	Adicionar uma vaga a partir de uma URL compatível.
•	Inserir manualmente empresa, cargo, localização, salário e tipo de contratação.
•	Consultar vagas provenientes de fontes realmente integradas.
•	Buscar e filtrar vagas.
•	Salvar vagas.
•	Descartar vagas irrelevantes.
•	Consultar vagas analisadas anteriormente.
Filtros:
•	Cargo.
•	Palavras-chave.
•	Empresa.
•	Localização.
•	Remoto, híbrido ou presencial.
•	Senioridade.
•	Tipo de contratação.
•	Competências exigidas.
•	Data de publicação, quando disponível na fonte.
Cada vaga deve exibir sua origem e a data da última atualização, quando disponíveis.
Não afirme que uma vaga está ativa, aberta ou aceitando candidaturas se a fonte não confirmar esse status.
Implemente integrações por meio de APIs autorizadas ou conectores compatíveis. Respeite os termos das fontes, os limites de requisições e as restrições de acesso.
Se uma URL não puder ser acessada, solicite ao usuário que cole a descrição da vaga.
Diferencie claramente vagas adicionadas manualmente, importadas por URL e provenientes de fontes externas.
O produto deve funcionar mesmo sem integração externa de vagas, permitindo ao usuário colar descrições e realizar análises imediatamente.
9. MOTOR DE MATCHMAKING DE VAGAS COM IA
Esta é uma das principais funcionalidades do produto.
Para cada vaga, analise o perfil profissional do candidato em relação aos requisitos reais da posição.
Calcule uma pontuação de compatibilidade entre 0 e 100 utilizando critérios configuráveis e explicáveis, como:
•	Compatibilidade com competências obrigatórias.
•	Compatibilidade com competências desejáveis.
•	Experiência profissional relevante.
•	Compatibilidade de cargo e senioridade.
•	Conquistas profissionais relevantes.
•	Formação e certificações, quando exigidas.
•	Preferências de localização e formato de trabalho.
Utilize uma ponderação configurável e centralizada.
Separe requisitos obrigatórios de qualificações desejáveis.
Diferencie:
•	Competências confirmadas.
•	Competências parcialmente demonstradas.
•	Informações ausentes ou não verificadas.
•	Possíveis incompatibilidades.
•	Preferências do usuário.
Não presuma que uma competência está ausente apenas porque ela não foi mencionada. Classifique-a como desconhecida até que seja confirmada.
Exiba uma explicação clara da pontuação e demonstre como cada critério contribuiu para o resultado.
Para cada match, mostre:
•	Pontuação geral de compatibilidade.
•	Principais motivos da compatibilidade.
•	Competências correspondentes.
•	Competências obrigatórias ainda não demonstradas.
•	Experiências relevantes.
•	Possíveis lacunas.
•	Melhorias recomendadas no perfil.
•	Alterações recomendadas para o currículo.
•	Próxima ação sugerida.
Utilize badges e indicadores de progresso com moderação. Mantenha uma interface profissional e objetiva.
Nunca garanta contratação, entrevistas, aprovação em ATS ou respostas de recrutadores.
Não classifique candidatos com base em características protegidas.
Armazene os resultados de match e permita atualizar uma análise quando a descrição da vaga ou o perfil profissional forem alterados.
10. PÁGINA DE DETALHES DA VAGA
Crie uma página detalhada com layout de duas colunas no desktop.
Coluna esquerda:
•	Cargo.
•	Empresa.
•	Localização.
•	Tipo de contratação.
•	Descrição.
•	Responsabilidades.
•	Qualificações obrigatórias.
•	Qualificações desejáveis.
•	Origem da vaga e link.
Coluna direita:
•	Pontuação de compatibilidade.
•	Detalhamento dos critérios.
•	Competências correspondentes.
•	Competências ausentes ou não verificadas.
•	Experiência relevante do perfil.
•	Próximos passos recomendados.
CTA principal: "Personalizar meu currículo".
Ações secundárias:
•	Salvar vaga.
•	Descartar.
•	Marcar como candidato.
•	Abrir publicação original.
A ação "Personalizar meu currículo" deve iniciar um fluxo real utilizando a vaga selecionada e o perfil profissional disponível.
11. RESUME STUDIO — ESTÚDIO DE CURRÍCULOS COM IA
Esta é a principal funcionalidade comercial do produto.
Crie um editor profissional de currículos com currículo mestre e uma arquitetura preparada para múltiplas versões personalizadas por vaga, com limites de uso configuráveis futuramente.
O ambiente de edição deve incluir:
•	Lista de versões de currículo.
•	Vaga selecionada como alvo.
•	Seções editáveis.
•	Prévia do documento em tempo real.
•	Análise de palavras-chave da vaga.
•	Comparação de alterações.
•	Histórico de versões.
•	Indicador de salvamento.
•	Ações de exportação.
•	Feedback sobre a qualidade do currículo.
Fluxo de geração do currículo
Quando o usuário selecionar "Personalizar meu currículo":
1.	Carregue o perfil profissional disponível.
2.	Carregue a descrição da vaga selecionada.
3.	Extraia qualificações obrigatórias e desejáveis.
4.	Identifique experiências e competências relevantes.
5.	Reorganize e priorize informações pertinentes.
6.	Reescreva os tópicos profissionais para melhorar clareza, relevância e impacto, quando os fatos permitirem.
7.	Adapte o resumo profissional ao cargo desejado.
8.	Incorpore palavras-chave relevantes de maneira natural, desde que sejam sustentadas pela experiência real do usuário.
9.	Identifique informações ausentes que exijam confirmação.
10.	Gere uma nova versão personalizada do currículo.
11.	Compare a versão original com a versão revisada.
12.	Permita revisar, editar, aprovar e salvar o resultado.
A IA deve utilizar apenas informações fornecidas pelo usuário ou explicitamente confirmadas.
Nunca invente:
•	Empresas.
•	Diplomas.
•	Certificações.
•	Cargos.
•	Datas de emprego.
•	Competências.
•	Projetos.
•	Conquistas.
•	Métricas.
•	Valores de receita.
•	Tamanhos de equipes.
•	Responsabilidades.
Se uma métrica puder melhorar um tópico profissional, mas não estiver disponível, pergunte ao usuário ou omita a informação.
Não adicione competências não comprovadas apenas porque elas aparecem na descrição da vaga.
Mantenha o currículo mestre original inalterado ao gerar uma nova versão.
Cada currículo personalizado deve ser salvo de forma independente e vinculado à vaga correspondente.
Editor de currículos
Disponibilize campos editáveis para:
•	Dados de contato.
•	Título profissional.
•	Resumo profissional.
•	Experiências.
•	Formação acadêmica.
•	Competências.
•	Certificações.
•	Idiomas.
•	Projetos.
Implemente, quando viável, desfazer alterações, avisos de mudanças não salvas, salvamento automático com status visível e restauração de versões anteriores.
Permita aceitar ou rejeitar individualmente as alterações geradas pela IA.
Apresente uma comparação contendo:
•	Conteúdo original.
•	Conteúdo sugerido.
•	Explicação da alteração.
•	Requisito da vaga relacionado.
12. VALIDAÇÃO DE CURRÍCULOS ATS-FRIENDLY
Crie um analisador específico de qualidade de currículo.
Avalie:
•	Títulos de seção padronizados.
•	Legibilidade da tipografia.
•	Consistência das datas.
•	Qualidade da extração e interpretação do texto.
•	Relevância das palavras-chave.
•	Cobertura dos requisitos da vaga.
•	Informações ausentes ou ambíguas.
•	Consistência com o perfil mestre.
•	Afirmações não comprovadas.
•	Integridade do arquivo exportado.
Utilize formatação compatível com sistemas ATS:
•	Estrutura de coluna única.
•	Títulos de seção convencionais.
•	Experiência profissional em ordem cronológica clara.
•	Texto selecionável.
•	Datas consistentes.
•	Fontes convencionais.
•	Elementos decorativos mínimos.
•	Nenhuma informação essencial representada somente em imagens.
•	Evitar tabelas complexas, múltiplas colunas, gráficos, ícones e barras de competências nos currículos direcionados a ATS.
Suporte exportação para PDF e DOCX quando as bibliotecas necessárias estiverem disponíveis.
Para PDF, utilize uma solução confiável de geração de documentos que produza arquivos realmente baixáveis e com texto selecionável.
Para DOCX, utilize uma biblioteca legítima de geração de documentos Word e valide o arquivo resultante.
Não altere apenas a extensão de um arquivo HTML ou PDF para .docx.
Garanta que o documento baixado corresponda o máximo possível à prévia aprovada.
Implemente validação dos documentos e trate falhas de geração explicitamente.
Não afirme reproduzir o comportamento de todos os sistemas ATS. Explique que a interpretação varia conforme o software e o empregador.
Não apresente uma pontuação de qualidade do currículo como probabilidade de contratação.
13. ACOMPANHAMENTO DE CANDIDATURAS
Crie um sistema completo para gerenciamento de candidaturas.
Status:
•	Salva.
•	Em preparação.
•	Candidatado.
•	Em entrevista.
•	Oferta.
•	Rejeitado.
•	Desistência.
Suporte:
•	Visualização em lista e tabela.
•	Pipeline Kanban.
•	Pesquisa e filtros.
•	Atualização de status.
•	Datas de candidatura.
•	Datas de entrevistas.
•	Notas.
•	Datas de acompanhamento.
•	Informações da empresa.
•	URL da vaga.
•	Versão do currículo utilizada.
•	Histórico de candidatura.
Apresente um resumo das atividades no dashboard.
Permita criar uma candidatura diretamente a partir de uma vaga salva ou compatível.
Se forem implementados lembretes, utilize um mecanismo real de agendamento ou notificação compatível. Caso contrário, apresente as datas de acompanhamento sem afirmar que notificações foram agendadas.
14. DASHBOARD
Crie um dashboard personalizado com:
•	Mensagem de boas-vindas sem exigir identificação pessoal.
•	Indicador de preenchimento do perfil.
•	Vagas recomendadas.
•	Vagas visualizadas recentemente.
•	Vagas salvas.
•	Versões de currículo criadas.
•	Candidaturas por status.
•	Próximos acompanhamentos.
•	Atividade recente.
•	Ações rápidas.
Os cards de vagas recomendadas devem exibir:
•	Cargo.
•	Empresa.
•	Localização.
•	Pontuação de compatibilidade.
•	Duas ou três competências relevantes.
•	Breve explicação da compatibilidade.
•	CTA para analisar a vaga.
•	CTA para criar um currículo personalizado.
Utilize dados realmente persistidos.
Para novos usuários, apresente um estado vazio útil com ações para importar um currículo ou adicionar uma descrição de vaga.
Nunca apresente métricas fictícias como se fossem atividades reais.
15. BACKEND E BANCO DE DADOS
Utilize Lovable Cloud ou Supabase para o backend.
Crie um esquema relacional normalizado com chaves primárias UUID, timestamps, chaves estrangeiras, índices e restrições de validação adequadas.
Tabelas recomendadas:
•	workspaces
•	workspace_sessions
•	profiles
•	career_preferences
•	professional_experiences
•	education
•	skills
•	certifications
•	languages
•	projects
•	jobs
•	job_requirements
•	job_sources
•	saved_jobs
•	job_matches
•	match_score_breakdowns
•	resumes
•	resume_versions
•	resume_change_logs
•	applications
•	application_events
•	activity_events
•	user_preferences
•	ai_usage_events
Adicione as colunas e os relacionamentos necessários para implementar os fluxos reais.
Persista todos os dados gerados pelo usuário. Não utilize a memória do navegador ou arrays estáticos como fonte principal de dados.
Utilize migrações ou o mecanismo de gerenciamento de esquema suportado pela plataforma.
Persistência sem login
Como não haverá autenticação nesta versão, utilize um workspace anônimo ou uma sessão de trabalho para organizar os dados.
O identificador do workspace deve ser gerado de maneira aleatória e não deve ser tratado como um mecanismo suficiente de autorização.
Não exponha dados privados de currículos ou candidaturas por meio de identificadores previsíveis ou URLs públicas.
Implemente uma estratégia de acesso seguro compatível com o ambiente anônimo, como sessões temporárias com credenciais restritas mantidas de forma segura ou tokens de capacidade com permissões limitadas, quando suportados pela infraestrutura.
Nunca exponha chaves administrativas ou credenciais privilegiadas no frontend.
Se a infraestrutura escolhida exigir autenticação para persistência segura, avalie um mecanismo de sessão anônima suportado pela plataforma sem solicitar login, e-mail ou senha ao usuário.
Não desative indiscriminadamente as políticas de segurança do banco para permitir que o app funcione sem login.
Permita que os dados da sessão anônima sejam excluídos com segurança.
Use armazenamento privado para currículos originais e documentos gerados. Utilize URLs assinadas com validade limitada ou entrega autenticada de arquivos, quando apropriado.
16. BACKEND SEGURO PARA IA
Implemente funções server-side para:
•	Extração de currículos.
•	Extração de descrições de vagas.
•	Classificação dos requisitos.
•	Cálculo de compatibilidade.
•	Explicação dos matches.
•	Geração de currículos personalizados.
•	Comparação de versões.
•	Análise da qualidade do currículo.
•	Exportação de documentos, quando apropriado.
Utilize respostas JSON estruturadas com schemas e validação rigorosa.
Trate:
•	Entradas ausentes.
•	Respostas malformadas da IA.
•	Falhas do provedor.
•	Timeouts.
•	Limites de requisição.
•	Limites de utilização.
•	Retentativas quando apropriado.
•	Requisições duplicadas.
•	Falhas parciais.
Apresente estados úteis de carregamento, sucesso e erro.
Não exponha documentos privados dos usuários em logs desnecessariamente.
Não confie cegamente nas respostas da IA sem validar a estrutura e verificar as afirmações geradas em relação ao perfil profissional disponível.
Implemente limites configuráveis de uso da IA e controles de custos.
Se não houver credenciais configuradas para o provedor de IA, explique qual configuração está faltando e ofereça um caminho claro para configurá-la, em vez de simular operações bem-sucedidas.
17. PRIVACIDADE E SEGURANÇA
Implemente privacidade desde o início.
Requisitos:
•	Sessões anônimas seguras.
•	Armazenamento privado de documentos.
•	Autorização por workspace.
•	Validação de entradas.
•	Restrições de tamanho e formato dos arquivos.
•	Mensagens de erro seguras.
•	Gerenciamento de segredos.
•	Exclusão de dados.
•	Exclusão do workspace.
•	Exclusão de currículos.
•	Mensagens claras sobre privacidade e consentimento.
Colete apenas informações necessárias para o funcionamento do produto.
Permita que os usuários revisem e excluam suas informações.
Não utilize currículos privados para treinar modelos externos sem consentimento separado, explícito e informado, e sem que a configuração do provedor permita cumprir a política declarada.
Não exponha os dados de um workspace a outro.
Não implemente candidaturas automáticas que enviem informações pessoais sem autorização explícita do usuário.
Explique de maneira transparente que os dados podem ser perdidos se o usuário limpar os dados locais, encerrar uma sessão temporária ou não possuir um mecanismo de recuperação de workspace.
Prepare a arquitetura para que contas de usuário possam ser adicionadas futuramente, mas não implemente autenticação nesta versão.
18. RESPONSIVIDADE E ACESSIBILIDADE
Ofereça suporte a:
•	Desktop.
•	Notebook.
•	Tablet.
•	Celular.
Utilize uma sidebar responsiva que se transforme em menu lateral ou navegação compacta em telas menores.
Garanta que tabelas tenham alternativas utilizáveis no celular.
O editor de currículos deve continuar utilizável em telas pequenas.
Siga práticas de HTML semântico, navegação por teclado, indicadores de foco visíveis, atributos ARIA adequados e contraste suficiente.
Respeite as preferências de redução de movimento.
19. DESEMPENHO E QUALIDADE DE ENGENHARIA
Utilize:
•	Componentes reutilizáveis.
•	Modelos tipados.
•	Funções de API centralizadas.
•	Validação server-side.
•	Tratamento de erros consistente.
•	Consultas eficientes ao banco de dados.
•	Paginação para listas extensas.
•	Carregamento sob demanda quando apropriado.
•	Estados de carregamento com skeletons.
•	Índices adequados.
•	Tratamento seguro de arquivos.
Evite componentes gigantes, lógica de negócio duplicada, dependências excessivas, dados de usuário fixos no código, respostas de API fictícias e botões sem funcionalidade.
Utilize dados de demonstração somente em um ambiente de demonstração claramente identificado.
Nunca confunda modo de demonstração com ambiente real.
20. PLANO DE IMPLEMENTAÇÃO
Construa a aplicação na seguinte ordem, mantendo um design system coerente.
Fase 1: Fundação
•	Configurar React, TypeScript, Tailwind e Shadcn/UI.
•	Definir todos os tokens semânticos de design.
•	Construir componentes reutilizáveis.
•	Criar o layout principal.
•	Implementar navegação responsiva e rotas.
•	Construir a landing page.
•	Implementar acesso imediato sem login.
•	Criar o fluxo de início rápido.
Fase 2: Backend
•	Configurar Lovable Cloud ou Supabase.
•	Criar tabelas e políticas de acesso.
•	Implementar workspaces e sessões anônimas.
•	Construir perfil profissional.
•	Implementar armazenamento privado de arquivos.
•	Validar persistência e isolamento entre workspaces.
Não implementar cadastro, login ou recuperação de senha.
Fase 3: Matchmaking
•	Implementar cadastro manual de vagas e importação de descrições.
•	Adicionar integrações com fontes de vagas compatíveis.
•	Implementar extração de requisitos.
•	Implementar pontuação transparente.
•	Persistir e exibir resultados de compatibilidade.
Fase 4: Resume Studio
•	Implementar interpretação e revisão de currículos importados.
•	Construir o editor do currículo mestre.
•	Implementar personalização com IA.
•	Adicionar comparação de alterações e histórico de versões.
•	Implementar verificações de qualidade ATS.
•	Implementar exportações reais para PDF e DOCX.
Fase 5: Candidaturas
•	Construir o acompanhamento de candidaturas.
•	Vincular vagas e versões de currículo.
•	Implementar atualizações de status e notas.
•	Adicionar métricas ao dashboard com base em dados reais.
Fase 6: Preparação para produção
•	Verificar permissões e isolamento de dados.
•	Testar falhas da IA e limites de uso.
•	Validar exportação de arquivos.
•	Testar todos os formulários e interações.
•	Testar layouts em dispositivos móveis.
•	Corrigir erros de console e navegação.
•	Validar toda a jornada do usuário.
•	Testar exclusão de dados e limpeza de sessões.
21. CRITÉRIOS DE ACEITAÇÃO
A aplicação não estará completa até que os seguintes requisitos funcionem:
1.	O usuário pode abrir o aplicativo e começar a utilizá-lo imediatamente, sem login ou cadastro.
2.	O usuário pode criar e editar seu perfil profissional sem informar e-mail ou senha.
3.	O usuário pode importar um currículo compatível ou criar um manualmente.
4.	O conteúdo extraído pode ser revisado e corrigido.
5.	O usuário pode adicionar uma descrição real de vaga.
6.	A aplicação consegue analisar os requisitos da vaga.
7.	O usuário pode visualizar uma pontuação de compatibilidade explicável.
8.	O usuário pode gerar um currículo personalizado com base nas informações reais do perfil.
9.	O currículo gerado não inventa silenciosamente qualificações ou conquistas.
10.	O usuário pode editar e aprovar o conteúdo gerado.
11.	As versões de currículo são persistidas conforme a estratégia de workspace implementada.
12.	Os downloads de PDF e DOCX contêm documentos verdadeiros e utilizáveis, quando suportados.
13.	O usuário pode salvar vagas e acompanhar candidaturas.
14.	Os dados de cada workspace são protegidos por controles de acesso adequados.
15.	Os estados de carregamento, vazio, erro e sucesso funcionam corretamente.
16.	Toda a interface segue o design system Shadcn/UI em azul-escuro, branco e laranja.
17.	A aplicação funciona em desktop e dispositivos móveis.
18.	Nenhuma ação principal é um botão falso ou não funcional.
19.	Falhas da IA são comunicadas de maneira transparente.
20.	Os principais fluxos foram testados de ponta a ponta.
21.	Não existe nenhuma barreira de login ou cadastro para utilizar as funcionalidades principais.
22.	A sessão anônima e a persistência funcionam de forma coerente com as limitações de privacidade e segurança documentadas.
INSTRUÇÃO FINAL
Comece implementando o design system completo e o layout principal. Em seguida, conecte o backend e desenvolva a jornada principal do usuário.
Utilize consistentemente a identidade visual em azul-escuro, branco e laranja.
Priorize um MVP coerente, funcional, com persistência real e funcionalidades seguras de IA.
Não pare após criar a landing page ou o dashboard.
Não implemente login, cadastro, recuperação de senha ou qualquer exigência de autenticação nesta primeira versão.
Não afirme que integrações, dados de vagas, funcionalidades de IA ou exportações de arquivos funcionam até que tenham sido implementados e verificados.
Quando uma funcionalidade depender de uma API externa ou de credenciais, identifique a dependência e implemente a integração de maneira apropriada.
Construa um produto SaaS real, com acesso imediato, preparado para evoluir para uma plataforma de carreira com inteligência artificial.
A prioridade absoluta é permitir que qualquer pessoa abra o aplicativo e experimente seu valor imediatamente: importar um currículo, encontrar uma vaga compatível e gerar um currículo personalizado para essa oportunidade.

"
