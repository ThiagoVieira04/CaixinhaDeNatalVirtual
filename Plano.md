# Plano.md

# Plano de desenvolvimento --- Caixinha de Natal Virtual

## Estúdio de Artes: especificação e implementação por etapas

**Objetivo:** construir um Estúdio de Artes dentro da plataforma
Caixinha de Natal Virtual, permitindo que cada comerciante crie peças de
divulgação personalizadas para sua campanha de Natal, sem utilizar APIs
pagas de inteligência artificial ou serviços externos de geração de
imagens.

**Princípio central:** a arte será montada no próprio navegador, usando
templates locais, campos de personalização e HTML5 Canvas. A geração e o
download do PNG não devem gerar cobrança por imagem.

------------------------------------------------------------------------

# 1. Visão geral do recurso

O Estúdio de Artes permitirá ao comerciante:

-   Escolher um modelo visual de Natal.
-   Inserir o nome do estabelecimento.
-   Enviar a logo da empresa.
-   Personalizar a mensagem.
-   Escolher cores dentro das opções permitidas pelo template.
-   Opcionalmente inserir uma foto da equipe, quando o modelo oferecer
    esse espaço.
-   Visualizar a arte antes de exportar.
-   Gerar uma imagem PNG vertical em 1080 × 1920 pixels.
-   Baixar a imagem no dispositivo.
-   Compartilhar a imagem usando os recursos nativos do navegador,
    quando suportados.

A arte será especialmente adequada para o WhatsApp Status e Instagram
Stories.

**Importante sobre QR Code:** não inserir QR Code na imagem destinada ao
Status como recurso principal. Quem visualiza o Status no próprio
celular não consegue, em condições normais, escanear o QR Code exibido
na mesma tela. O QR Code deve ser oferecido separadamente para impressão
e uso físico no balcão. Para Status e Stories, priorizar link clicável
da campanha.

------------------------------------------------------------------------

# 2. Regras técnicas e restrições

1.  Não utilizar Gemini, OpenAI, serviços de geração de imagens ou
    qualquer API paga para criar artes.
2.  Não criar cobrança variável por imagem gerada.
3.  Não exigir que o comerciante tenha chave de API.
4.  Não adicionar dependências sem necessidade.
5.  Não recriar autenticação, banco de dados, painel administrativo ou
    funcionalidades que já existam no projeto.
6.  Antes de alterar arquivos, analisar a estrutura atual do
    repositório.
7.  Preservar o padrão visual, componentes, rotas e convenções já
    existentes.
8.  Não substituir arquivos existentes sem necessidade.
9.  Não criar imagens fictícias para substituir templates ausentes.
10. Tratar o upload de logo e foto localmente no navegador sempre que
    possível.
11. Não salvar automaticamente cada arte gerada no Supabase. A
    exportação deve ocorrer localmente, salvo se houver uma necessidade
    de produto definida posteriormente.
12. Implementar validação de arquivos, mensagens de erro e estados de
    carregamento.
13. Garantir responsividade para computador e celular.
14. Não exibir um botão que pareça funcional sem implementar sua ação.

## 2.1 Observação sobre a pasta de templates

Os arquivos de imagem serão organizados na pasta:

`assets/templates/natal/`

Arquivos esperados:

-   `natal-classico.png`
-   `natal-elegante.png`
-   `natal-minimalista.png`
-   `natal-divertido.png`
-   `natal-premium.png`
-   `natal-comercial.png`

Antes de implementar, verificar como o projeto Next.js está configurado:

-   Se `assets` já é uma pasta de recursos importados pelo bundler,
    utilizar importações estáticas compatíveis com a estrutura
    existente.
-   Se os templates precisarem ser acessados por URL pública, utilizar a
    pasta `public/assets/templates/natal/`.
-   Não duplicar os mesmos arquivos em duas pastas.
-   Não presumir que o navegador pode listar o conteúdo de uma pasta do
    servidor em tempo de execução. Criar um catálogo explícito dos seis
    templates com seus caminhos reais.
