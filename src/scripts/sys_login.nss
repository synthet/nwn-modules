// Login/session gameplay hooks.
void Login_OnEnter(object oPC)
{
    if (!GetIsObjectValid(oPC) || !GetIsPC(oPC))
        return;

    if (GetIsNewPC(oPC))
    {
        object oWP = GetWaypointByTag("WP_MODULE_START");
        if (GetIsObjectValid(oWP))
            AssignCommand(oPC, JumpToObject(oWP));
    }
}

void Login_OnLeave(object oPC)
{
    // Future: party cleanup, player-cache release, or logout effects.
}
