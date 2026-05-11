#!/usr/bin/env bash
# 把 assets/trace-ai-diary-demo.mp4 重新压到适合 GitHub Pages / Web 加载的大小。
# 目标：< 50MB，720p 长边，H.264 + AAC，Web 友好（faststart）。
# 用法：bash scripts/shrink-trace-demo.sh
# 依赖：ffmpeg（macOS：brew install ffmpeg）

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${ROOT}/assets/trace-ai-diary-demo.mp4"
TMP="${ROOT}/assets/trace-ai-diary-demo.web.mp4"
BAK="${ROOT}/assets/trace-ai-diary-demo.original.mp4"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "未找到 ffmpeg。macOS 安装：brew install ffmpeg" >&2
  exit 1
fi

if [[ ! -f "$SRC" ]]; then
  echo "缺少输入文件: $SRC" >&2
  exit 1
fi

echo "原始大小:"
ls -lh "$SRC" | awk '{print "  " $5 "  " $9}'

echo "开始压缩（CRF 28，长边 1280，AAC 96k）..."
# 长边限制 1280：保持比例，宽高里更长的那一边压到 1280；偶数对齐。
ffmpeg -y -i "$SRC" \
  -vf "scale='if(gt(iw,ih),min(1280,iw),-2)':'if(gt(ih,iw),min(1280,ih),-2)'" \
  -c:v libx264 -crf 28 -preset medium -profile:v high -pix_fmt yuv420p \
  -c:a aac -b:a 96k -movflags +faststart \
  "$TMP"

if [[ ! -f "${BAK}" ]]; then
  echo "首次运行: 把原始 ${SRC} 备份为 ${BAK} (已加入 .gitignore, 不会推到 GitHub)"
  mv "${SRC}" "${BAK}"
else
  echo "已存在备份 ${BAK}, 覆盖当前 ${SRC}"
  rm -f "${SRC}"
fi

mv "${TMP}" "${SRC}"

echo "完成 OK"
ls -lh "${SRC}" | awk '{print "  " $5 "  " $9}'

NEW_BYTES=$(stat -f%z "${SRC}")
if (( NEW_BYTES > 100 * 1024 * 1024 )); then
  echo "⚠️  仍超过 100MB（GitHub 单文件上限）。可再调小：把脚本里的 crf 改成 30 或长边改成 1080。" >&2
  exit 2
fi
if (( NEW_BYTES > 50 * 1024 * 1024 )); then
  echo "ℹ️  介于 50–100MB：可以推 GitHub 但会有警告。可继续推。"
fi
