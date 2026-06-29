"""Remove bottom-right watermark from SplashRaw.png and save as Splash.png."""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "SplashRaw.png"
OUT = ROOT / "assets" / "Splash.png"


def main() -> None:
    img = Image.open(SRC).convert("RGBA")
    arr = np.array(img, dtype=np.float32)
    h, w = arr.shape[:2]

    patch_w, patch_h = 220, 220
    x0, y0 = w - patch_w, h - patch_h

    patch = arr[y0:h, x0:w].copy()
    ph, pw = patch.shape[:2]

    luma = patch[..., 0] * 0.299 + patch[..., 1] * 0.587 + patch[..., 2] * 0.114
    mask = luma > 55
    mask |= (luma > 35) & (patch[..., 3] > 200)

    mask_img = Image.fromarray((mask.astype(np.uint8) * 255))
    mask_img = mask_img.filter(ImageFilter.MaxFilter(7))
    mask = np.array(mask_img) > 127

    filled = patch.copy()
    yy, xx = np.mgrid[0:ph, 0:pw]

    left_col = arr[y0:h, x0 - 40 : x0].mean(axis=1)
    above_row = arr[y0 - 40 : y0, x0:w].mean(axis=0)

    for c in range(3):
        left_interp = left_col[:, c].astype(np.float32)
        top_interp = above_row[:, c].astype(np.float32)

        t_x = xx / max(pw - 1, 1)
        t_y = yy / max(ph - 1, 1)

        corner = arr[y0 - 60, x0 - 60, c]
        bottom_right = arr[h - 5, w - 5, c]

        ref = (
            (1 - t_x) * (1 - t_y) * corner
            + t_x * (1 - t_y) * top_interp
            + (1 - t_x) * t_y * left_interp
            + t_x * t_y * bottom_right
        )
        filled[..., c] = np.where(mask, ref, filled[..., c])

    filled[..., 3] = 255
    arr[y0:h, x0:w] = filled

    result = Image.fromarray(arr.astype(np.uint8), "RGBA")
    result.save(OUT, optimize=True)
    print(f"Saved {OUT} ({result.size[0]}x{result.size[1]}), masked {int(mask.sum())} px")


if __name__ == "__main__":
    main()
