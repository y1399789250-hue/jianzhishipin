import argparse
from pathlib import Path

from PIL import Image


def alpha_report(path):
    image = Image.open(path).convert("RGBA")
    alpha = image.getchannel("A")
    values = list(alpha.getdata())
    total = len(values)
    transparent = sum(1 for value in values if value == 0)
    partial = sum(1 for value in values if 0 < value < 255)
    opaque = total - transparent - partial

    return {
        "file": str(path),
        "size": f"{image.width}x{image.height}",
        "transparent_pct": transparent / total * 100,
        "partial_pct": partial / total * 100,
        "opaque_pct": opaque / total * 100,
    }


def main():
    parser = argparse.ArgumentParser(description="Report alpha-channel coverage for PNG layer assets.")
    parser.add_argument("paths", nargs="+", type=Path, help="PNG files or directories")
    args = parser.parse_args()

    files = []
    for path in args.paths:
        if path.is_dir():
            files.extend(sorted(path.glob("*.png")))
        else:
            files.append(path)

    for file_path in files:
        if not file_path.exists():
            print(f"missing: {file_path}")
            continue

        report = alpha_report(file_path)
        print(
            f"{report['file']} | {report['size']} | "
            f"transparent={report['transparent_pct']:.1f}% | "
            f"partial={report['partial_pct']:.1f}% | "
            f"opaque={report['opaque_pct']:.1f}%"
        )


if __name__ == "__main__":
    main()
