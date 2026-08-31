# Arquitetura técnica — STYLE LAB V0.7

## 1. Separação de responsabilidades

```text
library_modeling
        │
        ├── geometria
        ├── zonas físicas
        ├── variantes de modelagem
        └── catálogo MRP
                 │
                 ▼
script.js
        │
        ├── estado
        ├── histórico
        ├── interação
        ├── camadas
        ├── superfície
        ├── clipping
        ├── exportação
        └── contrato de IA
                 ▲
                 │
library_forms
        │
        ├── padrões
        └── escudos
```

## 2. Regra de ouro

A arte não deve conhecer a geometria industrial.

A geometria define:

```js
{
  silhouette,
  zones,
  constructionLines
}
```

O editor define:

```js
{
  target: "front" | "back",
  x, y,
  width, height,
  rotation,
  sizePercent
}
```

O `clipPath` faz a ponte.

## 3. Vetorização

Uma modelagem concreta deve começar por uma silhueta única:

```text
P0 → ombro → cava → manga → punho
                  ↓
               lateral
                  ↓
                barra
                  ↓
               lateral
                  ↓
              manga/cava
                  ↓
               ombro → P0
```

Use curvas Bézier cúbicas apenas onde existe mudança de curvatura. Não se deve aproximar toda a peça com dezenas de pequenos segmentos.

### Coordenadas recomendadas

Trabalhar primeiro em uma caixa técnica local, por exemplo:

```text
largura = 420
altura  = 520
```

Depois aplicar:

```text
translate(x,y) scale(s)
```

no produto.

Isso permite trocar a modelagem sem reescrever o editor.

## 4. Critérios geométricos

Para uma camisa esportiva básica:

- eixo central em x = 210;
- ombros simétricos em torno do eixo;
- largura do tronco maior que a largura da gola;
- manga conectada diretamente à cava;
- barra levemente curva;
- comprimento corporal proporcionalmente menor que a versão anterior;
- nenhuma linha de costura deve substituir a silhueta;
- linhas internas não podem funcionar como contorno externo;
- gola é elemento interno, não extensão da silhueta.

## 5. Clipping

A hierarquia visual é:

```text
produto
└── superfície
    ├── clipPath
    └── artwork
        ├── padrão
        ├── escudo
        ├── nome
        ├── número
        └── patrocínio
```

O artwork nunca é renderizado fora da superfície.

## 6. Exportação

O SVG exportado não pode depender de:

- CSS externo;
- variáveis CSS do documento;
- classes que só existem na página;
- estado visual do editor.

Por isso `prepareSvgExport()`:

1. clona o SVG;
2. remove seleção e grade;
3. mantém `defs` e `clipPath`;
4. resolve estilos computados;
5. grava cores fundamentais explicitamente;
6. serializa XML completo.

Isso corrige o caso em que o SVG aberto isoladamente aparecia preto.

## 7. Evolução para zonas

A V0.7 usa `front` e `back`.

A próxima expansão natural:

```text
front-body
back-body
left-sleeve
right-sleeve
collar
left-panel
right-panel
short-front
short-back
pants-front
pants-back
```

Cada zona poderá receber:

```js
{
  id,
  printable,
  clipPath,
  allowedElements,
  safeArea,
  bleed,
  productionMethod
}
```

Isso aproxima o STYLE LAB de um configurador de produto real.

## 8. IA

Arquitetura desejada:

```text
Usuário
  ↓
LLM
  ↓
Design Operations JSON
  ↓
Schema Validator
  ↓
StyleLabDesignEngine
  ↓
Product Model + Surface Engine
  ↓
SVG editável
```

Nunca:

```text
Usuário
  ↓
LLM
  ↓
SVG arbitrário
```

A segunda arquitetura permite que a IA corrompa a geometria.
