#!/usr/bin/env python3
"""
Build script: converts data/ai-usage.yaml -> output/site/data.json

Run from the project root:
    python scripts/build.py

Requirements:
    pip install pyyaml
"""

import json
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    print("ERROR: pyyaml is required. Run: pip install pyyaml")
    sys.exit(1)


def build():
    root = Path(__file__).parent.parent
    data_file = root / "data" / "ai-usage.yaml"
    output_file = root / "output" / "site" / "data.json"

    if not data_file.exists():
        print(f"ERROR: Data file not found: {data_file}")
        sys.exit(1)

    with open(data_file, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    output_file.parent.mkdir(parents=True, exist_ok=True)

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    feature_count = len(data.get("product_features", []))
    subprocessor_count = len(data.get("subprocessors", []))
    version = data.get("meta", {}).get("version", "unknown")

    print(f"Built {output_file}")
    print(f"  Version: {version}")
    print(f"  Product features: {feature_count}")
    print(f"  Subprocessors: {subprocessor_count}")


if __name__ == "__main__":
    build()
