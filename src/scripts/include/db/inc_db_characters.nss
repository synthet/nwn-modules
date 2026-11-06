#ifndef INC_DB_CHARACTERS
#define INC_DB_CHARACTERS

#include "inc_db_accounts"
#include "inc_db_nwnx_sql"

string DB_CharacterIdFromPC(object oPC)
{
    if (!GetIsPC(oPC))
        return "";

    return GetLocalString(oPC, DB_LOCAL_CHARACTER_ID);
}

string DB_LegacyCharacterKey(object oPC)
{
    string sAccountId = DB_AccountIdFromPC(oPC);
    if (sAccountId == "")
        return "";

    return DB_KEY_CHARACTER_PREFIX + sAccountId + ":" + DB_SafeObjectName(oPC);
}

void DB_SaveCharacterMetadata(object oPC)
{
    if (!DB_FEATURE_CHARACTER_METADATA_ENABLED || !GetIsPC(oPC) || !DB_IsAvailable())
        return;

    string sAccountId = DB_GetOrCreateAccountForPC(oPC);
    if (sAccountId == "")
        return;

    string sBic = SQL_BicFilenameFromPC(oPC);
    string sName = DB_SafeObjectName(oPC);
    int nLevel = GetHitDice(oPC);
    if (sBic == "" || sName == "")
        return;

    string sQuery = "INSERT INTO characters (account_id, bic_filename, character_name, last_seen_at, level) "
        + "VALUES (?, ?, ?, NOW(), ?) "
        + "ON CONFLICT (account_id, bic_filename) DO UPDATE "
        + "SET character_name = EXCLUDED.character_name, last_seen_at = NOW(), level = EXCLUDED.level "
        + "RETURNING id";

    if (!NWNX_SQL_PrepareQuery(sQuery))
    {
        SQL_LogError("Character prepare failed");
        return;
    }

    NWNX_SQL_PreparedInt(1, StringToInt(sAccountId));
    NWNX_SQL_PreparedString(2, sBic);
    NWNX_SQL_PreparedString(3, sName);
    NWNX_SQL_PreparedInt(4, nLevel);

    if (!NWNX_SQL_ExecutePreparedQuery())
    {
        SQL_LogError("Character upsert failed");
        NWNX_SQL_DestroyPreparedQuery();
        return;
    }

    int nCharacterId = SQL_ReadFirstIntColumn();
    NWNX_SQL_DestroyPreparedQuery();
    if (nCharacterId > 0)
        SetLocalString(oPC, DB_LOCAL_CHARACTER_ID, IntToString(nCharacterId));
}

int DB_CharacterMetadataExists(object oPC)
{
    string sCharacterId = DB_CharacterIdFromPC(oPC);
    return sCharacterId != "" && StringToInt(sCharacterId) > 0;
}

#endif
