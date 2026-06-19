Validate the project layout: required directories, config files, and gitignore rules.

```bash
./tools/smoke-test.sh
```

The MCP tool gives a structured result:

```
nwn.project.validate_layout
```

What is checked:
- `nasher.cfg` exists
- `src/scripts/`, `src/module/`, `src/areas/`, `src/dialogs/`, `src/blueprints/` exist
- `docs/` exists
- `.gitignore` excludes `*.mod`, `*.hak`, `*.tlk`, and `build/dist`
- No binary build artifacts tracked in git

If the layout check fails, review `nasher.cfg` targets and ensure all source directories were created.
