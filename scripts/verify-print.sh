#!/usr/bin/env bash
# Kiểm tra bản in PDF (print CSS + watermark + nền màu)
set -u
cd /home/z/my-project
mkdir -p /tmp/render

pkill -f "bun run dev" 2>/dev/null || true
pkill -f "agent-browser" 2>/dev/null || true
sleep 1
setsid nohup bun run dev > dev.log 2>&1 &
sleep 7
curl -s -o /dev/null -w "create-file: %{http_code}\n" --max-time 120 http://localhost:3000/create-file

agent-browser set viewport 1440 900
agent-browser open http://localhost:3000/create-file
agent-browser wait --load networkidle
agent-browser wait 1500

agent-browser snapshot -i > /tmp/render/snap2.txt 2>/dev/null || true
R_BIG=$(rg "Ô chữ lớn" /tmp/render/snap2.txt | head -1 | sed -E 's/.*\[ref=(e[0-9]+)\].*/\1/')
R_PINK=$(rg "Hồng đào" /tmp/render/snap2.txt | head -1 | sed -E 's/.*\[ref=(e[0-9]+)\].*/\1/')
R_BUTTER=$(rg "Vàng bơ" /tmp/render/snap2.txt | head -1 | sed -E 's/.*\[ref=(e[0-9]+)\].*/\1/')
R_STROKE=$(rg "Thứ tự nét" /tmp/render/snap2.txt | head -1 | sed -E 's/.*\[ref=(e[0-9]+)\].*/\1/')

# Ô chữ lớn + nền vàng bơ + watermark → in PDF
if [ -n "$R_BIG" ]; then agent-browser click "@$R_BIG"; fi
agent-browser wait 1500
if [ -n "$R_BUTTER" ]; then agent-browser click "@$R_BUTTER"; fi
agent-browser wait 800
agent-browser pdf /tmp/render/print-bigchar.pdf
echo "pdf-bigchar saved"

# Thứ tự nét + nền hồng → in PDF
agent-browser open http://localhost:3000/create-file
agent-browser wait --load networkidle
agent-browser wait 1200
agent-browser snapshot -i > /tmp/render/snap3.txt 2>/dev/null || true
R_STROKE=$(rg "Thứ tự nét" /tmp/render/snap3.txt | head -1 | sed -E 's/.*\[ref=(e[0-9]+)\].*/\1/')
R_PINK=$(rg "Hồng đào" /tmp/render/snap3.txt | head -1 | sed -E 's/.*\[ref=(e[0-9]+)\].*/\1/')
if [ -n "$R_STROKE" ]; then agent-browser click "@$R_STROKE"; fi
agent-browser wait 1800
if [ -n "$R_PINK" ]; then agent-browser click "@$R_PINK"; fi
agent-browser wait 800
agent-browser pdf /tmp/render/print-stroke.pdf
echo "pdf-stroke saved"

agent-browser close || true
pkill -f "bun run dev" 2>/dev/null || true
echo "DONE"
