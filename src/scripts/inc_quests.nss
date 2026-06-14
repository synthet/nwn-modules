// Quest logic include for the module.
// Contains pure logic functions (testable without the NWN runtime) and
// Aurora-compatible wrappers that read engine state to call them.
//
// Pure-logic functions have no engine calls and can be mirrored 1-to-1 in
// Python for unit testing — see tools/testing/script-tests/test_quest_logic.py.

#ifndef INC_QUESTS
#define INC_QUESTS

// ---------------------------------------------------------------------------
// Quest state constants
// ---------------------------------------------------------------------------

// Quest: "The Missing Caravan" (qst_missing_caravan)
const int QUEST_STATE_INVALID    = -1;  // Sentinel — returned on bad input
const int QUEST_STATE_UNSTARTED  =  0;  // PC has not accepted the quest
const int QUEST_STATE_ACCEPTED   =  1;  // Quest accepted; intro dialogue done
const int QUEST_STATE_INTRO      =  2;  // Intro tasks assigned; awaiting item
const int QUEST_STATE_ADVANCED   =  3;  // PC collected required item
const int QUEST_STATE_RESOLVED   =  4;  // PC returned to quest giver
const int QUEST_STATE_COMPLETE   =  5;  // Quest journal closed as success

// Local variable names stored on the PC
const string QVAR_STATE       = "q_state";
const string QVAR_HAS_ITEM    = "has_item";
const string QVAR_FACTION_REP = "faction_rep";
const string QVAR_TAG         = "q_tag";

// ---------------------------------------------------------------------------
// Pure logic functions — testable without NWN runtime.
// ---------------------------------------------------------------------------

// Returns TRUE if the PC can advance from the intro quest state.
// Conditions: nState == QUEST_STATE_INTRO, bHasItem is TRUE, nFactionRep >= 5.
// Pure logic — testable without NWN runtime.
int Quest_CanAdvance(int nState, int bHasItem, int nFactionRep)
{
    return (nState == QUEST_STATE_INTRO && bHasItem && nFactionRep >= 5)
           ? TRUE
           : FALSE;
}

// Returns the next quest state given the current one, or QUEST_STATE_INVALID
// if nCurrentState is not a recognised state.
// Pure logic — testable without NWN runtime.
int Quest_GetNextState(int nCurrentState)
{
    switch (nCurrentState)
    {
        case QUEST_STATE_UNSTARTED: return QUEST_STATE_ACCEPTED;
        case QUEST_STATE_ACCEPTED:  return QUEST_STATE_INTRO;
        case QUEST_STATE_INTRO:     return QUEST_STATE_ADVANCED;
        case QUEST_STATE_ADVANCED:  return QUEST_STATE_RESOLVED;
        case QUEST_STATE_RESOLVED:  return QUEST_STATE_COMPLETE;
        default:                    return QUEST_STATE_INVALID;
    }
}

// Returns TRUE if the given journal state is a completion state.
// Pure logic — testable without NWN runtime.
int Quest_IsComplete(int nState)
{
    return (nState == QUEST_STATE_COMPLETE) ? TRUE : FALSE;
}

// ---------------------------------------------------------------------------
// Aurora-compatible wrappers — read engine state, call pure functions.
// ---------------------------------------------------------------------------

// Reads the quest state and prerequisite flags from oPC's local vars,
// then delegates to Quest_CanAdvance.
// Returns TRUE if the PC meets all conditions to advance the intro quest.
int Quest_CanAdvance_ForPC(object oPC)
{
    if (!GetIsObjectValid(oPC))
        return FALSE;

    int nState      = GetLocalInt(oPC, QVAR_STATE);
    int bHasItem    = GetLocalInt(oPC, QVAR_HAS_ITEM);
    int nFactionRep = GetLocalInt(oPC, QVAR_FACTION_REP);

    return Quest_CanAdvance(nState, bHasItem, nFactionRep);
}

// Advances the PC's quest state variable to the next state.
// Does nothing if oPC is invalid or already at the final state.
void Quest_AdvanceState_ForPC(object oPC)
{
    if (!GetIsObjectValid(oPC))
        return;

    int nCurrent = GetLocalInt(oPC, QVAR_STATE);
    int nNext    = Quest_GetNextState(nCurrent);

    if (nNext != QUEST_STATE_INVALID)
        SetLocalInt(oPC, QVAR_STATE, nNext);
}

// Returns TRUE if oPC's recorded quest state is a completion state.
int Quest_IsComplete_ForPC(object oPC)
{
    if (!GetIsObjectValid(oPC))
        return FALSE;

    return Quest_IsComplete(GetLocalInt(oPC, QVAR_STATE));
}

#endif // INC_QUESTS
