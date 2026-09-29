import re, urllib.request, pathlib

URL = "https://raw.githubusercontent.com/rubengarciam/kai/main/CHANGELOG.md"
OUT = pathlib.Path("_includes/changelogs/kai.md")

md = urllib.request.urlopen(URL).read().decode()

md = re.sub(r"^# Changelog[\s\S]*?(?=## )", "", md)        # drop H1 + intro
md = re.sub(r"## Unreleased[\s\S]*?(?=## \[)", "", md)      # drop Unreleased section
md = re.sub(r"(?m)^## \[", "### [", md)                     # demote version headings
md = re.sub(r"\]\((?!https?://)([^)]+)\)",
            r"](https://github.com/rubengarciam/kai/blob/main/\1)", md)  # fix relative links

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(md.strip() + "\n")
