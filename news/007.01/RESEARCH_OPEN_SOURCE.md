# Pesquisa técnica comparativa — STYLE LAB

Data da pesquisa: 30/08/2026.

## Conclusão executiva

Não há, nos repositórios examinados, um único projeto que entregue simultaneamente:

- modelagem vetorial paramétrica de vestuário;
- editor visual completo;
- clipping por zonas físicas;
- biblioteca de elementos;
- exportação SVG autossuficiente;
- catálogo/MRP;
- preparação para LLM.

A estratégia mais segura é composição arquitetural.

## 1. Fabric.js

Repositório: https://github.com/fabricjs/fabric.js

**Uso recomendado:** incorporar como infraestrutura futura do editor se o volume de interação ultrapassar o que SVG DOM puro suporta.

Pontos relevantes encontrados:
- move/scale/rotate/skew;
- shapes;
- patterns;
- JSON;
- SVG I/O;
- modularidade;
- testes;
- licença MIT.

**Pode incorporar:** conceito de scene graph, serialização, controles de transformação e arquitetura de objetos.

**Não substituiria agora:** o `garment-model` nem o `clipPath` por zonas, porque o modelo físico do produto continua sendo uma camada distinta.

## 2. Vue Printables

Repositório: https://github.com/vue-printables/vue-printables

**Uso recomendado:** referência muito direta para uma futura migração para Vue 3 + Fabric.js.

Pontos relevantes:
- design areas;
- clip paths;
- texto;
- imagens;
- JSON;
- exportação de alta resolução;
- licença MIT.

**Pode incorporar:** conceito de `designArea`/`clipPath` e separação entre área imprimível e canvas.

**Referência arquitetural:** se a V1 migrar para framework.

## 3. TShirtDesigner

Repositório: https://github.com/luciferreeves/TShirtDesigner

Licença declarada: MIT.

O projeto é explicitamente um T-shirt designer baseado em Fabric.js e está em reescrita; o repositório reporta 105 stars e 52 forks no momento da pesquisa.

**Pode incorporar:** ideias de UX e fluxo de editor.

**Não copiar diretamente:** o projeto não resolve o nosso modelo técnico de zonas e geometria de peça.

## 4. Soccer-Jersey

Repositório: https://github.com/nadchif/soccer-jersey

É um gerador de SVG de camisas com API de parâmetros como cor, estilo, direção, texto e frente/costas.

**Muito relevante para:** pensar o `GarmentDefinition` como função paramétrica.

**Pode incorporar:** catálogo de parâmetros e filosofia de geração SVG.

**Referência arquitetural:** mais que código de editor, é um exemplo de produto gerado por parâmetros.

## 5. Product-Customizer

Repositório: https://github.com/vivekup3424/Product-Customizer

O README declara customização de roupas, upload, preview e integração com OpenAI para geração de padrões/logos. Licença declarada: MIT.

**Pode incorporar:** conceito de IA como serviço auxiliar.

**Não incorporar:** exposição de chave da API no frontend. No STYLE LAB, a chave deve ficar no backend.

## 6. OpenClo.ai

Repositório: https://github.com/fwzhuang/openclo

O projeto declara uma cadeia ampla:

Paper Pattern → Auto-Trace → Digital Pattern → 3D Sewing → Simulation → Artwork → Grading → Nesting → BOM → Tech Pack.

Também declara ferramentas de linguagem natural, RAG, agente, SVG e DXF/AAMA.

**Muito relevante como referência de arquitetura futura.**

**Não recomendo incorporar agora:** a infraestrutura inteira. É uma escala muito maior que o MVP.

## 7. Costumy

Repositório: https://github.com/cdrinmatane/Costumy

Protótipo open source que transforma padrões 2D em vestuário 3D e usa FreeSewing para geração de padrões.

**Uso:** referência futura para a transição de modelagem 2D para simulação 3D.

## 8. Comunidade

Discussões em r/webdev mostram que product customizers de roupa normalmente acabam separando o problema em:
- template/modelo do produto;
- área personalizável;
- editor de objetos;
- renderização;
- persistência.

Também aparecem debates sobre o limite entre canvas 2D e texturização/3D quando é necessário envolver uma imagem em superfícies curvas.

Isso confirma a decisão de não confundir editor 2D com render 3D.

## Matriz de decisão

| Projeto | Editor | SVG | Garment CAD | Clipping | IA | Licença declarada | Papel |
|---|---:|---:|---:|---:|---:|---|---|
| Fabric.js | ★★★★★ | ★★★★ | — | ★★★ | — | MIT | incorporar infraestrutura futura |
| Vue Printables | ★★★★★ | ★★★ | — | ★★★★★ | — | MIT | referência direta |
| TShirtDesigner | ★★★★ | ★★★ | ★ | ★★ | — | MIT | referência UX/editor |
| Soccer-Jersey | ★★ | ★★★★★ | ★★ | — | — | consultar LICENSE | motor paramétrico |
| Product-Customizer | ★★★★ | ★★ | ★ | ★★ | ★★★ | MIT | referência IA |
| OpenClo.ai | ★★★★ | ★★★★★ | ★★★★★ | ★★★★ | ★★★★★ | MIT declarado | arquitetura futura |
| Costumy | ★★ | ★★ | ★★★★ | — | — | verificar licença do uso pretendido | referência 2D→3D |

## Decisão

### Incorporar agora

1. Modelo paramétrico próprio.
2. SVG como representação oficial.
3. `clipPath` por superfície.
4. biblioteca local de formas.
5. catálogo MRP como dado estruturado.
6. contrato JSON para IA.
7. exportação SVG autossuficiente.

### Incorporar depois

1. Fabric.js ou Konva para transformação avançada.
2. framework React/Vue.
3. backend de IA.
4. geração de padrões por LLM.
5. 3D/WebGPU.

### Manter apenas como referência

- OpenClo.ai como arquitetura de longo prazo.
- Costumy para eventual 2D→3D.
- projetos antigos de T-shirt como referência de UX e não como núcleo técnico.

## Licenciamento

"Open source" não significa automaticamente "copiar qualquer arquivo". Antes de incorporar código de terceiros:

1. conferir o arquivo LICENSE do commit/versão usada;
2. preservar avisos de copyright;
3. verificar dependências transitivas;
4. registrar origem e versão no inventário de software;
5. evitar copiar assets/imagens sem licença compatível.

O GitHub documenta que a licença e suas permissões/condições devem ser consideradas explicitamente.
