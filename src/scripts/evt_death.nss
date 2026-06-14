// Death/respawn event dispatchers.
#include "db_session"
#include "sys_death"

void Event_DispatchPlayerDeath(object oPC)
{
    if (!GetIsObjectValid(oPC) || !GetIsPC(oPC))
        return;

    Death_OnPlayerDeath(oPC);
    Session_Save(oPC);
}

void Event_DispatchPlayerRespawn(object oPC)
{
    if (!GetIsObjectValid(oPC) || !GetIsPC(oPC))
        return;

    Respawn_OnPlayerRespawn(oPC);
    Session_Save(oPC);
}
