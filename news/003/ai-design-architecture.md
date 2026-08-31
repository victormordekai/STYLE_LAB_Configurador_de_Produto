# STYLE LAB — AI Design Engine Architecture

The browser must never contain a provider API key.

Recommended flow:

1. User writes: "camisa azul marinho com faixas diagonais vermelhas e detalhes ciano".
2. Front-end sends prompt + current product schema to `/api/design/plan`.
3. Backend calls an LLM and requests strict JSON only.
4. Backend validates JSON against the STYLE LAB design schema.
5. Front-end converts JSON operations into existing SVG layers.
6. All generated layers keep `target: front|back` and are clipped by the technical garment silhouette.

Example output:

```json
{
  "operations": [
    {"type":"setColor","slot":"primary","value":"#0A2D8F"},
    {"type":"addPattern","target":"front","kind":"slashes","x":80,"y":120,"width":340,"height":140,"rotation":-12},
    {"type":"addText","target":"back","text":"PLAYER","x":690,"y":120,"width":180,"height":55}
  ]
}
```

For photorealistic rendering, use a separate image/rendering model. The LLM should control the parametric SVG editor; the renderer should create a presentation preview from a locked product image plus the final artwork. Never let an image model silently redefine garment geometry.
