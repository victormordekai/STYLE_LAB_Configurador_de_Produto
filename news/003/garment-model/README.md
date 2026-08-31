# Technical Garment Model V1

This module owns only the industrial/vector garment geometry.

- `garment-model.js`: SVG geometry and parametric construction.
- `garment-model.css`: garment-only visual styling and construction variants.

## Integration

Load `garment-model.css` after the main application stylesheet and `garment-model.js` before the application script.

```html
<link rel="stylesheet" href="garment-model/garment-model.css">
<script src="garment-model/garment-model.js"></script>
<script src="script.js"></script>
```

Then mount:

```js
StyleLabGarmentModel.mount(productLayer, 'front', 70, 55, 1, {
  primary:'#173f8f', secondary:'#e31e3f', detail:'#00c3ff',
  fit:'regular', sleeve:'short', collar:'round'
});
```
