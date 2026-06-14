"""
Tests for quest advancement logic.

Demonstrates the pure-logic testing pattern: a Python function mirrors
the NWScript logic in src/scripts/inc_quests.nss so it can be exercised
without compilation or a live NWN server.
"""

import sys
import os
import unittest

_MOCK_DIR = os.path.join(os.path.dirname(__file__), "..", "mock-runtime")
sys.path.insert(0, os.path.abspath(_MOCK_DIR))

import nwscript_mock as nwn
from test_helpers import MockRuntime


# ---------------------------------------------------------------------------
# Pure-logic mirror of inc_quests.nss
# ---------------------------------------------------------------------------

def Quest_CanAdvance(nState: int, bHasItem: int, nFactionRep: int) -> int:
    """
    Pure logic equivalent of NWScript quest advancement check.
    Mirrors: int Quest_CanAdvance(int nState, int bHasItem, int nFactionRep)

    Returns 1 (TRUE) only when:
      - nState == QUEST_STATE_INTRO (2)
      - bHasItem is non-zero (TRUE)
      - nFactionRep >= 5
    """
    return 1 if (nState == 2 and bHasItem and nFactionRep >= 5) else 0


def Quest_GetNextState(nCurrentState: int) -> int:
    """
    Pure logic equivalent of NWScript Quest_GetNextState.
    Mirrors: int Quest_GetNextState(int nCurrentState)

    Simple linear progression: each state advances by 1.
    Unknown states return -1 (QUEST_STATE_INVALID).
    """
    VALID_STATES = {1, 2, 3, 4}
    if nCurrentState in VALID_STATES:
        return nCurrentState + 1
    return -1


def Quest_IsComplete(nState: int) -> int:
    """
    Pure logic equivalent of NWScript Quest_IsComplete.
    Mirrors: int Quest_IsComplete(int nState)

    State 5 is the completion state for the intro quest chain.
    """
    return 1 if nState == 5 else 0


# ---------------------------------------------------------------------------
# Pure-logic tests (no mock runtime needed)
# ---------------------------------------------------------------------------

class TestQuestCanAdvancePureLogic(unittest.TestCase):

    def test_returns_true_when_all_conditions_met(self):
        """state==2, has_item==1, faction_rep==5 — all conditions satisfied."""
        self.assertEqual(Quest_CanAdvance(2, 1, 5), 1)

    def test_returns_true_with_high_faction_rep(self):
        """faction_rep above minimum still satisfies the threshold."""
        self.assertEqual(Quest_CanAdvance(2, 1, 100), 1)

    def test_returns_false_when_state_wrong_low(self):
        """state==1 is below the required QUEST_STATE_INTRO."""
        self.assertEqual(Quest_CanAdvance(1, 1, 5), 0)

    def test_returns_false_when_state_wrong_high(self):
        """state==3 is past the intro state boundary."""
        self.assertEqual(Quest_CanAdvance(3, 1, 5), 0)

    def test_returns_false_when_item_not_held(self):
        """bHasItem==0 fails the item gate."""
        self.assertEqual(Quest_CanAdvance(2, 0, 5), 0)

    def test_returns_false_when_faction_rep_too_low(self):
        """nFactionRep==4 is one below the minimum threshold of 5."""
        self.assertEqual(Quest_CanAdvance(2, 1, 4), 0)

    def test_returns_false_when_no_conditions_met(self):
        """None of the conditions are satisfied."""
        self.assertEqual(Quest_CanAdvance(0, 0, 0), 0)

    def test_state_boundary_state_3_returns_false(self):
        """Explicitly verify the upper boundary: state==3 is not QUEST_STATE_INTRO."""
        self.assertEqual(Quest_CanAdvance(3, 1, 10), 0)

    def test_has_item_nonzero_nonone_is_truthy(self):
        """NWN treats any non-zero int as TRUE for bHasItem."""
        self.assertEqual(Quest_CanAdvance(2, 99, 5), 1)


