Build the NWN module target with Nasher.

```bash
./tools/build.sh
```

If the wrapper fails or Nasher is not on PATH, run directly:

```bash
nasher pack module
```

The output goes to `build/dist/starter_module.mod`. This file is git-ignored; distribute it via GitHub Releases or the Neverwinter Vault.

After a successful build, validate the layout:

```bash
./tools/smoke-test.sh
```
