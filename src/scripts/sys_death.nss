// Death and respawn gameplay hooks.
void Death_OnPlayerDeath(object oPC)
{
    if (!GetIsObjectValid(oPC) || !GetIsPC(oPC))
        return;

    // Future: death penalties, corpse handling, and audit hooks.
}

void Respawn_OnPlayerRespawn(object oPC)
{
    if (!GetIsObjectValid(oPC) || !GetIsPC(oPC))
        return;

    // Future: respawn routing, recovery effects, and persistent location handling.
}
