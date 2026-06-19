Pack all release targets: module, art hak, and tlk.

```bash
./tools/pack.sh
```

Equivalent to running:

```bash
nasher pack module   # → build/dist/starter_module.mod
nasher pack art      # → build/dist/starter_art.hak
nasher pack tlk      # → build/dist/starter_project.tlk
```

All outputs are git-ignored. Distribute via GitHub Releases.
