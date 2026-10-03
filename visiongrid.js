/*!
 * VisionGrid v2.0.0 — Prevención de ceguera (Rejilla de Amsler con calibración física ISO 7810 y Pelli-Robson)
 * Open-source macular degeneration (AMD) & contrast sensitivity clinical screening tool.
 *
 * Copyright (c) 2026 DataFlow Elegance - Ismael Ben Kazem
 * Licencia MIT · 100% en el navegador · Basado en Marc Amsler (1945) y Pelli-Robson (1988)
 *
 * BASES OFTALMOLÓGICAS:
 *  - Detección de metamorfopsias maculares centrales/paracentrales para DMAE húmeda
 *  - Calibración del ángulo visual (20º de campo macular a 33 cm) mediante estándar ISO/IEC 7810 (tarjeta 85.6 mm)
 *  - Medición logarítmica de sensibilidad al contraste (logCS) para sospecha precoz de Glaucoma
 *
 * AVISO IMPORTANTE:
 *  Herramienta de cribado y auto-monitorización visual domiciliaria.
 *  NO sustituye una revisión oftalmológica completa con lámpara de hendidura, tonometría de aplanación ni OCT.
 */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.VisionGrid = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var VERSION = '2.0.0';

  // Dimensiones físicas de tarjeta bancaria / DNI (Estándar ISO/IEC 7810 ID-1)
  var ANCHO_TARJETA_ESTANDAR_MM = 85.60;
  var ALTO_TARJETA_ESTANDAR_MM = 53.98;
  var TAMANO_REJILLA_AMSLER_ESTANDAR_MM = 100.0; // 10 cm x 10 cm estándar

  /**
   * Niveles de contraste estándar (Pelli-Robson adaptado)
   * Contraste (%) = |L_letra - L_fondo| / L_fondo
   * logCS = log10(1 / Contraste)
   */
  var NIVELES_CONTRASTE = [
    { nivel: 1, contrastePct: 100, logCS: 0.00, hexColor: '#000000', dificultad: 'Muy fácil' },
    { nivel: 2, contrastePct: 56, logCS: 0.25, hexColor: '#707070', dificultad: 'Fácil' },
    { nivel: 3, contrastePct: 31, logCS: 0.50, hexColor: '#B0B0B0', dificultad: 'Moderado' },
    { nivel: 4, contrastePct: 18, logCS: 0.75, hexColor: '#D1D1D1', dificultad: 'Intermedio' },
    { nivel: 5, contrastePct: 10, logCS: 1.00, hexColor: '#E5E5E5', dificultad: 'Avanzado' },
    { nivel: 6, contrastePct: 5.6, logCS: 1.25, hexColor: '#F0F0F0', dificultad: 'Fino' },
    { nivel: 7, contrastePct: 3.1, logCS: 1.50, hexColor: '#F7F7F7', dificultad: 'Muy fino (límite clínico)' },
    { nivel: 8, contrastePct: 1.8, logCS: 1.75, hexColor: '#FAFAFA', dificultad: 'Óptimo' }
  ];

  /**
   * Calibra las dimensiones físicas de la pantalla mediante tarjeta ISO 7810
   * @param {number} anchoTarjetaPx - Ancho en píxeles medido por el usuario en pantalla
   * @param {number} distanciaOjoCm - Distancia de visualización en cm (por defecto 33 cm)
   */
  function calibrarPantallaISO(anchoTarjetaPx, distanciaOjoCm) {
    var px = Math.max(100, Math.min(1000, parseFloat(anchoTarjetaPx) || 300));
    var distCm = Math.max(20, Math.min(60, parseFloat(distanciaOjoCm) || 33));

    var pxPorMm = px / ANCHO_TARJETA_ESTANDAR_MM;
    var rejillaAmslerPx = Math.round(pxPorMm * TAMANO_REJILLA_AMSLER_ESTANDAR_MM);

    // Ángulo visual subtendido: theta = 2 * arctan( (tamanoRejillaMm / 2) / (distanciaMm) )
    var semiAnchoMm = TAMANO_REJILLA_AMSLER_ESTANDAR_MM / 2; // 50 mm
    var distMm = distCm * 10;
    var anguloRadianes = 2 * Math.atan(semiAnchoMm / distMm);
    var anguloGrados = Math.round(anguloRadianes * (180 / Math.PI) * 10) / 10;

    return {
      calibrado: true,
      pxPorMm: Math.round(pxPorMm * 100) / 100,
      dpiEstimado: Math.round(pxPorMm * 25.4),
      tamanoRejillaAmslerPx: rejillaAmslerPx,
      distanciaCm: distCm,
      anguloVisualGrados: anguloGrados,
      esOpticoValido: (anguloGrados >= 15 && anguloGrados <= 22) // Campo macular foveal/parafoveal (~17º-20º)
    };
  }

  /**
   * Evalúa los resultados de la Rejilla de Amsler
   * Cuadrícula de 20x20 celdas (centro en x=10, y=10)
   */
  function evaluarAmsler(params) {
    params = params || {};
    var onduladas = !!params.lineasOnduladas;
    var borradas = !!params.zonasBorradas;
    var marcas = Array.isArray(params.zonasMarcadas) ? params.zonasMarcadas : [];

    var tieneAnomalia = onduladas || borradas || marcas.length > 0;

    // Distinguir afección central foveal (radio <= 3.5 celdas) vs cuadrantes
    var esCentral = false;
    var cuadrantesAfectados = {
      superiorDerecho: false,
      superiorIzquierdo: false,
      inferiorDerecho: false,
      inferiorIzquierdo: false
    };

    marcas.forEach(function (m) {
      var distCentro = Math.sqrt(Math.pow(m.x - 10, 2) + Math.pow(m.y - 10, 2));
      if (distCentro <= 3.5) esCentral = true;

      if (m.y < 10 && m.x >= 10) cuadrantesAfectados.superiorDerecho = true;
      if (m.y < 10 && m.x < 10) cuadrantesAfectados.superiorIzquierdo = true;
      if (m.y >= 10 && m.x >= 10) cuadrantesAfectados.inferiorDerecho = true;
      if (m.y >= 10 && m.x < 10) cuadrantesAfectados.inferiorIzquierdo = true;
    });

    var urgencia = 'normal';
    var diagnosticoOrientativo = 'Rejilla sin distorsiones percibidas.';
    var recomendacion = 'Todo correcto. Repite este test una vez al mes para vigilar tu salud macular.';

    if (onduladas || esCentral) {
      urgencia = 'urgente';
      diagnosticoOrientativo = 'Sospecha de METAMORFOPSIA MACULAR CENTRAL (distorsión de líneas rectas en fóvea).';
      recomendacion = 'La percepción de líneas torcidas u onduladas en el centro de la visión es el síntoma cardinal de la Degeneración Macular Asociada a la Edad (DMAE húmeda) o membrana epirretiniana. Acude a una revisión con tu OFTALMÓLOGO en menos de 48-72 horas.';
    } else if (borradas || marcas.length > 0) {
      urgencia = 'preferente';
      diagnosticoOrientativo = 'Sospecha de ESCOTOMA PARACENTRAL (zona ciega o mancha oscura perifoveal).';
      recomendacion = 'Se perciben sombras o falta de definición en la cuadrícula. Solicita cita con oftalmología para estudio de fondo de ojo y Tomografía de Coherencia Óptica (OCT).';
    }

    return {
      normal: !tieneAnomalia,
      tieneAnomalia: tieneAnomalia,
      metamorfopsia: onduladas,
      escotoma: borradas,
      afectacionCentralFoveal: esCentral,
      cuadrantesAfectados: cuadrantesAfectados,
      totalZonasMarcadas: marcas.length,
      urgencia: urgencia,
      diagnosticoOrientativo: diagnosticoOrientativo,
      recomendacion: recomendacion
    };
  }

  /**
   * Evalúa la sensibilidad al contraste Pelli-Robson
   * @param {number} nivelAlcanzado - Nivel de 1 a 8
   */
  function evaluarContraste(nivelAlcanzado) {
    var lvl = Math.max(1, Math.min(8, parseInt(nivelAlcanzado, 10) || 1));
    var info = NIVELES_CONTRASTE[lvl - 1];

    var estado = 'optimo';
    var mensaje = 'Sensibilidad al contraste en rango saludable (logCS >= 1.65).';

    if (info.logCS < 1.25) {
      estado = 'bajo';
      mensaje = 'Sensibilidad al contraste reducida significativamente. Puede ser un indicio precoz de Glaucoma, catarata incipiente o patología del nervio óptico. Se recomienda revisión oftalmológica con tonometría (presión intraocular) y campimetría visual computarizada.';
    } else if (info.logCS < 1.60) {
      estado = 'moderado';
      mensaje = 'Sensibilidad al contraste en límite inferior normal. Vigila cambios en visión nocturna o dificultad con deslumbramientos.';
    }

    return {
      nivelAlcanzado: lvl,
      contrasteMinimoPct: info.contrastePct,
      logCS: info.logCS,
      estado: estado,
      mensajeClinico: mensaje
    };
  }

  /**
   * Genera el dossier estructurado para el retinólogo / oftalmólogo
   */
  function generarDossierRetinologo(datos) {
    var amsler = evaluarAmsler(datos.amsler);
    var contraste = evaluarContraste(datos.contrasteNivel);
    var ojo = (datos.ojo || 'ambos').toUpperCase();
    var fecha = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

    var texto = [
      '===================================================================',
      '        VISIONGRID v2.0 - REPORTE DE AUTO-MONITORIZACIÓN MACULAR',
      '===================================================================',
      'Fecha: ' + fecha,
      'Ojo evaluado: ' + ojo,
      '',
      '1. RESULTADO REJILLA DE AMSLER (10x10 cm a 33 cm - 20º campo foveal):',
      '  - Estado: ' + (amsler.normal ? 'NORMAL (Sin anomalías)' : 'ANORMAL / ALTERADO'),
      '  - Metamorfopsias (líneas onduladas): ' + (amsler.metamorfopsia ? 'SÍ (ALERTA DMAE)' : 'No'),
      '  - Escotoma (mancha ciega): ' + (amsler.escotoma ? 'SÍ' : 'No'),
      '  - Afectación foveal central: ' + (amsler.afectacionCentralFoveal ? 'SÍ (<3.5º de fijación)' : 'No'),
      '  - Cuadrantes con marcas: ' + amsler.totalZonasMarcadas + ' zonas señaladas.',
      '  - Juicio clínico preliminar: ' + amsler.diagnosticoOrientativo,
      '',
      '2. SENSIBILIDAD AL CONTRASTE (PELLI-ROBSON ADAPTADO):',
      '  - Puntuación alcanzada: Nivel ' + contraste.nivelAlcanzado + ' / 8',
      '  - logCS mínimo percibido: ' + contraste.logCS + ' (Contraste ' + contraste.contrasteMinimoPct + '%)',
      '  - Clasificación: ' + contraste.estado.toUpperCase(),
      '  - Orientación: ' + contraste.mensajeClinico,
      '',
      '3. AVISO PARA CONSULTA MÉDICA:',
      'Lleve este informe a su oftalmólogo o retinólogo. Este cribado orientativo no sustituye una lámpara de hendidura ni una Tomografía de Coherencia Óptica (OCT).',
      '==================================================================='
    ].join('\n');

    return {
      fecha: fecha,
      amsler: amsler,
      contraste: contraste,
      textoPlano: texto
    };
  }

  // ------------------------------------------------------------------ Histórico Local
  var STORAGE_KEY = 'visiongrid_historial_v1';

  function guardarRevision(datos) {
    if (typeof localStorage === 'undefined') return false;
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var lista = raw ? JSON.parse(raw) : [];
      lista.push({
        id: 'vg_' + Date.now(),
        fecha: new Date().toISOString(),
        ojo: datos.ojo || 'ambos',
        amsler: datos.amsler,
        contraste: datos.contraste
      });
      if (lista.length > 30) lista = lista.slice(-30);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
      return true;
    } catch (e) {
      return false;
    }
  }

  function obtenerHistorial() {
    if (typeof localStorage === 'undefined') return [];
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  return {
    VERSION: VERSION,
    NIVELES_CONTRASTE: NIVELES_CONTRASTE,
    calibrarPantallaISO: calibrarPantallaISO,
    evaluarAmsler: evaluarAmsler,
    evaluarContraste: evaluarContraste,
    generarDossierRetinologo: generarDossierRetinologo,
    guardarRevision: guardarRevision,
    obtenerHistorial: obtenerHistorial
  };
});
