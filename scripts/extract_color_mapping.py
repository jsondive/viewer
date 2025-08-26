# conversion from color declarations in theme.css to YAML

import re
import yaml

with open("packages/library/src/styles/theme.css", "r") as fh:
  theme_contents = fh.read()

matches = re.findall(
  r"--json-dive-color([^\n]*?):\s*light-dark\(\s*(oklch\([^)]*\))",
  theme_contents,
  re.MULTILINE | re.DOTALL
)

result = {
  "theme-colors": {}
}

for (name_unstripped, color) in matches:
  name = name_unstripped.lstrip("-")
  result["theme-colors"][name] = color

print(yaml.dump(result))