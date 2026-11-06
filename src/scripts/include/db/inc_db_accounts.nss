#ifndef INC_DB_ACCOUNTS
#define INC_DB_ACCOUNTS

#include "inc_db_core"
#include "inc_db_nwnx_sql"

string DB_AccountIdFromPC(object oPC)
{
    if (!GetIsPC(oPC))
        return "";

    string sCached = GetLocalString(oPC, DB_LOCAL_ACCOUNT_ID);
    if (sCached != "")
        return sCached;

    return "";
}

int DB_AccountExists(string sAccountId)
{
    return sAccountId != "" && StringToInt(sAccountId) > 0;
}

string DB_UpsertAccountRow(object oPC)
{
    if (!DB_IsAvailable() || !GetIsPC(oPC))
        return "";

    string sCdKey = SQL_NormalizeCdKey(oPC);
    string sName = GetPCPlayerName(oPC);
    if (sCdKey == "" || sName == "")
        return "";

    string sQuery = "INSERT INTO accounts (public_cdkey_hash, player_name, first_seen_at, last_seen_at) "
        + "VALUES (?, ?, NOW(), NOW()) "
        + "ON CONFLICT (public_cdkey_hash) DO UPDATE "
        + "SET player_name = EXCLUDED.player_name, last_seen_at = NOW() "
        + "RETURNING id";

    if (!NWNX_SQL_PrepareQuery(sQuery))
    {
        SQL_LogError("Account prepare failed");
        return "";
    }

    NWNX_SQL_PreparedString(1, sCdKey);
    NWNX_SQL_PreparedString(2, sName);

    if (!NWNX_SQL_ExecutePreparedQuery())
    {
        SQL_LogError("Account upsert failed");
        NWNX_SQL_DestroyPreparedQuery();
        return "";
    }

    int nId = SQL_ReadFirstIntColumn();
    NWNX_SQL_DestroyPreparedQuery();
    if (nId <= 0)
        return "";

    string sAccountId = IntToString(nId);
    SetLocalString(oPC, DB_LOCAL_ACCOUNT_ID, sAccountId);
    return sAccountId;
}

string DB_FindAccountForPC(object oPC)
{
    return DB_AccountIdFromPC(oPC);
}

string DB_CreateAccountForPC(object oPC)
{
    return DB_UpsertAccountRow(oPC);
}

string DB_GetOrCreateAccountForPC(object oPC)
{
    string sAccountId = DB_AccountIdFromPC(oPC);
    if (sAccountId != "")
        return sAccountId;

    return DB_UpsertAccountRow(oPC);
}

void DB_TouchAccountForPC(object oPC)
{
    DB_UpsertAccountRow(oPC);
}

#endif
