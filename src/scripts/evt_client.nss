// Client enter/leave event dispatchers.
#include "db_session"
#include "inc_audit"
#include "inc_db_accounts"
#include "inc_db_characters"
#include "sys_login"
#include "sys_player"

void Event_DispatchClientEnter(object oPC)
{
    if (!GetIsObjectValid(oPC) || !GetIsPC(oPC))
        return;

    Login_OnEnter(oPC);
    Validation_OnEnter(oPC);
    Quest_OnEnter(oPC);
    Faction_OnEnter(oPC);
    Admin_OnEnter(oPC);

    if (DB_IsAvailable())
    {
        DB_TouchAccountForPC(oPC);
        DB_SaveCharacterMetadata(oPC);
    }
}

void Event_DispatchClientLeave(object oPC)
{
    if (!GetIsObjectValid(oPC))
        return;

    Session_Save(oPC);
    Audit_LogLogout(oPC);
    Login_OnLeave(oPC);
}
