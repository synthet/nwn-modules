Run the Python mock unit tests (no NWN runtime required).

```bash
./scripts/run-script-tests
```

Or directly:

```bash
python3 -m pytest tools/testing/script-tests/ -v
# or without pytest:
python3 -m unittest discover tools/testing/script-tests/ -v
```

On Windows (PowerShell):

```powershell
.\scripts\run-script-tests.ps1
```

See `docs/testing.md` for what the mock harness covers and how to add new tests.

To add a test for a new NWScript function `Foo_Bar`:
1. Add the pure-logic function to `src/scripts/inc_quests.nss` (or the relevant include).
2. Mirror the pure logic in Python in `tools/testing/script-tests/test_<topic>.py`.
3. Import `nwscript_mock` from `tools/testing/mock-runtime/`.
4. Call `nwn.reset_state()` in `setUp()`.
