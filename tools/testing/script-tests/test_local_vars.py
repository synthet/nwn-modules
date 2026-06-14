"""
Tests for NWScript local variable API stubs.

Covers SetLocalInt/GetLocalInt/DeleteLocalInt,
SetLocalString/GetLocalString/DeleteLocalString,
and behaviour on OBJECT_INVALID.
"""

import sys
import os
import unittest

# Locate mock-runtime relative to this file
_MOCK_DIR = os.path.join(os.path.dirname(__file__), "..", "mock-runtime")
sys.path.insert(0, os.path.abspath(_MOCK_DIR))

import nwscript_mock as nwn


class TestLocalInts(unittest.TestCase):

    def setUp(self):
        nwn.reset_state()

    # --- basic set / get ---

    def test_set_then_get_int(self):
        pc = nwn.setup_pc()
        nwn.SetLocalInt(pc, "health", 100)
        self.assertEqual(nwn.GetLocalInt(pc, "health"), 100)

    def test_set_then_get_int_negative(self):
        pc = nwn.setup_pc()
        nwn.SetLocalInt(pc, "debt", -42)
        self.assertEqual(nwn.GetLocalInt(pc, "debt"), -42)

    def test_set_then_get_int_zero(self):
        pc = nwn.setup_pc()
        nwn.SetLocalInt(pc, "count", 0)
        # Explicitly set to 0 — still 0, same as unset (NWN behavior)
        self.assertEqual(nwn.GetLocalInt(pc, "count"), 0)

    # --- unset returns 0 ---

    def test_unset_int_returns_zero(self):
        pc = nwn.setup_pc()
        # "q_state" was never set
        self.assertEqual(nwn.GetLocalInt(pc, "q_state"), 0)

    def test_unset_and_explicit_zero_both_return_zero(self):
        """NWN has no way to distinguish unset from 0 via GetLocalInt."""
        pc = nwn.setup_pc()
        nwn.SetLocalInt(pc, "x", 0)
        self.assertEqual(nwn.GetLocalInt(pc, "x"), 0)
        # And if we never set it:
        self.assertEqual(nwn.GetLocalInt(pc, "y"), 0)

    # --- delete ---

    def test_delete_int_returns_zero(self):
        pc = nwn.setup_pc()
        nwn.SetLocalInt(pc, "q_state", 2)
        nwn.DeleteLocalInt(pc, "q_state")
        self.assertEqual(nwn.GetLocalInt(pc, "q_state"), 0)

    def test_delete_nonexistent_int_no_crash(self):
        pc = nwn.setup_pc()
        # Should not raise even if variable was never set
        nwn.DeleteLocalInt(pc, "never_set")

    # --- OBJECT_INVALID ---

    def test_get_int_on_invalid_returns_zero(self):
        self.assertEqual(nwn.GetLocalInt(nwn.OBJECT_INVALID, "any"), 0)

    def test_set_int_on_invalid_is_noop(self):
        # Should not raise; invalid objects silently discard writes
        nwn.SetLocalInt(nwn.OBJECT_INVALID, "x", 99)
        self.assertEqual(nwn.GetLocalInt(nwn.OBJECT_INVALID, "x"), 0)

    def test_delete_int_on_invalid_is_noop(self):
        nwn.DeleteLocalInt(nwn.OBJECT_INVALID, "x")

    # --- multiple variables do not interfere ---

    def test_multiple_ints_no_interference(self):
        pc = nwn.setup_pc()
        nwn.SetLocalInt(pc, "a", 1)
        nwn.SetLocalInt(pc, "b", 2)
        nwn.SetLocalInt(pc, "c", 3)
        self.assertEqual(nwn.GetLocalInt(pc, "a"), 1)
        self.assertEqual(nwn.GetLocalInt(pc, "b"), 2)
        self.assertEqual(nwn.GetLocalInt(pc, "c"), 3)

    def test_different_objects_dont_share_ints(self):
        pc1 = nwn.setup_pc(tag="pc1")
        pc2 = nwn.NWObject(tag="pc2")
        nwn.SetLocalInt(pc1, "score", 10)
        self.assertEqual(nwn.GetLocalInt(pc2, "score"), 0)


class TestLocalStrings(unittest.TestCase):

    def setUp(self):
        nwn.reset_state()

    def test_set_then_get_string(self):
        pc = nwn.setup_pc()
        nwn.SetLocalString(pc, "q_tag", "qst_missing_caravan")
        self.assertEqual(nwn.GetLocalString(pc, "q_tag"), "qst_missing_caravan")

    def test_set_empty_string(self):
        pc = nwn.setup_pc()
        nwn.SetLocalString(pc, "note", "")
        self.assertEqual(nwn.GetLocalString(pc, "note"), "")

    def test_unset_string_returns_empty(self):
        pc = nwn.setup_pc()
        self.assertEqual(nwn.GetLocalString(pc, "never_set"), "")

    def test_delete_string_returns_empty(self):
        pc = nwn.setup_pc()
        nwn.SetLocalString(pc, "q_tag", "qst_missing_caravan")
        nwn.DeleteLocalString(pc, "q_tag")
        self.assertEqual(nwn.GetLocalString(pc, "q_tag"), "")

    def test_delete_nonexistent_string_no_crash(self):
        pc = nwn.setup_pc()
        nwn.DeleteLocalString(pc, "never_set")

    def test_get_string_on_invalid_returns_empty(self):
        self.assertEqual(nwn.GetLocalString(nwn.OBJECT_INVALID, "any"), "")

    def test_set_string_on_invalid_is_noop(self):
        nwn.SetLocalString(nwn.OBJECT_INVALID, "x", "hello")
        self.assertEqual(nwn.GetLocalString(nwn.OBJECT_INVALID, "x"), "")

    def test_multiple_strings_no_interference(self):
        pc = nwn.setup_pc()
        nwn.SetLocalString(pc, "first", "alpha")
        nwn.SetLocalString(pc, "second", "beta")
        self.assertEqual(nwn.GetLocalString(pc, "first"), "alpha")
        self.assertEqual(nwn.GetLocalString(pc, "second"), "beta")

    def test_int_and_string_namespaces_are_independent(self):
        """NWN keeps separate namespaces for ints and strings with the same var name."""
        pc = nwn.setup_pc()
        nwn.SetLocalInt(pc, "var", 7)
        nwn.SetLocalString(pc, "var", "seven")
        self.assertEqual(nwn.GetLocalInt(pc, "var"), 7)
        self.assertEqual(nwn.GetLocalString(pc, "var"), "seven")


if __name__ == "__main__":
    unittest.main()