class TestQuestGetNextState(unittest.TestCase):

    def test_state_1_advances_to_2(self):
        self.assertEqual(Quest_GetNextState(1), 2)

    def test_state_2_advances_to_3(self):
        self.assertEqual(Quest_GetNextState(2), 3)

    def test_state_4_advances_to_5(self):
        self.assertEqual(Quest_GetNextState(4), 5)

    def test_unknown_state_returns_invalid(self):
        self.assertEqual(Quest_GetNextState(0), -1)

    def test_out_of_range_state_returns_invalid(self):
        self.assertEqual(Quest_GetNextState(99), -1)


class TestQuestIsComplete(unittest.TestCase):

    def test_state_5_is_complete(self):
        self.assertEqual(Quest_IsComplete(5), 1)

    def test_state_4_not_complete(self):
        self.assertEqual(Quest_IsComplete(4), 0)

    def test_state_0_not_complete(self):
        self.assertEqual(Quest_IsComplete(0), 0)


# ---------------------------------------------------------------------------
# Mock runtime integration: simulate the NWScript wrapper pattern
# ---------------------------------------------------------------------------

class TestQuestLogicWithMockRuntime(unittest.TestCase):
    """
    Simulate: read ints from PC via GetLocalInt, call pure function.
    This mirrors the Aurora wrapper pattern in inc_quests.nss:

        int Quest_CanAdvance_ForPC(object oPC) {
            int nState      = GetLocalInt(oPC, "q_state");
            int bHasItem    = GetLocalInt(oPC, "has_item");
            int nFactionRep = GetLocalInt(oPC, "faction_rep");
            return Quest_CanAdvance(nState, bHasItem, nFactionRep);
        }
    """

    def setUp(self):
        nwn.reset_state()

    def _pc_can_advance(self, pc):
        """Python mirror of Quest_CanAdvance_ForPC(oPC)."""
        nState      = nwn.GetLocalInt(pc, "q_state")
        bHasItem    = nwn.GetLocalInt(pc, "has_item")
        nFactionRep = nwn.GetLocalInt(pc, "faction_rep")
        return Quest_CanAdvance(nState, bHasItem, nFactionRep)

    def test_pc_can_advance_with_all_vars_set(self):
        pc = nwn.setup_pc(tag="test_pc", name="Test Player")
        nwn.SetLocalInt(pc, "q_state", 2)
        nwn.SetLocalInt(pc, "has_item", 1)
        nwn.SetLocalInt(pc, "faction_rep", 5)
        self.assertEqual(self._pc_can_advance(pc), 1)

    def test_pc_cannot_advance_missing_item(self):
        pc = nwn.setup_pc()
        nwn.SetLocalInt(pc, "q_state", 2)
        # has_item never set — defaults to 0
        nwn.SetLocalInt(pc, "faction_rep", 5)
        self.assertEqual(self._pc_can_advance(pc), 0)

    def test_pc_cannot_advance_wrong_state(self):
        pc = nwn.setup_pc()
        nwn.SetLocalInt(pc, "q_state", 1)
        nwn.SetLocalInt(pc, "has_item", 1)
        nwn.SetLocalInt(pc, "faction_rep", 5)
        self.assertEqual(self._pc_can_advance(pc), 0)

    def test_set_then_read_q_state_round_trip(self):
        """Verify SetLocalInt/GetLocalInt round-trip for quest state var."""
        pc = nwn.setup_pc()
        nwn.SetLocalInt(pc, "q_state", 2)
        self.assertEqual(nwn.GetLocalInt(pc, "q_state"), 2)

    def test_context_manager_resets_state_between_uses(self):
        """MockRuntime context manager clears state on each entry."""
        with MockRuntime() as rt:
            pc = rt.setup_pc()
            nwn.SetLocalInt(pc, "q_state", 2)

        with MockRuntime() as rt:
            # State should be reset; pc from previous context is gone
            new_pc = rt.setup_pc()
            # new_pc has a fresh object — q_state is 0
            self.assertEqual(nwn.GetLocalInt(new_pc, "q_state"), 0)


if __name__ == "__main__":
    unittest.main()
