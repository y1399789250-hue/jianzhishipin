import argparse
from pathlib import Path

from PIL import Image


def parse_key_color(value):
    raw = value.strip().lstrip("#")
    if len(raw) != 6:
        raise argparse.ArgumentTypeError("--key-color must be a hex RGB value like #00ff00")
    try:
        return tuple(int(raw[index : index + 2], 16) for index in (0, 2, 4))
    except ValueError as exc:
        raise argparse.ArgumentTypeError("--key-color must be a hex RGB value like #00ff00") from exc


def remove_key_background(image, key_color, threshold):
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    key_max = max(key_color)
    key_channels = [
        index
        for index, value in enumerate(key_color)
        if value >= key_max - 16 and value >= 128
    ]
    other_channels = [index for index in range(3) if index not in key_channels]

    for y in range(height):
        for x in range(width):
            channels = pixels[x, y]
            r, g, b, a = channels
            key_value = min(channels[index] for index in key_channels)
            other_value = max((channels[index] for index in other_channels), default=0)
            if key_value >= threshold and key_value > other_value * 1.25:
                pixels[x, y] = (r, g, b, 0)

    return rgba


def trim_transparent(image, padding):
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        return image

    left, top, right, bottom = bbox
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(image.width, right + padding)
    bottom = min(image.height, bottom + padding)
    return image.crop((left, top, right, bottom))


def split_sheet(source, output_dir, prefix, count, columns, key_color, threshold, padding):
    image = Image.open(source).convert("RGBA")
    columns = columns or count
    rows = (count + columns - 1) // columns
    cell_width = image.width // columns
    cell_height = image.height // rows

    output_dir.mkdir(parents=True, exist_ok=True)

    for index in range(count):
        column = index % columns
        row = index // columns
        crop = image.crop(
            (
                column * cell_width,
                row * cell_height,
                (column + 1) * cell_width,
                (row + 1) * cell_height,
            )
        )
        crop = remove_key_background(crop, key_color, threshold)
        crop = trim_transparent(crop, padding)
        out_path = output_dir / f"{prefix}-{index + 1:02d}.png"
        crop.save(out_path)
        print(f"wrote {out_path}")


def main():
    parser = argparse.ArgumentParser(description="Split a character sheet into transparent PNG layers.")
    parser.add_argument("source", type=Path, help="Source sprite sheet image")
    parser.add_argument("output_dir", type=Path, help="Output directory")
    parser.add_argument("prefix", help="Output filename prefix")
    parser.add_argument("count", type=int, help="Number of characters to export")
    parser.add_argument("--columns", type=int, default=None, help="Number of columns in the sheet. Defaults to count.")
    parser.add_argument("--key-color", type=parse_key_color, default=(0, 255, 0), help="Chroma key color, for example #00ff00 or #ff00ff")
    parser.add_argument("--green-threshold", type=int, default=170, help="Deprecated alias for --key-threshold, kept for old commands")
    parser.add_argument("--key-threshold", type=int, default=None, help="Key channel threshold, 0-255")
    parser.add_argument("--padding", type=int, default=12, help="Padding kept around trimmed alpha bounds")
    args = parser.parse_args()

    if args.count <= 0:
        raise SystemExit("count must be > 0")

    if not args.source.exists():
        raise SystemExit(f"source not found: {args.source}")

    key_threshold = args.key_threshold if args.key_threshold is not None else args.green_threshold
    if not 0 <= key_threshold <= 255:
        raise SystemExit("--key-threshold must be between 0 and 255")

    split_sheet(
        args.source,
        args.output_dir,
        args.prefix,
        args.count,
        args.columns,
        args.key_color,
        key_threshold,
        args.padding,
    )


if __name__ == "__main__":
    main()
