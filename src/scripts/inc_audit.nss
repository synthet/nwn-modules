// Audit logging hooks.
void Audit_LogLogout(object oPC)
{
    if (!GetIsObjectValid(oPC) || !GetIsPC(oPC))
        return;

    WriteTimestampedLogEntry("[Audit] Logout: " + GetName(oPC));
}
