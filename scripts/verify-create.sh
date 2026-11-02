#!/usr/bin/env bash
# Verify tổng hợp trang #/create-file — server + browser chạy trong MỘT lần gọi
set -u
cd /home/z/my-project
mkdir -p /tmp/render

echo "=== 1. Khởi động dev server ==="
pkill -f "bun run dev" 2>/dev/null || true
pkill -f "agent-browser" 2>/dev/null || true
sleep 1
setsid nohup bun run dev > dev.log 2>&1 &
sleep 7

echo "=== 2. Smoke test HTTP ==="
curl -s -o /dev/null -w "create-file: %{http_code} (%{time_total}s)\n" --max-time 150 http://localhost:3000/create-file
curl -s -o /dev/null -w "hanzi-data 永: %{http_code}\n" "http://localhost:3000/hanzi-data/%E6%B0%B8.json"

SVG_Q='document.querySelectorAll("svg[aria-label^=\"Thứ tự nét\"]").length'
PP_Q='document.querySelectorAll(".print-only .print-page").length'

echo "=== 3. Browser desktop 1440px ==="
agent-browser set viewport 1440 900
agent-browser open http://localhost:3000/create-file
agent-browser wait --load networkidle
agent-browser wait 1500
echo "--- errors ---"
agent-browser errors || true
agent-browser screenshot /tmp/render/cf-01-std.png

agent-browser snapshot -i > /tmp/render/snap.txt 2>/dev/null || true
linefor() { rg "$1" /tmp/render/snap.txt | head -1; }

echo "--- refs ---"
linefor "Thứ tự nét"
linefor "Ô chữ lớn"
linefor "Hồng đào"

R_STROKE=$(linefor "Thứ tự nét" | sed -E 's/.*\[ref=(e[0-9]+)\].*/\1/')
R_BIG=$(linefor "Ô chữ lớn" | sed -E 's/.*\[ref=(e[0-9]+)\].*/\1/')
R_PINK=$(linefor "Hồng đào" | sed -E 's/.*\[ref=(e[0-9]+)\].*/\1/')
echo "stroke=@$R_STROKE big=@$R_BIG pink=@$R_PINK"

echo "=== 4. Bố cục THỨ TỰ NÉT ==="
if [ -n "$R_STROKE" ]; then agent-browser click "@$R_STROKE"; fi
agent-browser wait 2500
agent-browser errors || true
echo "svg stroke-order: $(agent-browser eval "$SVG_Q")"
echo "print pages: $(agent-browser eval "$PP_Q")"
agent-browser screenshot /tmp/render/cf-02-stroke.png

echo "=== 5. Bố cục Ô CHỮ LỚN + nền hồng ==="
if [ -n "$R_BIG" ]; then agent-browser click "@$R_BIG"; fi
agent-browser wait 2000
if [ -n "$R_PINK" ]; then agent-browser click "@$R_PINK"; fi
agent-browser wait 800
agent-browser errors || true
agent-browser screenshot /tmp/render/cf-03-bigchar-pink.png

echo "=== 6. Mobile 390px (về bố cục chuẩn) ==="
R_STD=$(rg "Chuẩn từng chữ" /tmp/render/snap.txt | head -1 | sed -E 's/.*\[ref=(e[0-9]+)\].*/\1/')
if [ -n "$R_STD" ]; then agent-browser click "@$R_STD"; fi
agent-browser set viewport 390 844
agent-browser open http://localhost:3000/create-file
agent-browser wait --load networkidle
agent-browser wait 1200
agent-browser errors || true
agent-browser screenshot /tmp/render/cf-04-mobile.png

echo "=== 7. Dọn dẹp ==="
agent-browser close || true
pkill -f "bun run dev" 2>/dev/null || true
echo "DONE"
