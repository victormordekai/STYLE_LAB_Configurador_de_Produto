# STYLE LAB V0.7 — Pesquisa técnica e modelagem vetorizável

## 1. Decisão arquitetural

O STYLE LAB não deve usar uma imagem de camisa como "fundo" do editor. O produto deve ser um **modelo vetorial paramétrico**:

`SKU -> MOLDE -> FAMÍLIA -> PARÂMETROS -> SILHUETA -> ZONAS -> ARTE -> EXPORTAÇÃO`

A silhueta é uma única forma externa contínua. Costuras, painéis, raglan e gola são entidades internas, nunca a soma de retângulos/paths independentes que tentam formar a borda externa.

## 2. Repositórios avaliados

### A. soccer-jersey
**Pode incorporar:** ideia de API paramétrica de cores, estilos e frente/costas; SVG gerado deterministicamente.
**Não copiar como núcleo:** é um gerador de assets, não um editor industrial com superfícies e histórico.

### B. Print Designer / Fabric.js
**Pode incorporar:** padrões de serialização de objetos, persistência, administração e fluxo de editor.
**Não incorporar diretamente:** migrar o MVP para Fabric.js agora faria o projeto abandonar a vantagem de exportação SVG nativa e clip paths sem necessidade imediata.

### C. TShirtDesigner
**Pode incorporar:** UX de manipulação de texto/imagem como referência.
**Não copiar diretamente:** projeto está em reescrita e a arquitetura atual do STYLE LAB é semanticamente mais orientada ao produto.

### D. apparel-customizer
**Pode incorporar:** referência para componentização React + Fabric.js quando o editor virar produto SaaS.
**Não incorporar agora:** é um salto de framework, não uma correção necessária ao núcleo SVG atual.

### E. OpenClo
**Pode incorporar conceitualmente:** separação entre padrões, painéis, BOM, nesting, tech pack e IA por ferramentas.
**Referência arquitetural:** não transplantar o código do núcleo para o whiteboard atual; é uma plataforma muito mais ampla.

### F. GarmentCode
**Pode incorporar conceitualmente e futuramente por integração:** modelo paramétrico baseado em componentes/painéis/interfaces e parâmetros de medidas.
**Referência para o motor de modelagem:** é mais próximo de "modelagem concreta" que de um configurador visual.

### G. FreeSewing
**Pode incorporar conceitualmente:** padrões paramétricos em JavaScript e separação entre medidas, draft e output.
**Uso futuro:** backend/serviço de geração de moldes, não o renderizador do canvas.

### H. Costumy
**Referência arquitetural:** pipeline 2D -> 3D e simulação.
**Não incorporar diretamente ao MVP:** a licença GPL e a natureza de protótipo tornam a integração direta menos conveniente para um núcleo proprietário/comercial sem análise jurídica específica.

## 3. Matriz recomendada

| Camada | Base recomendada |
|---|---|
| Editor atual | SVG nativo do STYLE LAB |
| Interação futura | padrões de Fabric.js / Print Designer |
| Gerador de camisa | modelo paramétrico próprio + referência soccer-jersey |
| Modelagem concreta | princípios GarmentCode / FreeSewing |
| Produção/tech pack | arquitetura OpenClo como referência |
| 3D | Costumy apenas como estudo de pipeline |

## 4. Como fazer uma modelagem concreta e vetorizável

### 4.1 Não começar pelo desenho bonito

A geometria deve nascer de **pontos de referência mensuráveis**. Para uma camisa:

- `neckWidth`
- `shoulderDrop`
- `chestWidth`
- `waistWidth`
- `hemWidth`
- `bodyLength`
- `armholeDepth`
- `sleeveLength`
- `sleeveOpening`
- `collarDepth`
- `raglanDepth`

Esses parâmetros geram âncoras. As âncoras geram curvas. As curvas geram o path.

### 4.2 Caixa de modelagem normalizada

Cada molde usa uma drawing box, por exemplo `420 x 520`. Os valores são internos e independentes da resolução da tela.

### 4.3 Sequência geométrica correta

1. eixo central;
2. pontos de pescoço;
3. ombros;
4. cava;
5. manga;
6. lateral;
7. barra;
8. fechamento da silhueta;
9. costuras internas;
10. zonas de arte;
11. clip paths.

### 4.4 Estrutura de dados alvo

```js
{
  id: 'CAMISA_RAGGLAN_001',
  box: { width: 420, height: 520 },
  parameters: {
    chestWidth: 292,
    bodyLength: 430,
    shoulderDrop: 18,
    sleeveLength: 108,
    armholeDepth: 122
  },
  anchors: {},
  silhouette: 'M ... Z',
  seams: {},
  zones: {}
}
```

O `silhouette` pode ser cacheado, mas deve ser derivado dos parâmetros, não ser o único dado de verdade.

## 5. Evolução proposta

### V0.7
- bibliotecas de formas e escudos;
- inspector dinâmico;
- correção de exportação SVG;
- catálogo MOLDE/SKU;
- famílias básicas.

### V0.8
- zonas físicas: corpo frente, corpo costas, mangas, gola;
- limites de impressão por zona;
- catálogo real de produtos;
- serialização de projeto por schema versionado.

### V1
- backend de projetos;
- API do whiteboard;
- LLM -> operações JSON validadas;
- render técnico/comercial;
- tech pack.

### V2
- motor paramétrico de modelagem por medidas;
- nesting e consumo;
- integração MRP/ERP;
- simulação 3D opcional.