-   Se algum arquivo não existir, informar claramente e não inventar um
    caminho ou uma imagem substituta.

------------------------------------------------------------------------

# 3. Identidade visual e experiência

## 3.1 Direção visual

Criar uma interface moderna, simples e profissional, voltada a pequenos
comerciantes.

Paleta sugerida:

-   Verde-escuro: `#174B38`
-   Verde complementar: `#27664B`
-   Creme: `#FFF8EA`
-   Dourado: `#C9A45C`
-   Vermelho natalino: `#B83A3A`
-   Texto principal: `#26332D`
-   Fundo neutro: `#F7F7F3`

Usar detalhes natalinos discretos, sem excesso de enfeites. A interface
deve continuar clara e fácil de utilizar.

## 3.2 Navegação

Adicionar a opção **Estúdio de Artes** ao menu do painel do comerciante,
respeitando a navegação atual do projeto.

## 3.3 Telas previstas

1.  Dashboard com acesso ao Estúdio de Artes.
2.  Galeria de templates.
3.  Editor e personalização da arte.
4.  Pré-visualização e exportação.
5.  Confirmação de arte pronta e opções de compartilhamento.

------------------------------------------------------------------------

# 4. Especificação das telas

## Tela 1 --- Dashboard

Título sugerido: **Olá! Vamos preparar sua campanha de Natal?**

Elementos:

-   Menu lateral existente, preservando os itens atuais.
-   Item de navegação "Estúdio de Artes".
-   Cards de resumo da campanha, se já existirem dados disponíveis:
    -   Arrecadado.
    -   Contribuições.
    -   Meta.
-   Card de destaque: **Crie sua arte de divulgação**.
-   Texto auxiliar explicando que o comerciante pode personalizar uma
    imagem para divulgar sua caixinha.
-   Botão **Abrir Estúdio de Artes**.

Não inventar valores de arrecadação ou estatísticas. Utilizar dados
reais do sistema ou estados vazios apropriados.

## Tela 2 --- Galeria de modelos

Título: **Escolha um modelo**

Apresentar seis cards:

1.  Natal clássico --- visual tradicional, verde e vermelho.
2.  Elegante --- visual sofisticado, com dourado e tons escuros.
3.  Minimalista --- composição limpa e poucos elementos.
4.  Divertido --- visual alegre e descontraído.
5.  Premium --- acabamento refinado e destaque para a mensagem.
6.  Comercial --- mensagem direta, ideal para estabelecimentos.

Cada card deve conter:

-   Miniatura real do template.
-   Nome do modelo.
-   Breve descrição.
-   Estado de seleção.
-   Ação para selecionar.

Após selecionar um modelo, permitir avançar com o botão **Personalizar
arte**.

As miniaturas devem corresponder aos arquivos reais da pasta de
templates. Não usar imagens genéricas como se fossem os templates
finais.

## Tela 3 --- Editor de arte

Título: **Personalize sua arte**

Organização sugerida:

-   Em desktop: controles à esquerda e prévia à direita.
-   Em celular: controles e prévia empilhados, com ações fáceis de
    alcançar.

Controles:

### Identificação do estabelecimento

-   Nome da empresa.
-   Upload da logo.
-   Remover ou substituir logo.

### Mensagem

-   Campo de mensagem principal.
-   Campo opcional de mensagem complementar.
-   Limite de caracteres adequado ao espaço disponível.
-   Prévia da quebra de linhas.

Mensagem inicial sugerida:

" neste Natal, sua contribuição faz a diferença!"

A frase deve ser apresentada sem aspas e com capitalização adequada. O
comerciante poderá editá-la.

### Cores

-   Seletor de cores.
-   Paleta de combinações sugeridas.
-   Restaurar cores originais do template.

### Foto opcional

-   Disponibilizar upload de foto somente se o template selecionado
    possuir área própria para fotografia.
-   Permitir remover a foto.
-   Não deformar a imagem.

### Ações

-   **Visualizar arte**
-   **Voltar aos modelos**
-   **Gerar arte**

