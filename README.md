# LOCK{AID — STYLE LAB MVP v0.2

Revisão UX/UI do MVP com direção visual esportiva/editorial RETEAR/GABARDINE.

## Mudanças principais

- interface premium/editorial, com composição assimétrica e tipografia de alto contraste;
- canvas central tratado como showroom de produto;
- redução de aparência de "painel administrativo";
- biblioteca de objetos para patch, patrocínio, nome e numeração;
- drag & drop de objetos para dentro da camisa;
- objetos podem ser reposicionados por pointer drag;
- seleção e exclusão de objetos;
- upload de referência como camada de consulta;
- mockup SVG parametrizado;
- LOCK e estado do projeto;
- exportação JSON e SVG.

## Arquitetura

`index.html` — estrutura da experiência

`css/style.css` — sistema visual

`js/app.js` — estado, configuração, drag/drop e exportação

`data/library.json` — biblioteca industrial inicial

## Próxima camada

O próximo incremento não deve ser simplesmente "mais efeitos visuais". O salto correto é transformar o objeto arrastado em componente semântico:

PATCH → posição → tamanho → aplicação → regra industrial

PATROCÍNIO → posição → escala → técnica → área permitida

NOME → tipografia → posição → limite

NÚMERO → tipografia → posição → limite → gradação

Isso prepara a ponte entre UX/UI e o futuro Rule Engine / Motor de FT.
