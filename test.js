/**
 * VisionGrid - Suite de verificación clínica y back-testing oftalmológico
 * Comando: node test.js
 */
'use strict';
var assert = require('assert');
var VisionGrid = require('./visiongrid.js');

var passed = 0;
function test(nombre, fn) {
  try {
    fn();
    passed++;
    console.log('  [OK] ' + nombre);
  } catch (e) {
    console.error('  [FAIL] ' + nombre + '\n         ' + e.message);
    process.exitCode = 1;
  }
}

console.log('=== 1. Back-testing: Rejilla de Amsler (DMAE / Mácula) ===');

test('Rejilla normal sin distorsiones resulta en estado normal', function () {
  var r = VisionGrid.evaluarAmsler({ lineasOnduladas: false, zonasBorradas: false, zonasMarcadas: [] });
  assert.strictEqual(r.normal, true);
  assert.strictEqual(r.urgencia, 'normal');
});

test('Detección de líneas onduladas activa urgencia oftalmológica para descartar DMAE húmeda', function () {
  var r = VisionGrid.evaluarAmsler({ lineasOnduladas: true });
  assert.strictEqual(r.normal, false);
  assert.strictEqual(r.urgencia, 'urgente');
  assert.ok(/METAMORFOPSIA/i.test(r.diagnosticoOrientativo));
  assert.ok(/48-72 horas/i.test(r.recomendacion));
});

test('Zonas marcadas en la fóvea central (cerca del centro 10,10) activan afectación central', function () {
  var r = VisionGrid.evaluarAmsler({
    zonasMarcadas: [{ x: 10, y: 11, tipo: 'borroso' }]
  });
  assert.strictEqual(r.afectacionCentralFoveal, true);
  assert.strictEqual(r.urgencia, 'urgente');
});

console.log('\n=== 2. Back-testing: Sensibilidad al Contraste (Glaucoma) ===');

test('Nivel de contraste 8 (óptimo, logCS 1.75) clasifica como óptimo', function () {
  var r = VisionGrid.evaluarContraste(8);
  assert.strictEqual(r.estado, 'optimo');
  assert.strictEqual(r.logCS, 1.75);
});

test('Nivel de contraste bajo (logCS < 1.25) alerta de posible sospecha de Glaucoma', function () {
  var r = VisionGrid.evaluarContraste(4); // Nivel 4 = logCS 0.75
  assert.strictEqual(r.estado, 'bajo');
  assert.ok(/Glaucoma|tonometría/i.test(r.mensajeClinico));
});

console.log('\n' + passed + ' tests oftalmológicos superados con éxito.');