## Tela 4 --- Pré-visualização

Mostrar a composição final em formato vertical 9:16.

Requisitos:

-   Prévia proporcional, sem distorção.
-   A prévia deve refletir os mesmos dados que serão exportados.
-   Permitir voltar à edição.
-   Mostrar o tamanho final: 1080 × 1920 pixels.
-   Não incluir QR Code na arte de Status por padrão.

## Tela 5 --- Arte pronta

Título: **Sua arte está pronta!**

Exibir:

-   Prévia da arte final.
-   Botão **Baixar imagem PNG**.
-   Botão **Compartilhar**, quando o navegador e o dispositivo
    suportarem.
-   Botão **Criar outra arte**.
-   Orientação: "Para divulgar no WhatsApp Status, compartilhe a imagem
    e adicione o link da sua caixinha."

Se o compartilhamento nativo não estiver disponível, oferecer o download
como alternativa. Não afirmar que a imagem foi enviada ao WhatsApp se o
navegador apenas abriu a janela de compartilhamento.

------------------------------------------------------------------------

# 5. Especificação dos seis templates

Os templates devem ter proporção vertical 9:16 e boa resolução para
exportação em 1080 × 1920.

## 5.1 Natal clássico

-   Verde e vermelho.
-   Elementos natalinos tradicionais.
-   Área de destaque para nome da empresa.
-   Área para logo e mensagem.

## 5.2 Elegante

-   Fundo escuro ou creme.
-   Detalhes dourados.
-   Tipografia sofisticada e legível.
-   Composição com poucos elementos.

## 5.3 Minimalista

-   Fundo claro.
-   Poucos elementos gráficos.
-   Mensagem em destaque.
-   Alto contraste e leitura fácil.

## 5.4 Divertido

-   Cores alegres.
-   Elementos natalinos descontraídos.
-   Hierarquia visual clara.
-   Sem excesso de informação.

## 5.5 Premium

-   Aparência refinada.
-   Combinação de tons escuros e dourados.
-   Espaço para logo.
-   Mensagem de agradecimento em evidência.

## 5.6 Comercial

-   Nome do estabelecimento em destaque.
-   Mensagem objetiva convidando à contribuição.
-   Área para chamada principal.
-   Visual adequado a lojas, salões, restaurantes e prestadores de
    serviço.

------------------------------------------------------------------------

# 6. Implementação técnica

## 6.1 Tecnologias

Respeitar a stack já utilizada no projeto. A implementação prevista é
compatível com:

-   Next.js.
-   React.
-   TypeScript.
-   Tailwind CSS, se já estiver instalado.
-   HTML5 Canvas.
-   Supabase apenas para os dados que realmente precisarem ser
    persistidos.

Não instalar bibliotecas adicionais se as APIs nativas forem
suficientes.

## 6.2 Canvas e exportação

A composição deve ser desenhada no navegador com HTML5 Canvas.

Fluxo:

1.  Carregar o template selecionado.
2.  Carregar a logo, se enviada.
3.  Carregar a foto opcional, se aplicável.
4.  Desenhar o fundo/template.
5.  Aplicar nome da empresa.
6.  Aplicar mensagens.
7.  Aplicar cores selecionadas.
8.  Ajustar alinhamento, tamanho e quebra de texto.
9.  Renderizar em canvas com 1080 × 1920.
10. Exportar para PNG.
11. Disponibilizar o arquivo para download.

O canvas deve manter a proporção e a qualidade do arquivo final,
independentemente do tamanho da prévia na tela.

## 6.3 Tratamento de imagens

-   Validar tipos de arquivo permitidos, preferencialmente PNG, JPG e
    WEBP.
-   Definir limite razoável de tamanho de upload.
-   Exibir mensagens de erro compreensíveis.
-   Redimensionar imagens mantendo a proporção.
-   Evitar distorção de logos.
-   Revogar URLs temporárias criadas com `URL.createObjectURL` quando
    não forem mais necessárias.
