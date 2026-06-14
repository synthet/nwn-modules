# NWN Module Test Harness

This directory contains a lightweight Python mock runtime and test suites for unit-testing NWScript logic without a live Neverwinter Nights server.

## What the mock runtime does

The mock runtime (`mock-runtime/nwscript_mock.py`) provides deterministic Python stubs for common NWScript API functions. This lets you write pure Python tests that exercise game logic—quest advancement checks, dialogue conditions, local variable reads and writes—without needing nwnsc, a NWN installation, or an NWNX server.

## What the mock runtime does NOT emulate

The following engine behaviors are out of scope and require a real NWN runtime:

- **Conversations (DLG engine):** Branching, token substitution, the `GetPCSpeaker()` conversation context.
- **Area transitions and JumpToObject:** Spatial and portal logic.
- **Encounter spawn AI and combat rounds:** Faction AI, targeting, action queue resolution.
- **Visual and sound effects:** `ApplyEffectToObject`, `PlaySound`, `FloatingTextStringOnCreature` rendering.
- **Timing and DelayCommand scheduling:** `DelayCommand` executes immediately in tests; real timing requires the server tick.
- **Persistence (bio_campaigns, BiowareDB):** Campaign variable storage is not mocked.
- **Module events in sequence:** OnModLoad, OnClientEnter, OnPlayerDeath chaining.
- **Item, feat, and spell mechanics:** The full rules engine.

For these behaviors, use the `nwn-testlab.mod` concept described in `docs/testing.md`.

## Directory structure

```
tools/testing/
├── mock-runtime/
│   ├── __init__.py
│   ├── nwscript_mock.py    # Core mock stubs
│   └── test_helpers.py     # MockRuntime context manager
├── script-tests/
│   ├── __init__.py
│   ├── test_local_vars.py
│   ├── test_quest_logic.py
│   ├── test_dialogue_conditions.py
│   └── test_spawn_logic.py
└── fixtures/
    ├── README.md
    └── example_pc.json
```

## Prerequisites

- Python 3.8 or newer
- pytest (optional, recommended): `pip3 install pytest`

No other dependencies are required. The mock runtime uses only the Python standard library.

## How to run tests

From the repository root:

```bash
# Using the provided script (handles pytest/unittest fallback automatically)
./scripts/run-script-tests

# Or directly with pytest
python3 -m pytest tools/testing/script-tests/ -v

# Or directly with unittest (no install required)
python3 -m unittest discover tools/testing/script-tests/ -v
```

## How to add a new test

1. Create a new file in `tools/testing/script-tests/` named `test_<topic>.py`.
2. Import the mock runtime:
   ```python
   import sys, os
   sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'mock-runtime'))
   import nwscript_mock as nwn
   from test_helpers import MockRuntime
   ```
3. Write test cases as a `unittest.TestCase` subclass:
   ```python
   import unittest

   class TestMyLogic(unittest.TestCase):
       def setUp(self):
           nwn.reset_state()

       def test_something(self):
           pc = nwn.setup_pc(tag="test_pc", name="Test Player")
           nwn.SetLocalInt(pc, "my_var", 42)
           self.assertEqual(nwn.GetLocalInt(pc, "my_var"), 42)
   ```

## The pure-logic testing pattern

The key insight is to separate pure logic from engine calls. NWScript wrappers that only call `GetLocalInt`, `SetLocalInt`, etc. can be mirrored as Python functions that call the mocked equivalents.

Example (see `script-tests/test_quest_logic.py`):

```python
def Quest_CanAdvance(nState, bHasItem, nFactionRep):
    """Mirror of the NWScript function in src/scripts/inc_quests.nss."""
    return 1 if (nState == 2 and bHasItem and nFactionRep >= 5) else 0
```

The NWScript source in `inc_quests.nss` implements the same logic using engine objects. The Python mirror lets you test all branches without compilation or a server.

## Extending the mock runtime safely

- Add new stubs to `nwscript_mock.py` following the same pattern: accept NWObject(s) or primitives, guard against `OBJECT_INVALID`, return sensible defaults.
- Do not add stubs that silently succeed for operations with engine side effects that matter to tests—prefer raising `NotImplementedError` with a clear message if a stub cannot be faithfully approximated.
- Call `reset_state()` in each test's `setUp` to prevent state leakage between tests.
