# Roadmap público

Este é o backlog vivo do **Cante Uma Nova Canção**. Ele reúne bugs, pedidos,
ideias do mantenedor e sugestões técnicas para orientar as próximas versões.

O roadmap expressa intenção, não promessa de data. Um item só entra em uma
versão depois de aprovado pelo mantenedor, ter critérios de aceite e caber no
ciclo sem sacrificar correções mais importantes.

## Regra de prioridade

**Bugs vêm antes de funcionalidades.** Todo relato novo passa primeiro pela
triagem. Bugs críticos ou que quebram o fluxo principal bloqueiam a entrega de
novas funcionalidades até serem corrigidos ou explicitamente adiados pelo
mantenedor com o motivo registrado.

Prioridades:

- `P0`: segurança, perda de dados, corrupção ou aplicativo inutilizável;
- `P1`: crash, travamento ou regressão no fluxo principal;
- `P2`: funcionalidade ou correção importante para a próxima versão;
- `P3`: melhoria desejável sem urgência;
- `P4`: pesquisa, experimento ou possibilidade futura.

Estados utilizados:

- `Relatado`: recebido, ainda sem diagnóstico;
- `Em triagem`: reproduzindo e fechando o escopo;
- `Proposto`: sugestão aguardando aprovação do mantenedor;
- `Aprovado`: ideia aceita, ainda sem versão obrigatória;
- `Planejado`: aprovado e associado a uma versão;
- `Em desenvolvimento`: implementação iniciada;
- `Validado`: critérios de aceite atendidos;
- `Entregue`: incluído em uma versão publicada;
- `Adiado`: preservado no backlog, mas fora dos ciclos atuais.

## Base atual — candidata 3.3.50 (`versionCode 50`)

A candidata atual recompõe a base técnica do aplicativo:

- Android API 36 e `minSdk 24`;
- catálogo embarcado e funcionamento sem depender de catálogo remoto;
- busca tolerante a acentos e pequenos erros em número, título, autor e letra;
- cache local de áudio e base para reprodução em segundo plano;
- controles de mídia na tela bloqueada quando suportados pelo aparelho;
- telemetria mínima de abertura de telas e reprodução de músicas;
- permissões reduzidas e bloqueio de identificadores de publicidade;
- testes locais e CI para catálogo, áudio, busca, Analytics e assinatura.

Esses itens deixam de ser ideias abertas. Eles continuam sujeitos à validação
de regressão em aparelhos físicos e ao acompanhamento após a publicação.

## Próxima versão — alvo provisório 3.3.51

O número só será confirmado ao preparar o artefato. O `versionCode` deverá ser
sempre maior que qualquer pacote já carregado no Google Play.

### BUG-001 — Tela preta ao voltar de uma música no tablet

- tipo: bug;
- prioridade: `P1`;
- estado: `Em desenvolvimento`;
- origem: teste em tablet físico;
- sintoma: em algumas tentativas, ao voltar para a lista de músicas, a tela
  fica preta e o aplicativo deixa de responder;
- implementação atual: proteção de ciclo de vida da tela e do player adicionada
  ao retorno da música; teste automatizado focado aprovado;
- pendência: repetir o fluxo corrigido no E19 e em um telefone ou AVD;
- aceite:
  - identificar e registrar a causa;
  - repetir abertura e retorno de músicas sem tela preta, crash ou ANR;
  - manter a lista utilizável e no estado esperado após o retorno;
  - validar em tablet físico e em pelo menos um telefone ou AVD;
  - adicionar teste automatizado ou proteção de código proporcional à causa.

### UX-001 — Indicadores de conteúdo na lista de músicas

- tipo: melhoria funcional;
- prioridade: `P2`;
- estado: `Em desenvolvimento`;
- implementação atual: indicadores de áudio, letra, cifra e link integrados às
  listas e ao catálogo lateral; teste automatizado focado aprovado;
- pendência: validação visual e de acessibilidade em telefone e tablet;
- mostrar, sem abrir a música, quais conteúdos estão disponíveis;
- prever indicadores para áudio, letra, cifra e link, sem exibir um recurso que
  não exista naquele item;
- usar ícones legíveis, rótulos de acessibilidade e uma legenda discreta;
- manter a lista clara também em telas pequenas.

### UX-002 — Layout adaptativo para tablets e rotação

- tipo: melhoria funcional;
- prioridade: `P2`;
- estado: `Em desenvolvimento`;
- implementação atual: rotação liberada, breakpoint adaptativo em `700 dp`,
  navegação lateral em telas largas e composição mestre–detalhe na música;
- pendência: validar navegação, rotação e reprodução no E19 e em um telefone ou
  AVD antes de considerar a melhoria validada;
- liberar retrato e paisagem, preservando o estado da navegação e da música
  durante a rotação;
- em telas grandes, usar composição mestre–detalhe: catálogo ou navegação na
  lateral e a música selecionada em uma área principal maior;