-   Tratar falhas no carregamento de imagens antes de exportar.

## 6.4 Compartilhamento

Usar a Web Share API quando disponível e compatível com compartilhamento
de arquivos.

Fluxo recomendado:

1.  Gerar o PNG.
2.  Criar um arquivo `File` a partir do PNG.
3.  Verificar se o navegador aceita compartilhamento desse arquivo.
4.  Se aceitar, abrir o compartilhamento nativo.
5.  Se não aceitar, baixar o PNG normalmente.

Não depender de uma API paga para compartilhar.

## 6.5 Organização sugerida de arquivos

Adaptar à estrutura real do repositório. Não criar pastas duplicadas se
o projeto já tiver organização equivalente.

Exemplo:

``` text
src/
  app/
    dashboard/
      estudio-de-artes/
        page.tsx
  components/
    studio/
      TemplateGallery.tsx
      TemplateCard.tsx
      ImageEditor.tsx
      LogoUploader.tsx
      TextEditor.tsx
      ColorPicker.tsx
      ImagePreview.tsx
      DownloadButton.tsx
      ShareButton.tsx
  lib/
    canvas/
      renderArtwork.ts
      loadTemplate.ts
      exportPNG.ts
    studio/
      templates.ts
      validation.ts

assets/
  templates/
    natal/
      natal-classico.png
      natal-elegante.png
      natal-minimalista.png
      natal-divertido.png
      natal-premium.png
      natal-comercial.png
```

Se o projeto utilizar `src/app` ou outra estrutura diferente, seguir a
estrutura existente em vez de impor este exemplo.

------------------------------------------------------------------------

# 7. Dados e Supabase

A geração da arte deve funcionar localmente. Não é necessário armazenar
cada PNG no Supabase.

Antes de criar tabelas, verificar o banco atual e evitar duplicidade.

Uma tabela de catálogo de templates só será necessária se o
administrador precisar ativar, desativar ou cadastrar modelos
dinamicamente. Caso contrário, manter o catálogo em um arquivo
TypeScript estático.

Se for realmente necessário persistir configurações de artes, avaliar
uma tabela semelhante a:

### `generated_artworks` --- opcional

  Campo           Tipo sugerido   Finalidade
  --------------- --------------- ---------------------------
  id              uuid            Identificador
  merchant_id     uuid            Proprietário da arte
  template_key    text            Modelo escolhido
  business_name   text            Nome usado na composição
  message         text            Mensagem principal
  settings        jsonb           Cores e opções utilizadas
  created_at      timestamptz     Data de criação

Não armazenar imagens em base64 dentro da tabela. Não criar essa tabela
se o histórico de artes não for um requisito do produto.

Segurança:

-   Respeitar o modelo de autenticação existente.
-   Aplicar RLS às tabelas que armazenarem dados de comerciantes.
-   Um comerciante não pode consultar ou alterar dados de outro.
-   Não expor chaves secretas no frontend.

------------------------------------------------------------------------

# 8. Plano de execução por etapas --- prompts para Vibe Coding

Execute uma etapa por vez. Ao terminar cada etapa, revisar o resultado,
testar e corrigir antes de enviar o próximo prompt.

## ETAPA 1 --- Analisar o projeto e criar a estrutura da galeria

**Prompt:**

Analise todo o projeto atual da Caixinha de Natal Virtual antes de fazer
alterações. Identifique a estrutura do Next.js, rotas, componentes,
autenticação, layout do dashboard, estilos e integração com Supabase.

Implemente a primeira etapa do recurso Estúdio de Artes.

Requisitos:

1.  Adicione a opção "Estúdio de Artes" à navegação existente do painel
    do comerciante.
2.  Crie a rota correspondente seguindo o padrão atual do projeto.
3.  Crie uma página com o título "Escolha um modelo".
4.  Apresente seis cards: Natal clássico, Elegante, Minimalista,
    Divertido, Premium e Comercial.
5.  Utilize os arquivos reais que estiverem disponíveis em
    `assets/templates/natal/`.
