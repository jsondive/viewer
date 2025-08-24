import yaml

config_file_name = "packages/shared-config/src/sharedESLintConfig.js"

with open(config_file_name, "r") as fh:
  config_file_lines = fh.readlines()

with open("color-mapping.yml", "r") as fh:
  color_mapping = yaml.load(fh, Loader=yaml.CLoader)

new_colors_list = "\n".join([f"\t\"--json-dive-color-{name}\"," for name in color_mapping["semantic-colors"]])

with open(config_file_name, "w") as out_fh:
  inside_colors_config = False
  for line in config_file_lines:
    if "END: Colors" in line:
      inside_colors_config = False
      print(new_colors_list, file=out_fh)

    if not inside_colors_config:
      print(line, file=out_fh, end="")

    if "BEGIN: Colors" in line:
      inside_colors_config = True
