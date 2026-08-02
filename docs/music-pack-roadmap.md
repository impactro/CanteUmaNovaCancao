# Roadmap de pacotes de músicas

Este documento planeja uma evolução futura. A versão 3.3.50 continua usando o
catálogo embarcado atual e não implementa pacotes, backend ou sincronização.

## Objetivo

Permitir catálogos independentes e verificáveis sem perder o funcionamento
offline, a simplicidade do aplicativo e a confiança de quem publica ou instala
conteúdo.

## Contrato proposto

Cada pacote deverá possuir:

- identificador e versão imutáveis;
- nome, descrição, idioma e autores responsáveis;
- músicas com identificadores estáveis, letras, cifras e referências de áudio;
- proveniência de cada texto, cifra, imagem e gravação;
- licença e autorização explícitas, incluindo limites de redistribuição;
- hashes dos arquivos e assinatura digital do manifesto;
- versão mínima compatível do aplicativo e data de publicação.

## Fluxos futuros

1. **Pacote oficial:** produzido e assinado pelo mantenedor, instalado como
   atualização validada do catálogo.
2. **Importação do usuário:** seleção consciente de um arquivo local, validação,
   prévia e confirmação antes de gravar.
3. **Edição local:** cópia privada de letra/cifra, sem alterar silenciosamente o
   pacote de origem.
4. **Uso offline:** instalação transacional, catálogo sempre legível e áudio
   opcional, com tamanho e espaço necessário exibidos antes do download.
5. **Atualização:** comparar versões e hashes, baixar para área temporária,
   validar assinatura e só então trocar a versão ativa.

## Segurança e conflitos

- nunca executar código contido em pacote;
- bloquear caminhos relativos, arquivos inesperados e tamanhos abusivos;
- rejeitar pacote com hash ou assinatura inválidos;
- manter a última versão válida para rollback;
- resolver colisões por identificador do pacote + identificador da música;
- preservar alterações locais do usuário separadas do conteúdo distribuído;
- pedir decisão explícita quando uma atualização conflitar com edição local.

## Backend opcional

Um backend poderá futuramente publicar índice, metadados e URLs temporárias,
mas não será requisito para abrir catálogos já instalados. A API deverá permitir
cache, espelhamento e retomada de download. CDN e fallback só serão escolhidos
após medir custo, disponibilidade e direitos sobre os áudios.

## Gates antes de implementar

- revisão jurídica das licenças e autorizações;
- definição do formato e esquema versionado;
- modelo de assinatura e rotação de chaves;
- política de tamanho, armazenamento e limpeza;
- protótipo de instalação/rollback sem perda do catálogo atual;
- testes de conflito, corrupção, versão incompatível e operação sem rede.