6.  Crie um catálogo explícito dos seis modelos com chave, nome,
    descrição e caminho real da imagem.
7.  Verifique se os arquivos estão em uma pasta importável ou em
    `public`. Em Next.js, se for necessário servir por URL pública, use
    `public/assets/templates/natal/`. Não duplique os arquivos.
8.  Se algum template não existir, apresente um estado de
    indisponibilidade e informe qual arquivo está faltando. Não invente
    imagens.
9.  Permita selecionar um modelo e destacar visualmente a seleção.
10. Crie o botão "Personalizar arte", que deverá avançar para a próxima
    etapa do fluxo.
11. Mantenha a identidade visual atual do sistema e garanta
    responsividade.

Restrições:

-   Não recrie autenticação.
-   Não recrie o dashboard.
-   Não altere funcionalidades existentes sem necessidade.
-   Não instale dependências desnecessárias.
-   Não use IA ou APIs pagas.
-   Antes de concluir, informe os arquivos criados/alterados e como
    testar a galeria.

## ETAPA 2 --- Criar os controles de personalização

**Prompt:**

Continue a implementação do Estúdio de Artes existente. Não recomece o
projeto e não altere o que já está funcionando.

Implemente a tela "Personalize sua arte", conectada ao template
escolhido na etapa anterior.

Crie os controles:

1.  Campo para nome do estabelecimento.
2.  Upload de logo, com prévia, opção de substituir e remover.
3.  Campo para mensagem principal.
4.  Campo opcional para mensagem complementar.
5.  Seletor de cores e paletas sugeridas.
6.  Botão para restaurar as cores originais.
7.  Upload opcional de foto apenas para templates que possuam área de
    foto.
8.  Botões para voltar à galeria e visualizar a arte.

Requisitos:

-   Manter os dados ao navegar entre as etapas.
-   Validar os formatos de imagem.
-   Definir limite de tamanho para uploads.
-   Não distorcer logos ou fotos.
-   Exibir mensagens de validação claras.
-   Garantir uso em computador e celular.
-   Não enviar imagens para APIs externas.
-   Não criar armazenamento no Supabase sem necessidade.
-   Não instalar bibliotecas sem justificar.

Use estado React ou a solução de estado já existente no projeto. Ao
finalizar, liste os arquivos alterados e os testes realizados.

## ETAPA 3 --- Criar a prévia visual do editor

**Prompt:**

Continue o Estúdio de Artes. Implemente a pré-visualização da arte
usando o template selecionado e os dados inseridos pelo comerciante.

A prévia deve:

1.  Mostrar o template correto.
2.  Aplicar o nome da empresa.
3.  Aplicar a logo enviada.
4.  Aplicar a mensagem principal e a complementar.
5.  Aplicar as cores selecionadas.
6.  Mostrar a foto somente quando o template oferecer essa área e o
    usuário tiver enviado uma foto.
7.  Atualizar sempre que os campos forem alterados.
8.  Respeitar a proporção vertical 9:16.
9.  Não cortar textos nem sobrepor elementos importantes.
10. Manter boa legibilidade em telas pequenas.

Em desktop, organizar os controles de um lado e a prévia do outro. Em
celular, empilhar os elementos.

Não use imagens geradas por IA, APIs pagas ou imagens fictícias. Não
altere a galeria já implementada. Ao finalizar, explique como testar
cada campo e cada template.

## ETAPA 4 --- Implementar Canvas e download PNG

**Prompt:**

Continue o Estúdio de Artes existente e implemente a geração real da
imagem usando HTML5 Canvas, sem serviço externo.

Requisitos obrigatórios:

1.  Criar uma função central de renderização da arte.
2.  Renderizar o arquivo final com exatamente 1080 × 1920 pixels.
3.  Desenhar o template selecionado como base.
4.  Desenhar nome da empresa, logo, mensagens, cores e foto opcional.
5.  Preservar proporções das imagens.
6.  Implementar quebra automática de texto e ajuste de fonte para evitar
    cortes.
