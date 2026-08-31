# STYLE LAB MVP V0.6 — Continuous Garment + Surface Design Engine

## Arquivo principal atualizado

A evolução desta versão está concentrada em `script.js`.

O novo motor JavaScript foi reescrito para separar claramente:

1. **Product Model** — geometria continua em `garment-model/garment-model.js`.
2. **Surface Engine** — frente e costas são superfícies físicas independentes.
3. **Artwork Engine** — cada elemento pertence semanticamente a uma superfície.
4. **Clip Engine** — toda a arte é renderizada dentro de um grupo SVG recortado pela silhueta da peça.
5. **Interaction Engine** — seleção, drag, transferência entre frente/costas, escala e rotação.
6. **Layer Engine** — visibilidade, bloqueio, duplicação, exclusão e ordenação.
7. **History Engine** — undo/redo por snapshots transacionais.
8. **Export Engine** — SVG, PNG e JSON.
9. **AI Contract** — API pública `window.StyleLabDesignEngine.applyDesignOperations()` para futura integração segura com backend/LLM.

## Regra estrutural principal

Nenhum elemento visual é mais tratado apenas como um objeto solto do canvas.

Cada elemento possui:

```js
{
  id: "...",
  target: "front" | "back",
  type: "pattern" | "text" | "number" | "sponsor" | "shape" | "image"
}
```

Na renderização, os elementos são agrupados assim:

```text
artworkLayer
├── artwork-front   → clip-path(front shirt silhouette)
└── artwork-back    → clip-path(back shirt silhouette)
```

Assim, mesmo que um padrão, imagem ou texto ultrapasse geometricamente a camisa, a parte externa não é exibida.

## IA / LLM

A página não deve expor uma API key no navegador.

A futura integração recomendada é:

```text
Browser → Backend seguro → LLM
                  ↓
          JSON de operações
                  ↓
      StyleLabDesignEngine
                  ↓
      SVG editável e recortado
```

Exemplo de operação:

```js
window.StyleLabDesignEngine.applyDesignOperations([
  { type: "setColor", slot: "primary", value: "#102A72" },
  {
    type: "addElement",
    element: {
      type: "pattern",
      name: "FAIXAS DIAGONAIS",
      target: "front",
      x: 150,
      y: 170,
      width: 300,
      height: 120,
      rotation: -10,
      data: { kind: "slashes" }
    }
  }
]);
```
