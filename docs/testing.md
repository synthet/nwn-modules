# NWN Module Test Harness

This document describes the testing strategy for the module: what is covered
by the mock unit tests, what requires a real NWN runtime, and how to add or
extend tests.

## Overview

NWScript runs inside the Aurora engine. Most logic—quest checks, conversation
conditionals, local variable reads—is pure arithmetic or state-machine logic
that can be extracted and tested without the engine. The test harness exploits
this by:

1. Mirroring pure NWScript logic in Python (identical logic, different language).
2. Providing a lightweight Python mock of the NWScript API (`nwscript_mock.py`).
3. Running tests with Python's standard `unittest` module (zero extra
   dependencies) or `pytest` if installed.

---

## What the test harness covers

| Category | Example | Covered? |
|----------|---------|----------|
| Local variable read/write | `SetLocalInt`, `GetLocalInt`, `DeleteLocalInt` | Yes |
| Quest advancement logic | `Quest_CanAdvance(nState, bHasItem, nFactionRep)` | Yes (pure logic) |
| Dialogue conditionals | `GetLocalInt(GetPCSpeaker(), "q_state") == 2` | Yes |
| Spawn object validity | `CreateObject`, `DestroyObject`, `GetIsObjectValid` | Yes |
| Object tag / name lookup | `GetTag`, `GetName` | Yes |
| PC speaker / entering object | `GetPCSpeaker`, `GetEnteringObject` | Yes (mock state) |

---

## What requires a real NWN runtime

The following are **out of scope** for the mock test harness. They require a
live NWN server (or the planned `nwn-testlab.mod` concept):

- **Conversations (DLG engine):** Branching, token substitution, all
  `GetPCSpeaker()` conversation state driven by the dialogue editor.
- **Area transitions and `JumpToObject`:** Portal and spatial logic.
- **Encounter spawn AI and combat rounds:** Faction AI, targeting, action
  queue resolution, script timing.
- **Visual and sound effects:** `ApplyEffectToObject`, `PlaySound`,
  `FloatingTextStringOnCreature` rendering.
- **Timing and `DelayCommand` scheduling:** `DelayCommand` executes
  immediately in mock tests; real scheduling requires the server tick.
- **Persistence:** Campaign variables (`GetCampaignInt`, etc.),
  `BiowareDB`-style storage.
- **Module events in sequence:** OnModLoad, OnClientEnter, OnPlayerDeath
  chaining with actual game state.
- **Item, feat, and spell mechanics:** The full rules engine.

For runtime-level testing, see the `nwn-testlab.mod` concept: a dedicated
test module loaded on an NWNX server that runs assertions via chat commands.

---

## Prerequisites

- Python 3.8 or newer
- `pytest` (optional, recommended for better output): `pip3 install pytest`

No other dependencies are required. The mock runtime uses only the Python
standard library.

---

## How to run compile checks

Requires `nwnsc` on PATH and `NWN_ROOT` set:

```bash
export NWN_ROOT=/path/to/NeverwinterNights/NWN
./scripts/compile-scripts
```

To compile only files changed since HEAD:

```bash
./scripts/compile-scripts --changed-only
```

On Windows (PowerShell):

```powershell
$env:NWN_ROOT = "C:\Program Files (x86)\Neverwinter Nights"
.\scripts\compile-scripts.ps1
.\scripts\compile-scripts.ps1 -ChangedOnly
```

---

## How to run mock tests

From the repository root:

```bash
# Recommended: uses the shell script (auto-detects pytest vs unittest)
./scripts/run-script-tests

# Directly with pytest
python3 -m pytest tools/testing/script-tests/ -v

# Directly with unittest (no install required)
python3 -m unittest discover tools/testing/script-tests/ -v
```

On Windows (PowerShell):

```powershell
.\scripts\run-script-tests.ps1
```

---

## How to add a new test

1. Create `tools/testing/script-tests/test_<topic>.py`.
2. Import the mock runtime at the top of the file:

```python
import sys, os, unittest

_MOCK_DIR = os.path.join(os.path.dirname(__file__), '..', 'mock-runtime')
sys.path.insert(0, os.path.abspath(_MOCK_DIR))
import nwscript_mock as nwn
from test_helpers import MockRuntime
```

3. Write a `unittest.TestCase` subclass. Call `nwn.reset_state()` in `setUp`:

```python
class TestMyLogic(unittest.TestCase):
    def setUp(self):
        nwn.reset_state()

    def test_something(self):
        pc = nwn.setup_pc(tag="test_pc", name="Test Player")
        nwn.SetLocalInt(pc, "my_var", 42)
        self.assertEqual(nwn.GetLocalInt(pc, "my_var"), 42)
```

4. Run `./scripts/run-script-tests` to verify it passes.

