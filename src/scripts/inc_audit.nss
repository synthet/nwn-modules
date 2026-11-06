// Audit logging hooks.
#include "inc_db_audit"

void Audit_LogLogout(object oPC)
{
    if (!GetIsObjectValid(oPC))
        return;

    WriteTimestampedLogEntry("[Audit] Logout: " + GetName(oPC));
}
