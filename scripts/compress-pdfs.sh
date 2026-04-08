#!/bin/bash
#
# Compress all activity PDFs for faster viewing/downloading.
# Uses Ghostscript /ebook preset (150dpi) - great for screens, ~90% smaller.
#
# Usage:
#   ./scripts/compress-pdfs.sh                    # dry run (show what would happen)
#   ./scripts/compress-pdfs.sh --run              # compress all PDFs
#   ./scripts/compress-pdfs.sh --run --quality printer   # 300dpi (larger but print-ready)
#
# Originals are kept in a backup folder. Compressed files replace the originals.

set -euo pipefail

GS="/opt/homebrew/bin/gs"
SOURCE_DIR="/Users/ameliedrouin/Desktop/Anywhere Learning/Activities"
BACKUP_DIR="/Users/ameliedrouin/Desktop/Anywhere Learning/Activities - Originals"

DRY_RUN=true
QUALITY="/ebook"  # /ebook = 150dpi, /printer = 300dpi, /screen = 72dpi

# Parse args
while [[ $# -gt 0 ]]; do
  case $1 in
    --run) DRY_RUN=false; shift ;;
    --quality) QUALITY="/$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

if ! command -v "$GS" &>/dev/null; then
  echo "Error: Ghostscript not found at $GS"
  echo "Install with: brew install ghostscript"
  exit 1
fi

echo "=== PDF Compression ==="
echo "Source:  $SOURCE_DIR"
echo "Quality: $QUALITY"
echo "Mode:    $(if $DRY_RUN; then echo 'DRY RUN (use --run to compress)'; else echo 'COMPRESSING'; fi)"
echo ""

# Create backup dir if needed
if ! $DRY_RUN; then
  mkdir -p "$BACKUP_DIR"
fi

total_before=0
total_after=0
count=0

while IFS= read -r -d '' pdf; do
  filename=$(basename "$pdf")
  size_before=$(stat -f%z "$pdf")
  size_before_mb=$(echo "scale=1; $size_before / 1048576" | bc)

  # Skip tiny files (under 5MB) - already small enough
  if [[ $size_before -lt 5242880 ]]; then
    echo "SKIP  ${filename} (${size_before_mb}MB - already small)"
    continue
  fi

  if $DRY_RUN; then
    echo "WOULD ${filename} (${size_before_mb}MB)"
    total_before=$((total_before + size_before))
    count=$((count + 1))
  else
    tmp="/tmp/compress_$$_${filename}"
    echo -n "COMP  ${filename} (${size_before_mb}MB) → "

    "$GS" -sDEVICE=pdfwrite \
      -dCompatibilityLevel=1.4 \
      -dPDFSETTINGS="$QUALITY" \
      -dNOPAUSE -dBATCH -dQUIET \
      -dNOSAFER \
      -sOutputFile="$tmp" \
      "$pdf" 2>/dev/null

    size_after=$(stat -f%z "$tmp")
    size_after_mb=$(echo "scale=1; $size_after / 1048576" | bc)
    savings=$(echo "scale=0; 100 - ($size_after * 100 / $size_before)" | bc)

    # Only replace if compressed is actually smaller
    if [[ $size_after -lt $size_before ]]; then
      cp "$pdf" "$BACKUP_DIR/$filename"
      mv "$tmp" "$pdf"
      echo "${size_after_mb}MB (${savings}% smaller)"
      total_before=$((total_before + size_before))
      total_after=$((total_after + size_after))
      count=$((count + 1))
    else
      rm "$tmp"
      echo "SKIP (compressed was larger)"
    fi
  fi
done < <(find "$SOURCE_DIR" -maxdepth 1 -name "*.pdf" -print0 | sort -z)

echo ""
echo "=== Summary ==="
echo "Files processed: $count"
if ! $DRY_RUN && [[ $count -gt 0 ]]; then
  total_before_mb=$(echo "scale=1; $total_before / 1048576" | bc)
  total_after_mb=$(echo "scale=1; $total_after / 1048576" | bc)
  total_savings=$(echo "scale=0; 100 - ($total_after * 100 / $total_before)" | bc)
  echo "Before: ${total_before_mb}MB"
  echo "After:  ${total_after_mb}MB"
  echo "Saved:  ${total_savings}%"
  echo ""
  echo "Originals backed up to:"
  echo "  $BACKUP_DIR"
fi
