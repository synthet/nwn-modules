Scaffold a new NWScript file with the correct prefix and includes. Follow `.cursor/skills/nwscript-authoring/SKILL.md`.

## Input

Required after the command: prefix and name, e.g. `/new-script sys merchant` or `/new-script qst blacksmith_quest`.

Valid prefixes: `inc`, `db`, `sys`, `evt`, `qst`, `adm`, `plc`, `cre`, `trg`.

## Steps

1. Validate prefix and derive filename: `<prefix>_<name>.nss`
2. Place in `src/scripts/` (or `include/db/` for `db_*` repository includes named `inc_db_*`)
3. Add standard header comment and minimal `void main()` or dispatcher stub
4. Add appropriate `#include` lines matching sibling files
5. Compile with MCP `nwn.script.diagnostics` or `bash tools/compile-scripts.sh`

## Template

```nss
// <Brief description>
#include "inc_log"

void main()
{
    // TODO
}
```

## Output format

```markdown
## Created
- File: src/scripts/<name>.nss
- Prefix: <prefix>
- Compile: PASS/FAIL

## Wiring needed
- [ ] module.ifo event script
- [ ] blueprint script field
- [ ] evt_* dispatcher registration
```
