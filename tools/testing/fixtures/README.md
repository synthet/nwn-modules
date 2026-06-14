# Test Fixtures

This folder holds test data used by the mock runtime unit tests.

## What belongs here

- **example_pc.json** — A sample PC state descriptor: tag, name, and the set of local variables (ints, strings, floats) that tests pre-load onto a mock NWObject. Useful as a reusable starting point for multiple test suites.
- **JSON blueprints for test objects** — Lightweight descriptors for creatures, placeables, or items that tests need to construct. These are NOT the same as the Aurora Toolset `.utc`/`.utp` JSON files in `src/blueprints/`; they describe mock state only.

## What does NOT belong here

- Aurora source blueprints (live in `src/blueprints/`).
- Built `.mod`/`.hak` files (gitignored under `build/dist/`).
- NWN game data files.

## How to use fixtures in tests

```python
import json, os, sys

_MOCK_DIR = os.path.join(os.path.dirname(__file__), '..', 'mock-runtime')
sys.path.insert(0, os.path.abspath(_MOCK_DIR))
import nwscript_mock as nwn

FIXTURES_DIR = os.path.join(os.path.dirname(__file__), '..', 'fixtures')

def load_pc_fixture(filename='example_pc.json'):
    path = os.path.join(FIXTURES_DIR, filename)
    with open(path) as f:
        return json.load(f)

def apply_pc_fixture(data: dict) -> nwn.NWObject:
    """Create an NWObject from a fixture dict and set its local vars."""
    pc = nwn.setup_pc(tag=data['tag'], name=data['name'])
    for var, value in data.get('local_vars', {}).get('int', {}).items():
        nwn.SetLocalInt(pc, var, value)
    for var, value in data.get('local_vars', {}).get('string', {}).items():
        nwn.SetLocalString(pc, var, value)
    for var, value in data.get('local_vars', {}).get('float', {}).items():
        nwn.SetLocalFloat(pc, var, value)
    return pc
```
