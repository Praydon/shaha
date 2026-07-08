from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "photos"
OUTPUT_DIR = ROOT / "photos-optimized"
WIDTHS = (480, 768, 1080, 1440)
IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp"}


def normalized_mode(image: Image.Image) -> Image.Image:
    has_alpha = image.mode in {"RGBA", "LA"} or (
        image.mode == "P" and "transparency" in image.info
    )

    if has_alpha:
        return image.convert("RGBA")

    return image.convert("RGB")


def resized_copy(image: Image.Image, target_width: int) -> Image.Image:
    if image.width <= target_width:
        return image.copy()

    target_height = round(image.height * (target_width / image.width))
    return image.resize((target_width, target_height), Image.Resampling.LANCZOS)


def output_base(source: Path) -> Path:
    relative = source.relative_to(SOURCE_DIR)
    category = relative.parent.as_posix()
    stem = source.stem
    return OUTPUT_DIR / category / stem / stem


def optimize_one(source: Path) -> dict[str, object]:
    with Image.open(source) as raw:
        image = normalized_mode(ImageOps.exif_transpose(raw))

    base = output_base(source)
    base.parent.mkdir(parents=True, exist_ok=True)

    files: list[str] = []

    for width in WIDTHS:
        candidate = resized_copy(image, width)

        for suffix, params in (
            (".avif", {"quality": 58, "speed": 6}),
            (".webp", {"quality": 84, "method": 6}),
        ):
            target = base.with_name(f"{base.name}-{width}w{suffix}")
            candidate.save(target, **params)
            files.append(str(target.relative_to(ROOT)).replace("\\", "/"))

    return {
        "source": str(source.relative_to(ROOT)).replace("\\", "/"),
        "width": image.width,
        "height": image.height,
        "outputs": files,
    }


def iter_images() -> list[Path]:
    images: list[Path] = []

    for source in SOURCE_DIR.rglob("*"):
        if not source.is_file():
            continue
        if source.name.startswith("._") or source.name == ".DS_Store":
            continue
        if source.suffix.lower() in IMAGE_SUFFIXES:
            images.append(source)

    return sorted(images)


def main() -> int:
    if not SOURCE_DIR.exists():
        print(f"Source folder not found: {SOURCE_DIR}", file=sys.stderr)
        return 1

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    optimized = [optimize_one(source) for source in iter_images()]
    manifest = {
        "source": "photos",
        "output": "photos-optimized",
        "widths": WIDTHS,
        "formats": ["avif", "webp"],
        "images": optimized,
        "video": {
            "source": "photos/video/lip-sync.MP4",
            "used_in_main_flow": False,
            "note": "Видео оставлено вне основного сайта, чтобы не ломать тихий тон.",
        },
    }

    manifest_path = OUTPUT_DIR / "manifest.json"
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    total_files = sum(len(item["outputs"]) for item in optimized)
    print(f"Optimized {len(optimized)} images into {total_files} files.")
    print(f"Manifest: {manifest_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