7.  Aguardar o carregamento de todos os recursos antes da exportação.
8.  Tratar erros de carregamento e exportação.
9.  Exportar em PNG.
10. Implementar o botão "Baixar imagem PNG".
11. Gerar nome de arquivo organizado, por exemplo
    `arte-natal-nome-da-empresa.png`.
12. Garantir que o resultado exportado corresponda à prévia.

Organize a lógica em funções reutilizáveis, respeitando a estrutura do
projeto. Use Canvas nativo, sem instalar biblioteca se não houver
necessidade.

Não utilize Gemini, OpenAI, APIs pagas, geração de imagens externa ou
armazenamento obrigatório no Supabase. A geração deve acontecer no
navegador e não gerar custo por imagem.

Ao concluir, teste a exportação dos seis modelos e informe eventuais
limitações.

## ETAPA 5 --- Implementar compartilhamento

**Prompt:**

Continue o Estúdio de Artes e implemente o compartilhamento da arte
pronta.

Requisitos:

1.  Criar a tela "Sua arte está pronta!".
2.  Exibir a prévia final.
3.  Implementar o botão "Baixar imagem PNG".
4.  Implementar o botão "Compartilhar" usando Web Share API quando
    disponível.
5.  Verificar suporte ao compartilhamento de arquivos antes de tentar
    compartilhar.
6.  Se não houver suporte, orientar o usuário a baixar a imagem.
7.  Criar o botão "Criar outra arte".
8.  Preservar a possibilidade de voltar e editar a arte.
9.  Exibir a orientação: "Para divulgar no WhatsApp Status, compartilhe
    a imagem e adicione o link da sua caixinha."
10. Não afirmar que a imagem foi enviada ao WhatsApp quando apenas foi
    aberta a janela nativa de compartilhamento.

Importante:

-   Não inserir QR Code na arte de Status por padrão.
-   O link da campanha deve ser apresentado separadamente para cópia ou
    compartilhamento.
-   O QR Code, se já existir no produto, deve continuar disponível para
    impressão e uso físico.
-   Não utilizar APIs pagas.

Teste em navegadores compatíveis e incompatíveis com Web Share API.
Informe os resultados.

## ETAPA 6 --- Revisar integração com o Supabase

**Prompt:**

Revise a integração do Estúdio de Artes com o Supabase, sem recriar o
banco ou a autenticação existentes.

A geração e o download da arte devem continuar funcionando localmente,
sem depender do Supabase.

Verifique:

1.  Como identificar o comerciante autenticado usando o sistema atual.
2.  Se existe necessidade real de salvar configurações ou histórico de
    artes.
3.  Se já existem tabelas que possam atender a essa necessidade.
4.  Se for indispensável criar uma tabela, documente antes a finalidade
    e os campos.
5.  Não armazene imagens em base64 no banco.
6.  Não crie upload de PNG para Storage sem requisito explícito.
7.  Respeite as políticas RLS existentes.
8.  Garanta que um comerciante não consiga acessar dados de outro.
9.  Não exponha chaves secretas no frontend.
10. Não altere tabelas ou políticas existentes sem necessidade.

Se não houver necessidade de persistência, mantenha as configurações
temporariamente no navegador e não crie tabelas novas.

Ao terminar, apresente o que foi reutilizado, o que foi alterado e os
testes de segurança realizados.

## ETAPA 7 --- Testes finais, correções e acabamento

**Prompt:**

Faça uma revisão completa do Estúdio de Artes implementado nas etapas
anteriores.

Teste:

1.  Acesso à rota pelo dashboard.
2.  Seleção dos seis templates.
3.  Carregamento das imagens reais.
4.  Upload, substituição e remoção de logo.
5.  Nome da empresa.
6.  Mensagem principal e complementar.
7.  Seletor de cores.
8.  Upload e remoção de foto nos modelos compatíveis.
9.  Atualização da prévia.
10. Exportação PNG em 1080 × 1920.
11. Correspondência entre prévia e arquivo exportado.
12. Download em computador e celular.
13. Compartilhamento nativo, quando suportado.
14. Fallback quando o compartilhamento não estiver disponível.
15. Navegação de ida e volta sem perder os dados.
16. Estados de erro, carregamento e arquivos inválidos.
17. Responsividade e acessibilidade básica.