- em telefones, manter a navegação compacta atual, sem reduzir a área útil;
- evitar dimensões fixas por modelo e decidir o layout pela largura disponível;
- aceite:
  - alternar retrato e paisagem sem tela preta, crash, ANR ou perda indevida do
    ponto de navegação;
  - abrir, tocar e voltar entre músicas no layout lateral;
  - manter letra, cifra, áudio e ações acessíveis nas duas orientações;
  - validar no E19 e em pelo menos um telefone ou AVD.

### BRAND-001 — Splash mínimo da CrânIA

- tipo: identidade visual;
- prioridade: `P2`;
- estado: `Em desenvolvimento`;
- usar fundo branco em toda a tela e somente o livro aberto isolado da parte
  inferior do logo aprovado da CrânIA;
- não exibir caveira, cérebro, cabos, texto, sombra ou outros elementos do
  logo completo;
- reutilizar o mesmo ativo, com transparência e margens seguras, no splash
  nativo e no carregamento inicial do React Native;
- não recriar uma espera artificial: o splash dura somente o tempo real de
  inicialização;
- validar proporção e recorte em telefone e tablet, em retrato e paisagem.

### BRAND-002 — Atualizar a tela Sobre

- tipo: conteúdo e identidade;
- prioridade: `P2`;
- estado: `Planejado`;
- apresentar “Redesenvolvido por CrânIA EcoSystem”;
- apresentar “Mantido por Fábio Souza”;
- mostrar a versão instalada do aplicativo;
- tornar `https://crania.ia.br` clicável;
- não exibir o e-mail pessoal nessa tela; contato e privacidade continuam nos
  canais próprios da ficha do aplicativo e da política pública;
- preservar créditos históricos sem confundi-los com suporte ou manutenção
  atuais.

### QA-001 — Matriz curta de regressão por versão

- tipo: sugestão da CrânIA;
- prioridade: `P2`;
- estado: `Proposto`;
- transformar o fluxo principal em checklist repetível para telefone e tablet:
  início, lista, busca, letra, cifra, reprodução, cache, segundo plano, retorno
  à lista e operação sem internet;
- anexar ao ciclo apenas evidências sanitizadas, sem dados do aparelho ou da
  conta do mantenedor.

### TECH-001 — Remover avisos de APIs depreciadas

- tipo: sugestão da CrânIA;
- prioridade: `P3`;
- estado: `Proposto`;
- migrar `SafeAreaView` para `react-native-safe-area-context`;
- ajustar o uso de cores do sistema ao comportamento edge-to-edge do Android;
- migrar os eventos do React Native Firebase para a API modular antes da
  remoção das APIs atuais;
- executar somente depois de estabilizar o BUG-001.

### Ordem proposta para o ciclo

1. reproduzir, diagnosticar e corrigir `BUG-001`;
2. executar a regressão mínima de navegação em telefone e tablet;
3. implementar `UX-001`, com indicadores do conteúdo de cada música;
4. implementar `UX-002`, com rotação e composição mestre–detalhe em tablets;
5. implementar `BRAND-001` e `BRAND-002` com os ativos aprovados;
6. revisar os textos visíveis conforme `LEGAL-001`, sem alterar créditos de
   autoria de músicas;
7. executar os gates locais, gerar APK e validar em aparelho físico;
8. gerar AAB, publicar primeiro em teste interno e acompanhar estabilidade;
9. atualizar este roadmap e as notas da versão com o resultado real.

Se surgir um novo bug durante o ciclo, ele volta ao início da fila para
triagem antes da continuidade das funcionalidades.

## Evolução aprovada, sem prioridade imediata

### UX-003 — Repaginação visual e temas

- prioridade: `P3`;
- estado: `Aprovado`;
- revisar identidade, tipografia, cores, componentes e iconografia;
- transformar a base de temas existente em escolha consistente de aparência;
- considerar tema claro, escuro e acompanhamento do sistema;
- manter contraste, legibilidade e acessibilidade como gates.

### CAT-001 — Pacotes independentes de músicas

- prioridade: `P3`;
- estado: `Aprovado`;
- permitir múltiplos catálogos verificáveis e utilizáveis offline;
- exigir procedência, licença, versão, hashes e assinatura do pacote;
- preservar o catálogo embarcado como fallback;
- detalhamento em [docs/music-pack-roadmap.md](docs/music-pack-roadmap.md).

### CAT-002 — Inserir e editar músicas, letras e cifras

- prioridade: `P3`;
- estado: `Aprovado`;
- permitir criação e edição de conteúdo próprio pelo usuário;
- manter alterações locais separadas do catálogo oficial;
- oferecer importação, exportação, backup e restauração;
- impedir que atualização de pacote sobrescreva silenciosamente uma edição;
- definir limites de autoria, licença e compartilhamento antes da publicação.

### CONTENT-001 — Ampliar os catálogos com responsabilidade

- prioridade: `P3`;
- estado: `Aprovado`;
- pesquisar outros repertórios e fontes;
- documentar autoria, denominação de origem quando relevante e autorização de
  uso de letras, cifras, imagens e gravações;
- não incorporar conteúdo apenas porque ele está disponível na internet.

### BRAND-003 — Evolução de identidade

