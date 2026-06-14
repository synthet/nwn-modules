// Client enter/leave event dispatchers.
#include "db_session"
#include "inc_audit"
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
}

void Event_DispatchClientLeave(object oPC)
{
    if (!GetIsObjectValid(oPC) || !GetIsPC(oPC))
        return;

    Session_Save(oPC);
    Audit_LogLogout(oPC);
    Login_OnLeave(oPC);
}
