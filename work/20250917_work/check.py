# -*- coding: utf-8 -*-
from pathlib import Path
text = Path("real-mouse-click-fix.js").read_text(encoding="utf-8")
print("anchor?", "���� ���콺" in text)
print(text.find("���� ���콺"))
