# library_modeling

Camada de catálogo e contrato de modelagem do STYLE LAB.

- `modeling-library.js`: separa **MOLDE** de **SKU** e declara famílias básicas.
- A geometria vetorial continua em `garment-model/garment-model.js` porque o editor deve poder trocar/aperfeiçoar a geometria sem acoplá-la à UI.

## Regra de evolução

`SKU -> MOLDE -> FAMÍLIA -> PARÂMETROS GEOMÉTRICOS -> SILHUETA SVG -> ZONAS/CLIP PATH`
