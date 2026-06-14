"""
Tests for dialogue conditional patterns.

NWScript "starting conditionals" are scripts that return TRUE (1) or
FALSE (0) to show or hide a conversation node. These tests verify the
pure-Python mirrors of those conditionals using the mock runtime.
"""

import sys
import os
import unittest

_MOCK_DIR = os.path.join(os.path.dirname(__file__), "..", "mock-runtime")
sys.path.insert(0, os.path.abspath(_MOCK_DIR))

import nwscript_mock as nwn
from test_helpers import MockRuntime


# ---------------------------------------------------------------------------
# Pure-logic dialogue conditionals (mirrors of NWScript starting conditionals)
# ---------------------------------------------------------------------------

def Dlg_CheckQuestState(oSpeaker, nRequiredState: int) -> int:
    """
    Starting conditional: show node only if PC's q_state matches required state.
    Mirrors:
        int StartingConditional() {
            object oPC = GetPCSpeaker();
            if (!GetIsObjectValid(oPC)) return FALSE;
            return GetLocalInt(oPC, "q_state") == nRequiredState;
        }
    """
    if not nwn.GetIsObjectValid(oSpeaker):
        return 0
    return 1 if nwn.GetLocalInt(oSpeaker, "q_state") == nRequiredState else 0


def Dlg_CheckFactionRep(oSpeaker, nMinRep: int) -> int:
    """
    Starting conditional: show node only if PC has minimum faction reputation.
    Mirrors:
        int StartingConditional() {
            object oPC = GetPCSpeaker();
            if (!GetIsObjectValid(oPC)) return FALSE;
            return GetLocalInt(oPC, "faction_rep") >= nMinRep;
        }
    """
    if not nwn.GetIsObjectValid(oSpeaker):
        return 0
    return 1 if nwn.GetLocalInt(oSpeaker, "faction_rep") >= nMinRep else 0


def Dlg_CheckItemGate(oSpeaker) -> int:
    """
    Starting conditional: show node only if PC has the required item flag set.
    Mirrors checking a local int "has_key_item" on the PC.
    """
    if not nwn.GetIsObjectValid(oSpeaker):
        return 0
    return 1 if nwn.GetLocalInt(oSpeaker, "has_key_item") else 0


def Dlg_CheckJournalGate(oSpeaker, sJournalTag: str, nMinState: int) -> int:
    """
    Starting conditional: show node only if the PC's journal entry for
    sJournalTag is at or past nMinState.
    (In real NWScript this uses GetJournalEntry; here we mock it via a local int.)
    """
    if not nwn.GetIsObjectValid(oSpeaker):
        return 0
    nJournalState = nwn.GetLocalInt(oSpeaker, f"journal_{sJournalTag}")
    return 1 if nJournalState >= nMinState else 0


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

class TestDialogueQuestStateConditional(unittest.TestCase):

    def setUp(self):
        nwn.reset_state()

    def test_returns_true_when_pc_has_correct_state(self):
        pc = nwn.setup_pc(tag="test_pc")
        nwn.SetLocalInt(pc, "q_state", 2)
        speaker = nwn.GetPCSpeaker()
        self.assertEqual(Dlg_CheckQuestState(speaker, 2), 1)

    def test_returns_false_when_pc_has_wrong_state(self):
        pc = nwn.setup_pc(tag="test_pc")
        nwn.SetLocalInt(pc, "q_state", 1)
        speaker = nwn.GetPCSpeaker()
        self.assertEqual(Dlg_CheckQuestState(speaker, 2), 0)

    def test_returns_false_when_pc_has_no_state_set(self):
        pc = nwn.setup_pc(tag="test_pc")
        # q_state not set — defaults to 0
        speaker = nwn.GetPCSpeaker()
        self.assertEqual(Dlg_CheckQuestState(speaker, 2), 0)

    def test_returns_false_when_speaker_is_object_invalid(self):
        """If no PC speaker set up, GetPCSpeaker returns OBJECT_INVALID."""
        # Don't call setup_pc — no speaker
        speaker = nwn.GetPCSpeaker()
        self.assertEqual(Dlg_CheckQuestState(speaker, 2), 0)

    def test_conditional_with_mock_runtime_context(self):
        with MockRuntime() as rt:
            pc = rt.setup_pc(tag="hero")
            nwn.SetLocalInt(pc, "q_state", 3)
            speaker = nwn.GetPCSpeaker()
            self.assertEqual(Dlg_CheckQuestState(speaker, 3), 1)
            self.assertEqual(Dlg_CheckQuestState(speaker, 2), 0)


