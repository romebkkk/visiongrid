# VisionGrid v2.0 👁️📐

> **Herramienta clínica de auto-monitorización macular con Rejilla de Amsler calibrada a 20º de campo visual mediante tarjeta física ISO/IEC 7810, Test de Sensibilidad al Contraste Pelli-Robson (Glaucoma) y Dossier Oftalmológico.** 100% en el navegador, privado, sin cookies y de código abierto.

[![Licencia MIT](https://img.shields.io/badge/licencia-MIT-blue.svg)](LICENSE)
[![Tests Clínicos v2](https://img.shields.io/badge/tests-7%20passed-brightgreen.svg)](test.js)
[![Calibración ISO 7810](https://img.shields.io/badge/óptica-calibrada%2020º%20macular-sky.svg)](#calibración-óptica)
[![100% In-Browser](https://img.shields.io/badge/privacidad-100%25%20local-emerald.svg)](index.html)

---

## 🎯 ¿Qué Novedades Trae la Versión 2.0?

En la versión 1.0, el tamaño de la rejilla en pantalla dependía de la resolución del monitor o móvil, distorsionando el ángulo visual subtendido.

En la **versión 2.0**:
1. **Calibración Óptica con Tarjeta Estándar (ISO/IEC 7810 ID-1):**
   - El usuario ajusta una tarjeta virtual en pantalla contra una tarjeta bancaria física o DNI (ancho mundial estandarizado: **85.60 mm**).
   - El sistema calcula los píxeles por milímetro reales de la pantalla y dibuja la Rejilla de Amsler a exactamente **10 × 10 cm**, garantizando que a 33 cm de distancia subtienda los **20 grados de campo macular central** prescritos por la oftalmología clínica.
2. **Mapeo Anatómico por Cuadrantes Retinianos:**
   - Clasificación topográfica de las marcas del paciente (cuadrante nasal, temporal, superior, inferior) y discriminación de afectación foveal (<3.5º de fijación central).
3. **Escala de Contraste Logarítmica Pelli-Robson (logCS):**
   - Cribado de pérdida precoz de sensibilidad al contraste, síntoma inicial característico del daño en el nervio óptico por **Glaucoma**.
4. **Dossier Estructurado para el Retinólogo:**
   - Generación de informe clínico listo para contrastar con una Tomografía de Coherencia Óptica (OCT) o angiografía fluoresceínica.

---

## 🚀 Pruebas Automatizadas

Ejecuta la suite de verificación con Node.js:
```bash
node test.js
```

---

## 🔒 Privacidad Radical
- Cero telemetría, cero almacenamiento en servidores.
- Funciona 100% desconectado de internet.

---

## 📄 Licencia
Licencia MIT. Copyright (c) 2026 DataFlow Elegance — Ismael Ben Kazem.
