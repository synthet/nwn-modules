Create a new NWScript file following project conventions.

Choose the correct prefix for the file:

| Prefix | Use for |
|---|---|
| `inc_` | Shared utility or constant include |
| `db_` | Database repository wrapper (NWNX SQL) |
| `sys_` | Gameplay system (death, login, economy) |
| `evt_` | Event dispatch helper |
| `qst_` | Quest-specific logic |
| `adm_` | DM/admin tool |
| `mod_on_` | Module event entry point |
| `plc_` | Placeable object script |
| `cre_` | Creature script |
| `trg_` | Trigger script |

**Template for an include file (`inc_<name>.nss`):**

```c
// One-line description of what this include provides.

const int MYCONST_EXAMPLE = 1;

// Pure utility — no engine side effects, testable in Python mock.
int MyPrefix_PureLogic(int nInput)
{
    return nInput > 0;
}

// Engine wrapper — reads game state, calls pure function.
int MyPrefix_ForPC(object oPC)
{
    if (!GetIsObjectValid(oPC)) return FALSE;
    int nVal = GetLocalInt(oPC, "my_var");
    return MyPrefix_PureLogic(nVal);
}
```

Place the file in `src/scripts/` (or `src/scripts/include/db/` for DB includes).

After creating the file, compile it:

```bash
./scripts/compile-scripts
```

If the function contains pure logic, add a Python mirror in `tools/testing/script-tests/`.