class TestDialogueFactionRepConditional(unittest.TestCase):

    def setUp(self):
        nwn.reset_state()

    def test_rep_at_threshold_returns_true(self):
        pc = nwn.setup_pc()
        nwn.SetLocalInt(pc, "faction_rep", 5)
        speaker = nwn.GetPCSpeaker()
        self.assertEqual(Dlg_CheckFactionRep(speaker, 5), 1)

    def test_rep_above_threshold_returns_true(self):
        pc = nwn.setup_pc()
        nwn.SetLocalInt(pc, "faction_rep", 10)
        speaker = nwn.GetPCSpeaker()
        self.assertEqual(Dlg_CheckFactionRep(speaker, 5), 1)

    def test_rep_below_threshold_returns_false(self):
        pc = nwn.setup_pc()
        nwn.SetLocalInt(pc, "faction_rep", 4)
        speaker = nwn.GetPCSpeaker()
        self.assertEqual(Dlg_CheckFactionRep(speaker, 5), 0)

    def test_rep_zero_fails_threshold_of_5(self):
        pc = nwn.setup_pc()
        # faction_rep not set — defaults to 0
        speaker = nwn.GetPCSpeaker()
        self.assertEqual(Dlg_CheckFactionRep(speaker, 5), 0)

    def test_invalid_speaker_returns_false(self):
        self.assertEqual(Dlg_CheckFactionRep(nwn.OBJECT_INVALID, 5), 0)


class TestDialogueItemGateConditional(unittest.TestCase):

    def setUp(self):
        nwn.reset_state()

    def test_item_gate_passes_when_flag_set(self):
        pc = nwn.setup_pc()
        nwn.SetLocalInt(pc, "has_key_item", 1)
        speaker = nwn.GetPCSpeaker()
        self.assertEqual(Dlg_CheckItemGate(speaker), 1)

    def test_item_gate_fails_when_flag_not_set(self):
        pc = nwn.setup_pc()
        # has_key_item not set — defaults to 0
        speaker = nwn.GetPCSpeaker()
        self.assertEqual(Dlg_CheckItemGate(speaker), 0)

    def test_item_gate_fails_when_flag_deleted(self):
        pc = nwn.setup_pc()
        nwn.SetLocalInt(pc, "has_key_item", 1)
        nwn.DeleteLocalInt(pc, "has_key_item")
        speaker = nwn.GetPCSpeaker()
        self.assertEqual(Dlg_CheckItemGate(speaker), 0)

    def test_item_gate_fails_for_invalid_object(self):
        self.assertEqual(Dlg_CheckItemGate(nwn.OBJECT_INVALID), 0)


class TestDialogueJournalGateConditional(unittest.TestCase):

    def setUp(self):
        nwn.reset_state()

    def test_journal_at_required_state_passes(self):
        pc = nwn.setup_pc()
        nwn.SetLocalInt(pc, "journal_qst_missing_caravan", 2)
        speaker = nwn.GetPCSpeaker()
        self.assertEqual(Dlg_CheckJournalGate(speaker, "qst_missing_caravan", 2), 1)

    def test_journal_above_required_state_passes(self):
        pc = nwn.setup_pc()
        nwn.SetLocalInt(pc, "journal_qst_missing_caravan", 4)
        speaker = nwn.GetPCSpeaker()
        self.assertEqual(Dlg_CheckJournalGate(speaker, "qst_missing_caravan", 2), 1)

    def test_journal_below_required_state_fails(self):
        pc = nwn.setup_pc()
        nwn.SetLocalInt(pc, "journal_qst_missing_caravan", 1)
        speaker = nwn.GetPCSpeaker()
        self.assertEqual(Dlg_CheckJournalGate(speaker, "qst_missing_caravan", 2), 0)

    def test_journal_not_started_fails(self):
        pc = nwn.setup_pc()
        # journal var not set — defaults to 0
        speaker = nwn.GetPCSpeaker()
        self.assertEqual(Dlg_CheckJournalGate(speaker, "qst_missing_caravan", 1), 0)


if __name__ == "__main__":
    unittest.main()
