from pathlib import Path
text=Path(r"work/20250902_work (2) (7)/index.html").read_text(encoding='utf-8')
start=text.index('<div class="calendar-header outlook-header">')
print(repr(text[start:start+200]))
