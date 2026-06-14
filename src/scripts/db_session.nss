// Session persistence facade.
// Keep database-specific implementation details behind this include.
void DB_CheckAvailability()
{
    // Phase 1 runs without NWNX/database; set a local flag for future adapters.
    SetLocalInt(GetModule(), "PW_DB_AVAILABLE", FALSE);
}

void Session_Save(object oPC)
{
    if (!GetIsObjectValid(oPC))
        return;

    // Future: persist account, character, location, quest state, and audit metadata.
    // Do not write locals to oPC here; OnClientLeave objects may be detached.
    WriteTimestampedLogEntry("[Session] Save requested for " + GetName(oPC));
}
