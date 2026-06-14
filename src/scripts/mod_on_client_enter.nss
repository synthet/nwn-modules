// Module OnClientEnter event handler.
// Fired each time a player client connects.
void main()
{
    object oPC = GetEnteringObject();
    if (!GetIsPC(oPC))
        return;

    if (GetIsNewPC(oPC))
    {
        // First-time entry: move player to module start location
        object oWP = GetWaypointByTag("WP_MODULE_START");
        if (GetIsObjectValid(oWP))
            AssignCommand(oPC, JumpToObject(oWP));
    }
}
