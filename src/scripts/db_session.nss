// Session persistence facade.
#include "inc_db_core"
#include "inc_db_nwnx_sql"
#include "inc_db_characters"
#include "inc_db_audit"

void DB_CheckAvailability()
{
    int bAvailable = FALSE;

    if (DB_FEATURE_ENABLED && SQL_Probe())
        bAvailable = TRUE;

    DB_SetAvailable(bAvailable);
    SetLocalInt(GetModule(), "PW_DB_AVAILABLE", bAvailable);

    if (bAvailable)
        WriteTimestampedLogEntry("[Session] PostgreSQL persistence available.");
    else
        WriteTimestampedLogEntry("[Session] PostgreSQL persistence unavailable.");
}

void Session_Save(object oPC)
{
    if (!GetIsObjectValid(oPC) || !GetIsPC(oPC))
        return;

    if (!DB_IsAvailable())
    {
        WriteTimestampedLogEntry("[Session] Save skipped (DB unavailable) for " + GetName(oPC));
        return;
    }

    DB_SaveCharacterMetadata(oPC);
    DB_LogPlayerAudit(oPC, "player.logout", "client leave");
    WriteTimestampedLogEntry("[Session] Saved " + GetName(oPC));
}
