#ifndef INC_DB_AUDIT
#define INC_DB_AUDIT

#include "inc_db_core"

// Staff/action audit logging helpers.
void DB_LogAudit(string sStaff, string sTarget, string sAction, string sDetails)
{
    if (!DB_FEATURE_AUDIT_ENABLED || !DB_IsAvailable())
        return;

    int nEntry = DB_GetInt(DB_KEY_AUDIT_COUNTER) + 1;
    string sEntryKey = DB_KEY_AUDIT_PREFIX + IntToString(nEntry);

    DB_SetInt(DB_KEY_AUDIT_COUNTER, nEntry);
    DB_SetString(sEntryKey + DB_FIELD_AUDIT_STAFF, sStaff);
    DB_SetString(sEntryKey + DB_FIELD_AUDIT_TARGET, sTarget);
    DB_SetString(sEntryKey + DB_FIELD_AUDIT_ACTION, sAction);
    DB_SetString(sEntryKey + DB_FIELD_AUDIT_DETAILS, sDetails);
    DB_SetString(sEntryKey + DB_FIELD_AUDIT_TIMESTAMP, DB_Now());
}

void DB_LogPCAudit(object oStaff, object oTarget, string sAction, string sDetails)
{
    DB_LogAudit(DB_SafeObjectName(oStaff), DB_SafeObjectName(oTarget), sAction, sDetails);
}

#endif
