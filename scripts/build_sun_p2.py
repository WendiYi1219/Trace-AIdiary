"""从 assets/sun-source.png 生成去白底、去黄眼睛的 sun-focus-p2.png（不改动光晕与外形像素）。"""

from __future__ import annotations

import math
import sys
from collections import deque
from pathlib import Path

# 项目根下的 Pillow 或系统 pillow
_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_ROOT / ".venv_pillow"))


def chomp_fringe_whites(img, seed_rgb: int = 244, grow_rgb: int = 240) -> None:
    """
    从图像四边 BFS，将与「边缘」4-连通 且 偏亮的像素改为全透明。
    主体太阳内部 (254,250,235 等) 的 B<seed_rgb，不会与边缘 252+ 全连通，故保留。
    """
    w, h = img.size
    p = img.load()
    vis = bytearray(w * h)
    q: deque[tuple[int, int]] = deque()

    def on_edge(x: int, y: int) -> bool:
        t = p[x, y]
        if t[3] == 0:
            return False
        return t[0] >= seed_rgb and t[1] >= seed_rgb and t[2] >= seed_rgb

    def in_grow(t) -> bool:
        if t[3] == 0:
            return False
        return t[0] >= grow_rgb and t[1] >= grow_rgb and t[2] >= grow_rgb

    for x in range(w):
        for y in (0, h - 1):
            if on_edge(x, y):
                k = y * w + x
                if not vis[k]:
                    vis[k] = 1
                    q.append((x, y))
    for y in range(1, h - 1):
        for x in (0, w - 1):
            if on_edge(x, y):
                k = y * w + x
                if not vis[k]:
                    vis[k] = 1
                    q.append((x, y))

    while q:
        x, y = q.popleft()
        for dx, dy in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            nx, ny = x + dx, y + dy
            if 0 > nx or nx >= w or 0 > ny or ny >= h:
                continue
            k = ny * w + nx
            if vis[k] or not in_grow(p[nx, ny]):
                continue
            vis[k] = 1
            q.append((nx, ny))

    for i in range(w * h):
        if not vis[i]:
            continue
        x, y = i % w, i // w
        p[x, y] = (0, 0, 0, 0)


def main() -> None:
    from PIL import Image

    root = _ROOT
    src = root / "assets" / "sun-source.png"
    if not src.exists():
        src = root / "assets" / "sun-work.png"  # 可改名后的源
    if not src.is_file():
        raise SystemExit(f"需要源图: {root / 'assets' / 'sun-source.png'}")

    im = Image.open(src).convert("RGB")
    w, h = im.size
    px = im.load()

    # 1) 与画布边缘连通的 (255,255,255) → 白底
    is_bg = bytearray(w * h)
    q: deque[tuple[int, int]] = deque()
    for x in range(w):
        for y in (0, h - 1):
            if px[x, y] == (255, 255, 255):
                k = y * w + x
                if not is_bg[k]:
                    is_bg[k] = 1
                    q.append((x, y))
    for y in range(1, h - 1):
        for x in (0, w - 1):
            if px[x, y] == (255, 255, 255):
                k = y * w + x
                if not is_bg[k]:
                    is_bg[k] = 1
                    q.append((x, y))

    while q:
        x, y = q.popleft()
        for dx, dy in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h:
                nk = ny * w + nx
                if not is_bg[nk] and px[nx, ny] == (255, 255, 255):
                    is_bg[nk] = 1
                    q.append((nx, ny))

    CREAM = (254, 250, 235)
    EYE = (248, 214, 128)

    def d(a, b) -> float:
        return math.sqrt(float(sum((a[i] - b[i]) ** 2 for i in range(3))))

    # 2) 眼睛：从 (248,214,128) 起扩，不吃到高 B 的奶油/白
    vis: set[tuple[int, int]] = set()
    q2: deque[tuple[int, int]] = deque()
    for y in range(h):
        for x in range(w):
            if px[x, y] == EYE:
                vis.add((x, y))
                q2.append((x, y))
    TH = 18.0
    while q2:
        x, y = q2.popleft()
        for dx, dy in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            nx, ny = x + dx, y + dy
            if 0 > nx or nx >= w or 0 > ny or ny >= h or (nx, ny) in vis:
                continue
            t = px[nx, ny]
            if t == (255, 255, 255):
                continue
            if d(t, EYE) < TH and t[0] > 200 and t[2] < 190:
                vis.add((nx, ny))
                q2.append((nx, ny))

    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    o = out.load()
    for y in range(h):
        for x in range(w):
            k = y * w + x
            if is_bg[k]:
                continue
            r, g, b = px[x, y]
            if (x, y) in vis:
                r, g, b = CREAM
            o[x, y] = (r, g, b, 255)

    # 3) 与画布边缘 4-连通 的「近中灰/白」光晕（如 252,252,252）全透明，避免叠在色底上露白边
    chomp_fringe_whites(out, seed_rgb=244, grow_rgb=240)

    out_path = root / "assets" / "sun-focus-p2.png"
    out.save(out_path, "PNG", optimize=True)
    print(" wrote", out_path, out.size, "px eyes removed:", len(vis))


if __name__ == "__main__":
    main()
