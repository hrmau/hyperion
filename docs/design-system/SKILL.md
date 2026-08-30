---
name: gridgorilla-design
description: Use this skill to generate well-branded interfaces and assets for Grid Gorilla, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.
If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.
If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

Two rules specific to this system, before anything else:

1. **Every figure in `ui_kits/web/data.js` and the guideline cards is an unverified placeholder.** Never present them as real numbers. Query the real dataset.
2. **One hue, one accent.** The system is a single cold-slate ramp plus `--green`. If a design seems to need another colour, it needs another *value* — see VISUAL FOUNDATIONS → "The one-hue rule".
