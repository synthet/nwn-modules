"""
Test helpers for the NWScript mock runtime.

Provides the MockRuntime context manager that resets engine state on entry
and gives convenient access to setup helpers.

Usage:
    from test_helpers import MockRuntime
    import nwscript_mock as nwn

    class TestFoo(unittest.TestCase):
        def test_something(self):
            with MockRuntime() as rt:
                pc = rt.setup_pc(tag="hero", name="Hero")
                nwn.SetLocalInt(pc, "q_state", 2)
                self.assertEqual(nwn.GetLocalInt(pc, "q_state"), 2)
"""

from __future__ import annotations
import sys
import os

# Allow importing nwscript_mock from the same package directory
_MOCK_DIR = os.path.dirname(os.path.abspath(__file__))
if _MOCK_DIR not in sys.path:
    sys.path.insert(0, _MOCK_DIR)

import nwscript_mock as _nwn
from nwscript_mock import NWObject


class MockRuntime:
    """
    Context manager that resets NWScript mock state on entry.

    All setup calls go through this object so tests read naturally:

        with MockRuntime() as rt:
            pc = rt.setup_pc()
            nwn.SetLocalInt(pc, "x", 1)
    """

    def __enter__(self) -> "MockRuntime":
        _nwn.reset_state()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        # No teardown needed; reset will happen on the next __enter__.
        pass

    # ------------------------------------------------------------------
    # Delegated setup helpers
    # ------------------------------------------------------------------

    def setup_pc(self, tag: str = "test_pc", name: str = "Test Player") -> NWObject:
        """Create a PC and register it as pc_speaker and first_pc."""
        return _nwn.setup_pc(tag=tag, name=name)

    def setup_entering_object(self, tag: str = "test_enter", name: str = "") -> NWObject:
        """Create an object and set it as the entering object."""
        return _nwn.setup_entering_object(tag=tag, name=name)

    def setup_exiting_object(self, tag: str = "test_exit", name: str = "") -> NWObject:
        """Create an object and set it as the exiting object."""
        return _nwn.setup_exiting_object(tag=tag, name=name)

    # ------------------------------------------------------------------
    # Convenience accessors
    # ------------------------------------------------------------------

    @property
    def module(self) -> NWObject:
        """Return the current module object."""
        return _nwn.GetModule()

    @property
    def messages(self):
        """Return the list of SendMessageToPC messages captured so far."""
        return _nwn.get_messages()

    def clear_messages(self) -> None:
        """Clear captured SendMessageToPC messages."""
        _nwn.clear_messages()

    @property
    def OBJECT_INVALID(self) -> NWObject:
        """Expose the OBJECT_INVALID sentinel for assertion convenience."""
        return _nwn.OBJECT_INVALID
