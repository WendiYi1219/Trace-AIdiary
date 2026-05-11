#!/usr/bin/env bash
# 生成本页 hero 区可用的 H.264 MP4，便于 Chrome 等浏览器播放。
# 需要本机已安装 ffmpeg，例如: brew install ffmpeg
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IN="${ROOT}/assets/trace-ai-diary-demo.mov"
OUT="${ROOT}/assets/trace-ai-diary-demo.mp4"
if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "未找到 ffmpeg。请先安装: brew install ffmpeg" >&2
  exit 1
fi
if [[ ! -f "$IN" ]]; then
  echo "缺少输入文件: $IN" >&2
  exit 1
fi
echo "正在转码: $IN -> $OUT"
ffmpeg -y -i "$IN" \
  -c:v libx264 -crf 23 -preset medium -profile:v high -pix_fmt yuv420p \
  -c:a aac -b:a 128k -movflags +faststart \
  "$OUT"
echo "完成: $OUT"
