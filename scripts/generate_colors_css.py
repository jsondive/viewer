import yaml

with open("color-mapping.yml", "r") as fh:
  color_mapping = yaml.load(fh, Loader=yaml.CLoader)

with open("packages/library/src/styles/colors.css", "w") as out_fh:
  print(":root {", file=out_fh)

  for (semantic_name, color_name) in color_mapping["semantic-colors"].items():
    resolved_color = color_mapping["theme-colors"][color_name]
    print(f"\t--json-dive-color-{semantic_name}: {resolved_color}; /* {color_name} */", file=out_fh)

  print("}", file=out_fh)
