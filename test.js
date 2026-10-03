/**
 * Test Suite para VisionGrid v2.0.0 - Validación clínica de Amsler, calibración ISO 7810 y contraste
 */

const assert = require('assert');
const VisionGrid = require('./visiongrid');

console.log('--- INICIANDO TESTS CLÍNICOS DE VISIONGRID v2.0.0 ---');

// Test 1: Calibración óptica de pantalla mediante tarjeta estándar ISO 7810 (85.6 mm)
const calib = VisionGrid.calibrarPantallaISO(340, 33); // 340px para 85.6mm = ~3.97 px/mm
assert.strictEqual(calib.calibrado, true);
assert.strictEqual(calib.esOpticoValido, true);
assert.ok(calib.tamanoRejillaAmslerPx > 350);
assert.ok(calib.anguloVisualGrados >= 16 && calib.anguloVisualGrados <= 20);
console.log('✅ Test 1 Superado: Calibración óptica con tarjeta ISO 7810 garantiza campo macular validado a 33 cm.');

// Test 2: Rejilla de Amsler completamente normal
const amslerNormal = VisionGrid.evaluarAmsler({
  lineasOnduladas: false,
  zonasBorradas: false,
  zonasMarcadas: []
});
assert.strictEqual(amslerNormal.normal, true);
assert.strictEqual(amslerNormal.urgencia, 'normal');
console.log('✅ Test 2 Superado: Rejilla sin distorsiones evaluada como normal.');

// Test 3: Metamorfopsia central foveal (distorsión de líneas en radio < 3.5 celdas del centro)
const amslerFoveal = VisionGrid.evaluarAmsler({
  lineasOnduladas: true,
  zonasBorradas: false,
  zonasMarcadas: [{ x: 10, y: 11, tipo: 'ondulada' }] // muy cerca del centro 10,10
});
assert.strictEqual(amslerFoveal.normal, false);
assert.strictEqual(amslerFoveal.metamorfopsia, true);
assert.strictEqual(amslerFoveal.afectacionCentralFoveal, true);
assert.strictEqual(amslerFoveal.urgencia, 'urgente');
console.log('✅ Test 3 Superado: Metamorfopsia foveal clasificada como URGENTE (alerta DMAE húmeda).');

// Test 4: Escotoma perifoveal en cuadrante superior izquierdo
const amslerEscotoma = VisionGrid.evaluarAmsler({
  lineasOnduladas: false,
  zonasBorradas: true,
  zonasMarcadas: [{ x: 4, y: 4, tipo: 'borrada' }]
});
assert.strictEqual(amslerEscotoma.normal, false);
assert.strictEqual(amslerEscotoma.escotoma, true);
assert.strictEqual(amslerEscotoma.cuadrantesAfectados.superiorIzquierdo, true);
console.log('✅ Test 4 Superado: Escotoma paracentral mapeado por cuadrantes retinianos.');

// Test 5: Sensibilidad al contraste Pelli-Robson normal
const contNormal = VisionGrid.evaluarContraste(8);
assert.strictEqual(contNormal.estado, 'optimo');
assert.ok(contNormal.logCS >= 1.65);
console.log('✅ Test 5 Superado: Contraste óptimo verificado.');

// Test 6: Sensibilidad al contraste reducida patológica (sospecha Glaucoma)
const contBajo = VisionGrid.evaluarContraste(3);
assert.strictEqual(contBajo.estado, 'bajo');
assert.ok(contBajo.mensajeClinico.includes('Glaucoma'));
console.log('✅ Test 6 Superado: Detección de pérdida de sensibilidad al contraste para Glaucoma.');

// Test 7: Generación de dossier clínico para el retinólogo
const dossier = VisionGrid.generarDossierRetinologo({
  ojo: 'derecho',
  amsler: { lineasOnduladas: true, zonasBorradas: false, zonasMarcadas: [{ x: 10, y: 10 }] },
  contrasteNivel: 7
});
assert.ok(dossier.textoPlano.includes('VISIONGRID v2.0'));
assert.ok(dossier.textoPlano.includes('ALERTA DMAE'));
console.log('✅ Test 7 Superado: Dossier clínico para retinólogo estructurado fielmente.');

console.log('\n--- TODOS LOS 7 TESTS DE VISIONGRID v2.0.0 SUPERADOS EXITOSAMENTE ---');