---

## The pure-logic testing pattern

The key insight is to **separate pure logic from engine calls** in NWScript.

**In `inc_quests.nss` (NWScript):**

```c
// Pure logic — testable without NWN runtime.
int Quest_CanAdvance(int nState, int bHasItem, int nFactionRep)
{
    return (nState == QUEST_STATE_INTRO && bHasItem && nFactionRep >= 5)
           ? TRUE : FALSE;
}

// Aurora wrapper — reads engine state, calls pure function.
int Quest_CanAdvance_ForPC(object oPC)
{
    if (!GetIsObjectValid(oPC)) return FALSE;
    int nState      = GetLocalInt(oPC, QVAR_STATE);
    int bHasItem    = GetLocalInt(oPC, QVAR_HAS_ITEM);
    int nFactionRep = GetLocalInt(oPC, QVAR_FACTION_REP);
    return Quest_CanAdvance(nState, bHasItem, nFactionRep);
}
```

**In `test_quest_logic.py` (Python mirror):**

```python
def Quest_CanAdvance(nState: int, bHasItem: int, nFactionRep: int) -> int:
    """Mirror of the NWScript function in src/scripts/inc_quests.nss."""
    return 1 if (nState == 2 and bHasItem and nFactionRep >= 5) else 0

class TestQuestCanAdvance(unittest.TestCase):
    def test_all_conditions_met(self):
        self.assertEqual(Quest_CanAdvance(2, 1, 5), 1)

    def test_wrong_state(self):
        self.assertEqual(Quest_CanAdvance(1, 1, 5), 0)
```

**Integration-style test using the mock runtime:**

```python
def test_pc_can_advance_via_mock_runtime(self):
    pc = nwn.setup_pc()
    nwn.SetLocalInt(pc, "q_state", 2)
    nwn.SetLocalInt(pc, "has_item", 1)
    nwn.SetLocalInt(pc, "faction_rep", 5)
    nState      = nwn.GetLocalInt(pc, "q_state")
    bHasItem    = nwn.GetLocalInt(pc, "has_item")
    nFactionRep = nwn.GetLocalInt(pc, "faction_rep")
    self.assertEqual(Quest_CanAdvance(nState, bHasItem, nFactionRep), 1)
```

---

## What is mocked

All stubs live in `tools/testing/mock-runtime/nwscript_mock.py`.

| NWScript function | Mock behaviour |
|-------------------|----------------|
| `GetIsObjectValid(obj)` | Returns 1/0 based on `obj._valid` |
| `GetPCSpeaker()` | Returns the object set by `setup_pc()` |
| `GetFirstPC()` | Returns the object set by `setup_pc()` |
| `GetEnteringObject()` | Returns the object set by `setup_entering_object()` |
| `GetExitingObject()` | Returns the object set by `setup_exiting_object()` |
| `GetModule()` | Returns the module singleton |
| `GetArea(obj)` | Always returns `OBJECT_INVALID` |
| `GetTag(obj)` | Returns `obj._tag` |
| `GetName(obj)` | Returns `obj._name` |
| `GetLocalInt / SetLocalInt / DeleteLocalInt` | Dict-backed per object |
| `GetLocalString / SetLocalString / DeleteLocalString` | Dict-backed per object |
| `GetLocalFloat / SetLocalFloat / DeleteLocalFloat` | Dict-backed per object |
| `SendMessageToPC(oPC, sMessage)` | Appends to `_messages_log` |
| `AssignCommand(obj, action)` | Logs the assignment, does NOT execute |
| `DelayCommand(fSeconds, action)` | Executes `action()` immediately |
| `CreateObject(...)` | Returns a new valid `NWObject` |
| `DestroyObject(obj)` | Sets `obj._valid = False` |

---

## Extending the mock runtime safely

- Add new stubs to `tools/testing/mock-runtime/nwscript_mock.py` following the
  existing pattern: accept `NWObject`(s) or primitives, guard against
  `OBJECT_INVALID`, return sensible NWN defaults.
- Do not silently succeed for stubs that have engine side effects that matter
  to test correctness. Prefer raising `NotImplementedError` with a clear message
  if a stub cannot be faithfully approximated.
- Always call `reset_state()` in `setUp()` to prevent state leakage between
  tests. The `MockRuntime` context manager does this automatically.
- Keep the mock runtime dependency-free (Python stdlib only).

---

## Future: runtime testing with nwn-testlab.mod

The `nwn-testlab.mod` concept (not yet implemented) would be a dedicated NWN
module loaded on an NWNX server. Test scripts would run as NWScript and report
results via NWNX plugin calls. This covers the engine behaviours that the mock
cannot emulate: conversations, area transitions, combat, visual effects, and
module event chaining.
