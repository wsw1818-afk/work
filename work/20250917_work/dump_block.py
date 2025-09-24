# -*- coding: utf-8 -*-
from pathlib import Path
text = Path("real-mouse-click-fix.js").read_text(encoding="utf-8")
block_start = text.find("if (target && e.isTrusted) { //")
print(text[block_start:block_start+1600].encode('unicode_escape').decode())
