# STYLE LAB MVP V0.7

Configurador vetorial de produto esportivo, sem dependências externas no runtime.

## Estrutura

```text
STYLE-LAB-MVP-V0.7/
├── index.html
├── style.css
├── script.js
├── library_forms/
│   ├── forms.js
│   └── forms.css
└── library_modeling/
    ├── modeling.js
    ├── modeling.css
    └── mrp-data.js
```

## O que foi corrigido nesta versão

- Biblioteca de padrões ampliada para 24 formas.
- Biblioteca de escudos com as opções representativas: 🛡️ 🔰 ⚜️ 🌐 ⛉ ⛨ ❤︎.
- Controle de tamanho contextual: ao selecionar qualquer elemento editável, o painel TAMANHO aparece.
- Texto, número e patrocínio alteram `fontSize` e escala do objeto proporcionalmente.
- Padrões e escudos alteram escala geométrica proporcionalmente.
- Elementos continuam associados semanticamente a `front` ou `back`.
- Arte recebe `clipPath` baseado na silhueta técnica do produto.
- Biblioteca de modelagens: camisa básica, ragglan/raglan, camiseta, calção e calça.
- Golas redonda, V e Polo na camada de modelagem de camisa.
- Catálogo MRP fornecido pelo projeto preservado em `mrp-data.js`.
- Exportação SVG reconstruída para ser autossuficiente: estilos calculados são embutidos e as cores principais são gravadas explicitamente.
- API pública `window.StyleLabDesignEngine` preparada para uma futura LLM.

## Execução

A versão atual é estática e pode ser aberta localmente em navegador moderno:

```text
index.html
```

Para um ambiente de desenvolvimento, recomenda-se um servidor estático simples.

## Contrato para IA

A LLM não deve escrever SVG arbitrário. Deve gerar operações:

```js
window.StyleLabDesignEngine.applyDesignOperations([
  { type: "setColor", slot: "primary", value: "#102A72" },
  { type: "addPattern", kind: "organic" },
  { type: "addShield", symbol: "shield" },
  {
    type: "addElement",
    element: {
      type: "sponsor",
      name: "PATROCÍNIO",
      target: "front",
      x: 180, y: 160,
      width: 260, height: 65,
      data: { text: "ACME", fontSize: 38 }
    }
  }
]);
```

A camada de validação do editor é responsável por executar as operações sobre o modelo.

## Observação industrial

As geometrias incluídas são **modelagens vetoriais base de interface**, não moldes industriais liberados para corte. Para uso produtivo, cada modelagem deve ser validada contra ficha técnica, medidas, gradação, tolerâncias, margens de costura e método de confecção.