Corrija problemas de layout, texto cortado, imagens distorcidas, botões
sem ação e erros de console.

Verifique também:

-   Build de produção.
-   TypeScript.
-   Rotas.
-   Dependências adicionadas.
-   Ausência de chamadas a APIs pagas de geração de imagens.
-   Ausência de custos por geração de arte.
-   Compatibilidade com a estrutura atual do projeto.

Não faça refatorações amplas nem altere funcionalidades fora do Estúdio
de Artes.

Ao concluir, entregue um relatório objetivo com:

-   Funcionalidades implementadas.
-   Arquivos criados e alterados.
-   Testes aprovados e reprovados.
-   Pendências.
-   Instruções para executar e validar o recurso.

------------------------------------------------------------------------

# 9. Critérios de aceitação

O recurso será considerado pronto quando:

-   [ ] O comerciante acessar o Estúdio de Artes pelo dashboard.
-   [ ] Os seis templates reais forem exibidos.
-   [ ] O comerciante conseguir selecionar um template.
-   [ ] O comerciante conseguir inserir o nome da empresa.
-   [ ] O comerciante conseguir enviar uma logo.
-   [ ] O comerciante conseguir personalizar mensagens e cores.
-   [ ] A foto opcional funcionar apenas nos modelos compatíveis.
-   [ ] A prévia acompanhar as alterações.
-   [ ] A imagem final for exportada em PNG 1080 × 1920.
-   [ ] O arquivo baixado corresponder à prévia.
-   [ ] O compartilhamento funcionar quando houver suporte.
-   [ ] Houver alternativa de download quando não houver suporte.
-   [ ] A interface funcionar em computador e celular.
-   [ ] Não houver dependência de API paga de geração de imagem.
-   [ ] Não houver cobrança variável por arte gerada.
-   [ ] As funcionalidades existentes da plataforma continuarem
    funcionando.

------------------------------------------------------------------------

# 10. Custos e observações operacionais

A geração local com Canvas evita custos de API por imagem. Isso não
significa que toda a plataforma seja necessariamente gratuita:
hospedagem, banco de dados, tráfego, armazenamento de outros recursos e
tarifas do gateway de pagamento podem continuar existindo conforme o uso
e os planos contratados.

Para manter o Estúdio de Artes econômico:

-   Manter templates estáticos no projeto.
-   Fazer a composição no navegador.
-   Evitar salvar cada imagem gerada no servidor.
-   Evitar APIs externas de imagem.
-   Limitar o tamanho dos arquivos enviados.
-   Não carregar bibliotecas grandes sem necessidade.

------------------------------------------------------------------------

# 11. Ordem recomendada de trabalho

1.  Conferir se os seis arquivos de templates já estão na pasta correta.
2.  Fazer backup ou commit do estado atual do projeto.
3.  Enviar o prompt da Etapa 1 ao Vibe Coding.
4.  Conferir a galeria e testar os caminhos das imagens.
5.  Enviar o prompt da Etapa 2.
6.  Testar todos os controles.
7.  Enviar o prompt da Etapa 3.
8.  Conferir a prévia em computador e celular.
9.  Enviar o prompt da Etapa 4.
10. Baixar e inspecionar os PNGs.
11. Enviar o prompt da Etapa 5.
12. Testar compartilhamento e fallback.
13. Enviar o prompt da Etapa 6.
14. Revisar banco, autenticação e segurança.
15. Enviar o prompt da Etapa 7.
16. Corrigir pendências antes de publicar.

**Regra de execução:** não envie todas as etapas de uma só vez ao agente
de Vibe Coding. Execute uma por vez, valide o resultado e só então
avance. Isso reduz o risco de alterações desnecessárias e facilita
identificar erros.
