# -*- coding: utf-8 -*-
from pathlib import Path
text = Path("real-mouse-click-fix.js").read_text(encoding="utf-8")
print("anchor?", "실제 마우스" in text)
print(text.find("실제 마우스"))
