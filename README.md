# Titrate - ICU & ED Clinical Reference

> Offline-capable Progressive Web App (PWA) combining the Chris Hani Baragwanath Academic Hospital ICU Dosing Card with the Helen Joseph Hospital Emergency Department Clinical Guidelines 2026.

Created by **Tashriq Hendricks** & **Kimi**.

---

## What's Inside

Titrate is a comprehensive clinical reference app for ICU and Emergency Department environments:

### ICU Dosing (Original 10 Categories)
- **Resuscitation**: Fluids, inotropes, vasopressors, resuscitation medications, cardioversion
- **Airway & Ventilation**: Intubation, vent settings, lung protection, RSI sedation, status asthmaticus
- **Sedation & Neuro**: Analgesia-first strategy, seizure management, neuroprotective agents
- **Antimicrobials**: Broad-spectrum antibiotics, gram-positive coverage, antifungals, antivirals, HIV/TB protocols
- **Metabolic & Nutrition**: Electrolyte management, hyperkalaemia protocols, nutrition, diuretics
- **Toxicology**: Antidotes, reversal agents, NAC protocol, withdrawal management
- **Formulae**: Inotrope calculations, anion gap, corrected sodium, respiratory indices
- **Cardiovascular**: Antihypertensives, heart failure, thrombolytics, anticoagulation
- **Blood Products**: Transfusion triggers, FFP, platelets, albumin
- **Endocrine**: Steroids, insulin, thyroid, other agents

### ED Protocols (New 5 Categories - 2026 HJH Guidelines)
- **ED Medical Emergencies**: ACS/STEMI, stroke, asthma, COPD, sepsis, pneumonia, PE, DVT, malaria, AF
- **ED Toxicology**: Organophosphates, paracetamol overdose, TCA, salicylates, warfarin reversal, toxidromes, toxic alcohols
- **ED Trauma**: Head injury, burns (Brooke formula), C-spine (NEXUS/Canadian), trauma primary survey, compartment syndrome
- **ED Metabolic**: DKA/HHS protocols, hyperkalaemia, hyponatraemia, hyperthermia, hypothermia, thyroid emergencies
- **ED Procedures**: AHA resuscitation algorithms, infusion protocols, procedural sedation, NIV settings, FAST/RUSH

### Features
- **2,071 clinical entries** across 16 categories
- **Real-time search** across all drugs, protocols, and scoring systems
- **Interactive inotrope calculators** for Adrenaline, Noradrenaline, and Dobutamine
- **Weight-based dose calculations** with patient weight input
- **Clinical badges**: First-line drugs, cautions, warnings, scoring systems, formulas
- **Favourites system**: Save frequently-used entries locally
- **Full offline support**: Works without internet after first load
- **Installable on home screen**: Behaves like a native app

---

## Live Web App

**URL**: `https://whitedevil-93.github.io/HelenJoesph/`

### To install on your phone:
1. Open the URL in your browser
2. **Android (Chrome)**: Tap menu (3 dots) -> "Add to Home Screen"
3. **iOS (Safari)**: Tap Share -> "Add to Home Screen"
4. The app installs and works completely offline

---

## Data Sources

All clinical data is derived from:
- **Chris Hani Baragwanath Academic Hospital ICU Dosing Card** (2024 updates)
- **Helen Joseph Tertiary Hospital Emergency Department Clinical Guidelines 2026**
  - Editor: Dr Jana du Plessis
  - Contributing authors: Dr P Saffy, Dr L Chadinha, Dr JP da Costa, Dr C Geldenhuys, Dr N Bruton

**Disclaimer**: This app is for clinical reference only. Always verify doses before administration. Guidelines are not intended to replace clinical judgement.

---

## Project Structure

```
Titrate/
|-- index.html              # Main app UI
|-- app.js                  # App logic, search, calculators
|-- data.json               # Clinical protocols (ICU + ED 2026)
|-- manifest.json           # PWA manifest
|-- service-worker.js       # Offline caching
|-- capacitor.config.json   # Capacitor configuration
|-- package.json            # Node dependencies
|-- icon-192.svg            # App icon (192x192)
|-- icon-512.svg            # App icon (512x512)
|-- README.md               # This file
```

---

## Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **PWA**: Service Worker, Web App Manifest
- **Native Wrapper**: Capacitor 6.x
- **CI/CD**: GitHub Actions
- **Icons**: SVG (scalable, lightweight)

---

## License

MIT

---

**Titrate v3.0** - ICU & ED Clinical Reference - 2026