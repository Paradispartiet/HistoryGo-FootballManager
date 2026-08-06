from pathlib import Path

path = Path("src/app.js")
source = path.read_text()
anchor = "  const canSelect = !isSelected && !locked;\n"
start = source.find(anchor)
if start < 0:
    raise SystemExit("Training program canSelect anchor missing")
block_start = source.find("  if (canSelect) {", start)
if block_start < 0:
    raise SystemExit("Interactive card block missing")
brace_start = source.find("{", block_start)
depth = 0
block_end = None
for index in range(brace_start, len(source)):
    char = source[index]
    if char == "{":
        depth += 1
    elif char == "}":
        depth -= 1
        if depth == 0:
            block_end = index + 1
            break
if block_end is None:
    raise SystemExit("Could not resolve interactive card block")
replacement = '  if (canSelect) card.classList.add("is-selectable");'
source = source[:block_start] + replacement + source[block_end:]
path.write_text(source)
