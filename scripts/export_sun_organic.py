"""从 assets/sun-organic-source.png 去白/浅灰格底，输出 assets/sun-organic.png（Figma 有机太阳外轮廓）。"""

from __future__ import annotations

import sys
from collections import deque
from pathlib import Path

_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_ROOT / ".venv_pillow"))


def main() -> None:
    from PIL import Image

    root = _ROOT
    src = root / "assets" / "sun-organic-source.png"
    if not src.is_file():
        raise SystemExit("缺少 assets/sun-organic-source.png")

    im = Image.open(src).convert("RGBA")
    w, h = im.size
    p = im.load()

    def clear(x: int, y: int) -> None:
        t = p[x, y]
        p[x, y] = (0, 0, 0, 0)

    # 1) 与四边 4-连通 的 #ffffff 变透明
    is_rm = bytearray(w * h)
    q: deque[tuple[int, int]] = deque()
    for x in range(w):
        for y in (0, h - 1):
            if p[x, y] == (255, 255, 255, 255):
                k = y * w + x
                if not is_rm[k]:
                    is_rm[k] = 1
                    q.append((x, y))
    for y in range(1, h - 1):
        for x in (0, w - 1):
            if p[x, y] == (255, 255, 255, 255):
                k = y * w + x
                if not is_rm[k]:
                    is_rm[k] = 1
                    q.append((x, y))
    while q:
        x, y = q.popleft()
        for dx, dy in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            nx, ny = x + dx, y + dy
            if 0 > nx or nx >= w or 0 > ny or ny >= h:
                continue
            k = ny * w + nx
            if is_rm[k] or p[nx, ny] != (255, 255, 255, 255):
                continue
            is_rm[k] = 1
            q.append((nx, ny))
    for i in range(w * h):
        if is_rm[i]:
            x, y = i % w, i // w
            clear(x, y)

    # 2) 从透明区域 4-连通 吃掉邻接的「极亮中性」像素（浅灰格/白边，太阳橙区 B 低不会扩进去）
    def is_very_light(t) -> bool:
        if t[3] == 0:
            return False
        r, g, b, _ = t
        if r < 238 or g < 238 or b < 238:
            return False
        return (max(r, g, b) - min(r, g, b)) < 22

    vis = bytearray(w * h)
    q2: deque[tuple[int, int]] = deque()
    for y in range(h):
        for x in range(w):
            if p[x, y][3] == 0:
                k = y * w + x
                vis[k] = 1
                q2.append((x, y))
    while q2:
        x, y = q2.popleft()
        for dx, dy in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            nx, ny = x + dx, y + dy
            if 0 > nx or nx >= w or 0 > ny or ny >= h:
                continue
            t = p[nx, ny]
            if t[3] == 0:
                continue
            if not is_very_light(t):
                continue
            nk = ny * w + nx
            if vis[nk]:
                continue
            vis[nk] = 1
            clear(nx, ny)
            q2.append((nx, ny))

    out = root / "assets" / "sun-organic.png"
    im.save(out, "PNG", optimize=True)
    print("wrote", out, im.size)


if __name__ == "__main__":
    main()
