#!/usr/bin/env bash
# 将前端设计区的 .mov 录屏转为 H.264 MP4，便于 Chrome 等浏览器播放。
# 需要本机已安装 ffmpeg，例如: brew install ffmpeg
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ASSETS="${ROOT}/assets"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "未找到 ffmpeg。请先安装: brew install ffmpeg" >&2
  exit 1
fi

encode_one() {
  local base="$1"
  local IN="${ASSETS}/${base}.mov"
  local OUT="${ASSETS}/${base}.mp4"
  if [[ ! -f "$IN" ]]; then
    echo "跳过（无源文件）: $IN" >&2
    return 0
  fi
  echo "正在转码: $IN -> $OUT"
  ffmpeg -y -i "$IN" \
    -c:v libx264 -crf 23 -preset medium -profile:v high -pix_fmt yuv420p \
    -vf "scale=-2:800" \
    -c:a aac -b:a 128k -movflags +faststart \
    "$OUT"
  echo "完成: $OUT"
}

for name in diary-writing calendar-feature 2ai-chat-video; do
  encode_one "$name"
done

echo "全部完成。"
