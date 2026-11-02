#!/usr/bin/env bash
# Đồng bộ dữ liệu thứ tự nét chữ Hán từ package hanzi-writer-data ra public/
# (web fetch tĩnh, không bundle — xem src/components/create/stroke-char.tsx)
set -e
cd "$(dirname "$0")/.."
if [ ! -d node_modules/hanzi-writer-data ]; then
  bun add hanzi-writer-data
fi
mkdir -p public/hanzi-data
cp node_modules/hanzi-writer-data/*.json public/hanzi-data/
echo "Đã đồng bộ $(ls public/hanzi-data | wc -l) ký tự vào public/hanzi-data"
