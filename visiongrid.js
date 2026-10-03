/*!
 * VisionGrid v1.0.0 — Prevención de ceguera (Rejilla de Amsler interactiva y Test de Contraste)
 * Open-source macular degeneration (AMD) & contrast sensitivity screening tool.
 *
 * Copyright (c) 2026 DataFlow Elegance - Ismael Ben Kazem
 * Licencia MIT · 100% en el navegador · Basado en la Rejilla de Amsler (1945) y Pelli-Robson
 *
 * BASES OFTALMOLÓGICAS:
 *  - Detección de metamorfopsias (líneas onduladas) en mácula: clave para detectar DMAE húmeda precoz
 *  - Detección de pérdida de contraste: marcador precoz de Glaucoma y neuropatía óptica
 *
 * AVISO IMPORTANTE:
 *  Herramienta de cribado y auto-monitorización visual domiciliaria.
 *  NO sustituye una revisión oftalmológica completa con lámpara de hendidura y medición de PIO.
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

  var VERSION = '1.0.0';

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
   * Evalúa los resultados de la Rejilla de Amsler
   * @param {object} params - { lineasOnduladas: bool, zonasBorradas: bool, zonasMarcadas: Array<{x:number, y:number, tipo:string}> }
   */
  function evaluarAmsler(params) {
    params = params || {};
    var onduladas = !!params.lineasOnduladas;
    var borradas = !!params.zonasBorradas;
    var marcas = Array.isArray(params.zonasMarcadas) ? params.zonasMarcadas : [];

    var tieneAnomalia = onduladas || borradas || marcas.length > 0;

    // Distinguir afección central (fóvea) vs periférica (cuadrícula 20x20, centro en 10,10)
    var esCentral = false;
    marcas.forEach(function (m) {
      var distCentro = Math.sqrt(Math.pow(m.x - 10, 2) + Math.pow(m.y - 10, 2));
      if (distCentro <= 3.5) esCentral = true;
    });

    var urgencia = 'normal';
    var diagnosticoOrientativo = 'Rejilla sin distorsiones percibidas.';
    var recomendacion = 'Todo correcto. Repite este test una vez al mes para vigilar tu salud macular.';

    if (onduladas || esCentral) {
      urgencia = 'urgente';
      diagnosticoOrientativo = 'Sospecha de METAMORFOPSIA MACULAR (distorsión de líneas rectas).';
      recomendacion = 'La percepción de líneas torcidas u onduladas en el centro de la visión es el síntoma cardinal de la Degeneración Macular Asociada a la Edad (DMAE húmeda) o membrana epirretiniana. Acude a una revisión con tu OFTALMÓLOGO en menos de 48-72 horas.';
    } else if (borradas || marcas.length > 0) {
      urgencia = 'preferente';
      diagnosticoOrientativo = 'Sospecha de ESCOTOMA PARACENTRAL (zona ciega o mancha oscura).';
      recomendacion = 'Se perciben sombras o falta de definición en la cuadrícula. Solicita cita con oftalmología para estudio de fondo de ojo y Tomografía de Coherencia Óptica (OCT).';
    }

    return {
      normal: !tieneAnomalia,
      tieneAnomalia: tieneAnomalia,
      metamorfopsia: onduladas,
      escotoma: borradas,
      afectacionCentralFoveal: esCentral,
      totalZonasMarcadas: marcas.length,
      urgencia: urgencia,
      diagnosticoOrientativo: diagnosticoOrientativo,
      recomendacion: recomendacion
    };
  }

  /**
   * Evalúa la sensibilidad al contraste
   * @param {number} nivelAlcanzado - Nivel de 1 a 8
   */
  function evaluarContraste(nivelAlcanzado) {
    var lvl = Math.max(1, Math.min(8, parseInt(nivelAlcanzado, 10) || 1));
    var info = NIVELES_CONTRASTE[lvl - 1];

    var estado = 'optimo';
    var mensaje = 'Sensibilidad al contraste en rango saludable (logCS >= 1.65).';

    if (info.logCS < 1.25) {
      estado = 'bajo';
      mensaje = 'Sensibilidad al contraste reducida significativamente. Puede ser un indicio precoz de Glaucoma, catarata incipiente o patología del nervio óptico. Se recomienda revisión oftalmológica con tonometría (presión intraocular).';
    } else if (info.logCS < 1.60) {
      estado = 'moderado';
      mensaje = 'Sensibilidad al contraste en límite inferior normal. Vigila cambios en visión nocturna o con deslumbramientos.';
    }

    return {
      nivelAlcanzado: lvl,
      contrasteMinimoPct: info.contrastePct,
      logCS: info.logCS,
      estado: estado,
      mensajeClinico: mensaje
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
    evaluarAmsler: evaluarAmsler,
    evaluarContraste: evaluarContraste,
    guardarRevision: guardarRevision,
    obtenerHistorial: obtenerHistorial
  };
});
