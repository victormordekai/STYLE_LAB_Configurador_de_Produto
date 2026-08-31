/* STYLE LAB — Modeling Library V1
   Catálogo de modelagens e contrato de geometria paramétrica.
   Mantém separado: MOLDE (forma) -> SKU (material/aplicação).
*/
(function(global){
  const PRODUCTS=[
    {sku:'CAMISA_BASICA_001',tipo:'MOLDE',family:'shirt-basic',label:'Camisa básica',qtd_moldes:4,garment:'shirt'},
    {sku:'CAMISA_BASICA_003',tipo:'MOLDE',family:'shirt-basic-athletic',label:'Camisa básica atlética',qtd_moldes:5,garment:'shirt'},
    {sku:'CAMISA_BASICA_010',tipo:'MOLDE',family:'shirt-basic-premium',label:'Camisa básica premium',qtd_moldes:6,garment:'shirt'},
    {sku:'CAMISA_RAGGLAN_001',tipo:'MOLDE',family:'shirt-raglan',label:'Camisa raglan',qtd_moldes:7,garment:'shirt'},
    {sku:'CAMISA_RAGGLAN_002',tipo:'MOLDE',family:'shirt-raglan-athletic',label:'Camisa raglan atlética',qtd_moldes:8,garment:'shirt'},
    {sku:'CAMISETA_001',tipo:'MOLDE',family:'tshirt',label:'Camiseta',qtd_moldes:4,garment:'tshirt'},
    {sku:'CALCAO_001',tipo:'MOLDE',family:'shorts',label:'Calção',qtd_moldes:3,garment:'shorts'},
    {sku:'CALCA_001',tipo:'MOLDE',family:'pants',label:'Calça',qtd_moldes:4,garment:'pants'},
    {sku:'CAM-BAS-001',tipo:'SKU',tecido:'Dry Fit',cor_tecido:'BRANCO',aplicacao:'Sublimação + escudo do time',molde:'CAMISA_BASICA_001'},
    {sku:'CAM-BAS-002',tipo:'SKU',tecido:'Dry Fit',cor_tecido:'BRANCO',aplicacao:'Sublimação + escudo + patch',molde:'CAMISA_BASICA_001'},
    {sku:'CAM-BAS-004',tipo:'SKU',tecido:'Dry Fit',cor_tecido:'BRANCO',aplicacao:'Sublimação + escudo bordado',molde:'CAMISA_BASICA_001'},
    {sku:'CAM-BAS-005',tipo:'SKU',tecido:'Dry Fit',cor_tecido:'CORES',aplicacao:'Sublimação + escudo do time',molde:'CAMISA_BASICA_001'},
    {sku:'CAM-BAS-003',tipo:'SKU',tecido:'Dry Fit',cor_tecido:'BRANCO',aplicacao:'Sublimação + escudo do time',molde:'CAMISA_BASICA_003'},
    {sku:'CAM-BAS-006',tipo:'SKU',tecido:'Dry Fit',cor_tecido:'BRANCO',aplicacao:'Sublimação + escudo + patch',molde:'CAMISA_BASICA_003'},
    {sku:'CAM-BAS-007',tipo:'SKU',tecido:'Dry Fit Premium',cor_tecido:'BRANCO',aplicacao:'Sublimação + escudo bordado',molde:'CAMISA_BASICA_003'},
    {sku:'CAM-BAS-008',tipo:'SKU',tecido:'Dry Fit',cor_tecido:'CORES',aplicacao:'Sublimação + escudo do time',molde:'CAMISA_BASICA_003'},
    {sku:'CAM-BAS-009',tipo:'SKU',tecido:'Dry Fit',cor_tecido:'BRANCO',aplicacao:'Sublimação + patch frontal',molde:'CAMISA_BASICA_003'},
    {sku:'CAM-BAS-010',tipo:'SKU',tecido:'Dry Fit',cor_tecido:'BRANCO',aplicacao:'Sublimação + escudo do time',molde:'CAMISA_BASICA_010'},
    {sku:'CAM-BAS-011',tipo:'SKU',tecido:'Dry Fit',cor_tecido:'BRANCO',aplicacao:'Sublimação + escudo + patch',molde:'CAMISA_BASICA_010'},
    {sku:'CAM-BAS-012',tipo:'SKU',tecido:'Dry Fit Premium',cor_tecido:'BRANCO',aplicacao:'Sublimação + escudo bordado',molde:'CAMISA_BASICA_010'},
    {sku:'CAM-BAS-013',tipo:'SKU',tecido:'Dry Fit',cor_tecido:'CORES',aplicacao:'Sublimação + escudo do time',molde:'CAMISA_BASICA_010'},
    {sku:'CAM-BAS-014',tipo:'SKU',tecido:'Dry Fit',cor_tecido:'BRANCO',aplicacao:'Sublimação + dois patchs',molde:'CAMISA_BASICA_010'},
    {sku:'CAM-BAS-015',tipo:'SKU',tecido:'Dry Fit Premium',cor_tecido:'BRANCO',aplicacao:'Sublimação + escudo + patch',molde:'CAMISA_BASICA_010'},
    {sku:'CAM-RAG-001',tipo:'SKU',tecido:'Dry Fit',cor_tecido:'BRANCO',aplicacao:'Sublimação + escudo do time',molde:'CAMISA_RAGGLAN_001'},
    {sku:'CAM-RAG-003',tipo:'SKU',tecido:'Dry Fit',cor_tecido:'BRANCO',aplicacao:'Sublimação + escudo + patch',molde:'CAMISA_RAGGLAN_001'},
    {sku:'CAM-RAG-004',tipo:'SKU',tecido:'Dry Fit Premium',cor_tecido:'BRANCO',aplicacao:'Sublimação + escudo bordado',molde:'CAMISA_RAGGLAN_001'},
    {sku:'CAM-RAG-005',tipo:'SKU',tecido:'Dry Fit',cor_tecido:'CORES',aplicacao:'Sublimação + escudo do time',molde:'CAMISA_RAGGLAN_001'},
    {sku:'CAM-RAG-006',tipo:'SKU',tecido:'Dry Fit',cor_tecido:'BRANCO',aplicacao:'Sublimação + patch manga',molde:'CAMISA_RAGGLAN_001'},
    {sku:'CAM-RAG-007',tipo:'SKU',tecido:'Dry Fit',cor_tecido:'BRANCO',aplicacao:'Sublimação + dois patchs',molde:'CAMISA_RAGGLAN_001'},
    {sku:'CAM-RAG-008',tipo:'SKU',tecido:'Dry Fit Premium',cor_tecido:'BRANCO',aplicacao:'Sublimação + escudo + patch',molde:'CAMISA_RAGGLAN_001'},
    {sku:'CAM-RAG-002',tipo:'SKU',tecido:'Dry Fit',cor_tecido:'BRANCO',aplicacao:'Sublimação + escudo do time',molde:'CAMISA_RAGGLAN_002'},
    {sku:'CAM-RAG-009',tipo:'SKU',tecido:'Dry Fit',cor_tecido:'BRANCO',aplicacao:'Sublimação + escudo + patch',molde:'CAMISA_RAGGLAN_002'},
    {sku:'CAM-RAG-010',tipo:'SKU',tecido:'Dry Fit Premium',cor_tecido:'BRANCO',aplicacao:'Sublimação + escudo bordado',molde:'CAMISA_RAGGLAN_002'},
    {sku:'CAM-RAG-011',tipo:'SKU',tecido:'Dry Fit',cor_tecido:'CORES',aplicacao:'Sublimação + escudo do time',molde:'CAMISA_RAGGLAN_002'},
    {sku:'CAM-RAG-012',tipo:'SKU',tecido:'Dry Fit',cor_tecido:'BRANCO',aplicacao:'Sublimação + patch frontal',molde:'CAMISA_RAGGLAN_002'},
    {sku:'CAM-RAG-013',tipo:'SKU',tecido:'Dry Fit',cor_tecido:'BRANCO',aplicacao:'Sublimação + dois patchs',molde:'CAMISA_RAGGLAN_002'},
    {sku:'CAM-RAG-014',tipo:'SKU',tecido:'Dry Fit Premium',cor_tecido:'BRANCO',aplicacao:'Sublimação + escudo + patch',molde:'CAMISA_RAGGLAN_002'},
    {sku:'CAM-RAG-015',tipo:'SKU',tecido:'Dry Fit',cor_tecido:'CORES',aplicacao:'Sublimação + escudo + patch',molde:'CAMISA_RAGGLAN_002'}
  ];
  // Shape contracts use a normalized drawing box. Production-grade measurement parameters can later map to these anchors.
  const SHAPES={
    'shirt-basic':{kind:'shirt',raglan:false},
    'shirt-basic-athletic':{kind:'shirt',raglan:false,athletic:true},
    'shirt-basic-premium':{kind:'shirt',raglan:false,premium:true},
    'shirt-raglan':{kind:'shirt',raglan:true},
    'shirt-raglan-athletic':{kind:'shirt',raglan:true,athletic:true},
    'tshirt':{kind:'shirt',raglan:false,tshirt:true},
    'shorts':{kind:'shorts'},
    'pants':{kind:'pants'}
  };
  function getProduct(sku){return PRODUCTS.find(p=>p.sku===sku)||null;}
  function getMoldForSku(sku){const p=getProduct(sku);if(!p)return null;return p.tipo==='MOLDE'?p:PRODUCTS.find(x=>x.sku===p.molde)||null;}
  function listMolds(){return PRODUCTS.filter(p=>p.tipo==='MOLDE');}
  global.StyleLabModelingLibrary={PRODUCTS,SHAPES,getProduct,getMoldForSku,listMolds};
})(window);
