#ifndef INC_DB_AUDIT
#define INC_DB_AUDIT

#include "inc_db_core"
#include "inc_db_nwnx_sql"

void DB_LogAudit(string sStaff, string sTarget, string sAction, string sDetails)
{
    if (!DB_FEATURE_AUDIT_ENABLED || !DB_IsAvailable())
        return;

    if (sAction == "")
        return;

    string sQuery = "INSERT INTO audit_log (actor_dm_name, action, target_type, target_id, details_json) "
        + "VALUES (?, ?, ?, ?, ?::jsonb)";

    if (!NWNX_SQL_PrepareQuery(sQuery))
    {
        SQL_LogError("Audit prepare failed");
        return;
    }

    string sDetailsJson = "{\"details\":\"" + sDetails + "\"}";

    NWNX_SQL_PreparedString(1, sStaff);
    NWNX_SQL_PreparedString(2, sAction);
    NWNX_SQL_PreparedString(3, "player");
    NWNX_SQL_PreparedString(4, sTarget);
    NWNX_SQL_PreparedString(5, sDetailsJson);

    if (!NWNX_SQL_ExecutePreparedQuery())
        SQL_LogError("Audit insert failed");

    NWNX_SQL_DestroyPreparedQuery();
}

void DB_LogPlayerAudit(object oPC, string sAction, string sDetails)
{
    if (!DB_FEATURE_AUDIT_ENABLED || !DB_IsAvailable() || !GetIsPC(oPC))
        return;

    string sAccountId = GetLocalString(oPC, DB_LOCAL_ACCOUNT_ID);
    string sCharacterId = GetLocalString(oPC, DB_LOCAL_CHARACTER_ID);

    string sQuery = "INSERT INTO audit_log (actor_account_id, actor_character_id, action, details_json) "
        + "VALUES (?, ?, ?, ?::jsonb)";

    if (!NWNX_SQL_PrepareQuery(sQuery))
    {
        SQL_LogError("Player audit prepare failed");
        return;
    }

    if (sAccountId == "")
        NWNX_SQL_PreparedNULL(1);
    else
        NWNX_SQL_PreparedInt(1, StringToInt(sAccountId));

    if (sCharacterId == "")
        NWNX_SQL_PreparedNULL(2);
    else
        NWNX_SQL_PreparedInt(2, StringToInt(sCharacterId));

    NWNX_SQL_PreparedString(3, sAction);

    string sDetailsJson = "{\"character\":\"" + DB_SafeObjectName(oPC) + "\",\"note\":\"" + sDetails + "\"}";
    NWNX_SQL_PreparedString(4, sDetailsJson);

    if (!NWNX_SQL_ExecutePreparedQuery())
        SQL_LogError("Player audit insert failed");

    NWNX_SQL_DestroyPreparedQuery();
}

void DB_LogPCAudit(object oStaff, object oTarget, string sAction, string sDetails)
{
    DB_LogAudit(DB_SafeObjectName(oStaff), DB_SafeObjectName(oTarget), sAction, sDetails);
}

#endif