- prioridade: `P3`;
- estado: `Aprovado`;
- evoluir ícone e assinatura visual do aplicativo;
- comunicar uso por cristãos de diferentes igrejas sem apagar a história do
  projeto nem a autoria das obras;
- separar identidade atual, manutenção e créditos históricos.

### LEGAL-001 — Neutralizar referências denominacionais

- prioridade: `P2`;
- estado: `Aprovado`;
- retirar da interface mantida pelo aplicativo o nome completo “Igreja de
  Cristo Internacional”;
- usar `ICI` somente quando necessário para referência histórica ou origem de
  conteúdo, sem apresentá-la como responsável atual pelo aplicativo;
- não apagar autoria, créditos ou fatos históricos associados às músicas;
- preparar metadados de catálogo para registrar, de forma consistente, siglas
  de outras igrejas ou comunidades responsáveis por repertórios futuros;
- não sugerir vínculo, parceria ou endosso institucional sem autorização;
- revisar nomes, marcas e permissões antes de publicar novos catálogos.

### METRICS-001 — Métricas úteis e mínimas

- prioridade: `P3`;
- estado: `Aprovado`;
- validar eventos de abertura de tela e reprodução de música;
- acompanhar estabilidade, adoção de versões e uso de recursos sem coletar
  conteúdo digitado, letras pessoais ou identificadores desnecessários;
- manter política de privacidade e declarações da loja coerentes com o binário.

## Possibilidades futuras

### BUSINESS-001 — Sustentação financeira

- prioridade: `P4`;
- estado: `Aprovado` para pesquisa;
- avaliar versão gratuita com publicidade discreta e opção de pagamento único
  para remoção de anúncios;
- validar custos, regras do Google Play, privacidade e experiência antes de
  escolher modelo ou preço;
- não introduzir publicidade enquanto a base funcional não estiver estável.

### IOS-001 — Versão para iOS

- prioridade: `P4`;
- estado: `Aprovado` como possibilidade;
- preservar compatibilidade que venha naturalmente do framework;
- estimar licença, assinatura, testes, publicação e manutenção antes de abrir
  um ciclo específico;
- não retirar recursos do Android apenas para antecipar essa hipótese.

### AUTOMATION-001 — Automatizar gestão e publicação

- prioridade: `P2` operacional;
- estado: `Aprovado`;
- automatizar validação, build, upload, teste interno, promoção e relatórios;
- manter credenciais, tokens, IDs de conta e procedimentos privados fora deste
  repositório público;
- usar API oficial quando houver cobertura e automação assistida apenas para as
  lacunas do Console.

## Sugestões para o projeto aberto

Estas sugestões aguardam aprovação individual:

### OSS-001 — Definir licenças de código e conteúdo

- prioridade: `P2`;
- estado: `Proposto`;
- adicionar licença explícita para o código;
- documentar separadamente os direitos de letras, cifras, áudios, marcas e
  imagens em um inventário como `MUSIC-LICENSES.md`, pois esses materiais não
  recebem automaticamente a licença do código;
- concluir antes de aceitar contribuições externas de conteúdo.

### OSS-002 — Guia de contribuição e segurança

- prioridade: `P3`;
- estado: `Proposto`;
- criar `CONTRIBUTING.md` com instalação, testes, padrão de PR e critérios de
  aceite;
- criar `SECURITY.md` para relatos responsáveis sem publicar vulnerabilidades;
- adicionar templates simples para bug e sugestão no GitHub;
- não aceitar em issues logs com tokens, dados pessoais ou configuração real.

### OSS-003 — Changelog por versão

- prioridade: `P3`;
- estado: `Proposto`;
- criar `CHANGELOG.md` com correções, melhorias, mudanças de privacidade e
  notas de migração;
- mover itens para `Entregue` somente depois da publicação confirmada.

## Como registrar um novo item

Cada pedido ou sugestão deve informar, quando possível:

```text
ID:
Tipo: bug | melhoria | funcionalidade | conteúdo | operação
Origem: usuário | teste | Google Play | CrânIA | comunidade
Descrição:
Como reproduzir ou motivação:
Impacto:
Prioridade sugerida:
Estado: Relatado
Critérios de aceite:
Evidências e links públicos:
```

No fechamento de cada ciclo:

1. registrar novos bugs e sugestões;
2. reproduzir e priorizar bugs antes de selecionar funcionalidades;
3. obter aprovação do mantenedor para itens propostos;
4. associar apenas o que couber à próxima versão;
5. implementar, testar e validar;
6. atualizar versão, release notes e este roadmap;
7. mover para `Entregue` somente o que realmente foi publicado.

## Higiene do repositório público

Não devem ser versionados:

- senhas, tokens, chaves, keystores e credenciais de contas de serviço;
- `google-services.json`, `.env` real ou configurações privadas do Firebase;
- APK, AAB, builds, caches e relatórios locais;
- caminhos específicos da máquina do mantenedor;
- artefatos temporários de agentes ou automações;
- IDs privados da conta do Google Play e evidências com dados pessoais.

Identificadores públicos necessários ao funcionamento podem permanecer quando
não concedem acesso. Qualquer dúvida deve ser tratada como revisão de segurança
antes do commit.
