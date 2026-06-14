"""
Tests for spawn validation patterns.

Covers CreateObject, DestroyObject, and GetIsObjectValid stubs.
"""

import sys
import os
import unittest

_MOCK_DIR = os.path.join(os.path.dirname(__file__), "..", "mock-runtime")
sys.path.insert(0, os.path.abspath(_MOCK_DIR))

import nwscript_mock as nwn
from test_helpers import MockRuntime

# NWScript object type constants (mirroring nwscript.nss)
OBJECT_TYPE_CREATURE  = 1
OBJECT_TYPE_PLACEABLE = 9
OBJECT_TYPE_ITEM      = 2

# Stub location (the mock ignores it; real NWN would need a valid Location)
LOCATION_INVALID = None


class TestCreateObject(unittest.TestCase):

    def setUp(self):
        nwn.reset_state()

    def test_create_object_returns_valid_nwobject(self):
        obj = nwn.CreateObject(OBJECT_TYPE_CREATURE, "nw_bandit", LOCATION_INVALID)
        self.assertIsInstance(obj, nwn.NWObject)

    def test_created_object_is_valid(self):
        obj = nwn.CreateObject(OBJECT_TYPE_CREATURE, "nw_bandit", LOCATION_INVALID)
        self.assertEqual(nwn.GetIsObjectValid(obj), 1)

    def test_created_object_tag_from_template_when_no_new_tag(self):
        """When sNewTag is omitted, the tag falls back to the template resref."""
        obj = nwn.CreateObject(OBJECT_TYPE_CREATURE, "nw_bandit", LOCATION_INVALID)
        self.assertEqual(nwn.GetTag(obj), "nw_bandit")

    def test_created_object_uses_explicit_new_tag(self):
        """When sNewTag is provided, it overrides the template as the tag."""
        obj = nwn.CreateObject(
            OBJECT_TYPE_CREATURE, "nw_bandit", LOCATION_INVALID,
            bUseAppearAnimation=0, sNewTag="BANDIT_BOSS"
        )
        self.assertEqual(nwn.GetTag(obj), "BANDIT_BOSS")

    def test_multiple_create_calls_return_distinct_objects(self):
        obj1 = nwn.CreateObject(OBJECT_TYPE_CREATURE, "nw_bandit", LOCATION_INVALID)
        obj2 = nwn.CreateObject(OBJECT_TYPE_CREATURE, "nw_bandit", LOCATION_INVALID)
        self.assertIsNot(obj1, obj2)
        self.assertNotEqual(obj1._id, obj2._id)

    def test_create_placeable(self):
        obj = nwn.CreateObject(OBJECT_TYPE_PLACEABLE, "plc_barrel", LOCATION_INVALID)
        self.assertEqual(nwn.GetIsObjectValid(obj), 1)
        self.assertEqual(nwn.GetTag(obj), "plc_barrel")

    def test_local_vars_work_on_created_object(self):
        obj = nwn.CreateObject(OBJECT_TYPE_CREATURE, "nw_bandit", LOCATION_INVALID)
        nwn.SetLocalInt(obj, "USED", 1)
        self.assertEqual(nwn.GetLocalInt(obj, "USED"), 1)


class TestDestroyObject(unittest.TestCase):

    def setUp(self):
        nwn.reset_state()

    def test_destroy_marks_object_invalid(self):
        obj = nwn.CreateObject(OBJECT_TYPE_CREATURE, "nw_bandit", LOCATION_INVALID)
        self.assertEqual(nwn.GetIsObjectValid(obj), 1)
        nwn.DestroyObject(obj)
        self.assertEqual(nwn.GetIsObjectValid(obj), 0)

    def test_local_vars_on_destroyed_object_return_defaults(self):
        obj = nwn.CreateObject(OBJECT_TYPE_CREATURE, "nw_bandit", LOCATION_INVALID)
        nwn.SetLocalInt(obj, "data", 42)
        nwn.DestroyObject(obj)
        # Object is invalid — GetLocalInt should return 0
        self.assertEqual(nwn.GetLocalInt(obj, "data"), 0)

    def test_destroy_object_invalid_is_noop(self):
        """DestroyObject on OBJECT_INVALID must not crash."""
        nwn.DestroyObject(nwn.OBJECT_INVALID)

    def test_destroy_with_delay_param(self):
        """fDelay parameter is accepted; mock ignores the delay value."""
        obj = nwn.CreateObject(OBJECT_TYPE_PLACEABLE, "plc_barrel", LOCATION_INVALID)
        nwn.DestroyObject(obj, fDelay=1.5)
        self.assertEqual(nwn.GetIsObjectValid(obj), 0)


class TestGetIsObjectValid(unittest.TestCase):

    def setUp(self):
        nwn.reset_state()

    def test_valid_object_returns_1(self):
        obj = nwn.NWObject(tag="test", valid=True)
        self.assertEqual(nwn.GetIsObjectValid(obj), 1)

    def test_invalid_object_returns_0(self):
        obj = nwn.NWObject(tag="test", valid=False)
        self.assertEqual(nwn.GetIsObjectValid(obj), 0)

    def test_object_invalid_singleton_returns_0(self):
        self.assertEqual(nwn.GetIsObjectValid(nwn.OBJECT_INVALID), 0)

    def test_none_returns_0(self):
        """Passing None (e.g. uninitialized variable) should not crash."""
        self.assertEqual(nwn.GetIsObjectValid(None), 0)

    def test_non_nwobject_returns_0(self):
        """Passing an arbitrary Python object should return 0, not raise."""
        self.assertEqual(nwn.GetIsObjectValid("not an object"), 0)


class TestSpawnLocationStub(unittest.TestCase):
    """
    Verify that spawn location handling is safe to mock.
    In real NWN, CreateObject needs a valid Location. The mock accepts
    LOCATION_INVALID (None) and returns a valid object anyway.
    """

    def setUp(self):
        nwn.reset_state()

    def test_create_with_none_location_does_not_raise(self):
        obj = nwn.CreateObject(OBJECT_TYPE_CREATURE, "nw_guard", None)
        self.assertEqual(nwn.GetIsObjectValid(obj), 1)

    def test_get_area_always_returns_object_invalid_in_mock(self):
        """GetArea is not implemented; it always returns OBJECT_INVALID."""
        obj = nwn.CreateObject(OBJECT_TYPE_CREATURE, "nw_guard", None)
        area = nwn.GetArea(obj)
        self.assertEqual(nwn.GetIsObjectValid(area), 0)


if __name__ == "__main__":
    unittest.main()
