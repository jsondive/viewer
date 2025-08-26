#!/bin/bash
set -xeo pipefail
python scripts/generate_colors_lint.py
python scripts/generate_colors_css.py
npx prettier --write packages/library/src/styles/colors.css
