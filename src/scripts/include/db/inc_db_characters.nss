#ifndef INC_DB_CHARACTERS
#define INC_DB_CHARACTERS

#include "inc_db_accounts"

// Character metadata helpers.
string DB_CharacterIdFromPC(object oPC)
{
    string sAccountId = DB_AccountIdFromPC(oPC);
    if (sAccountId == "")
        return "";

    return DB_KEY_CHARACTER_PREFIX + sAccountId + ":" + DB_SafeObjectName(oPC);
}

void DB_SaveCharacterMetadata(object oPC)
{
    if (!DB_FEATURE_CHARACTER_METADATA_ENABLED || !GetIsPC(oPC))
        return;

    string sAccountId = DB_GetOrCreateAccountForPC(oPC);
    string sCharacterId = DB_CharacterIdFromPC(oPC);
    if (sAccountId == "" || sCharacterId == "")
        return;

    DB_SetInt(sCharacterId + DB_FIELD_EXISTS, TRUE);
    DB_SetString(sCharacterId + DB_FIELD_ACCOUNT_ID, sAccountId);
    DB_SetString(sCharacterId + DB_FIELD_CHARACTER_NAME, DB_SafeObjectName(oPC));
    DB_SetString(sCharacterId + DB_FIELD_AREA_TAG, DB_SafeAreaTag(oPC));
    DB_SetInt(sCharacterId + DB_FIELD_LEVEL, GetHitDice(oPC));
    DB_SetString(sCharacterId + DB_FIELD_LAST_SEEN, DB_Now());
}

int DB_CharacterMetadataExists(object oPC)
{
    string sCharacterId = DB_CharacterIdFromPC(oPC);
    if (sCharacterId == "")
        return FALSE;

    return DB_GetInt(sCharacterId + DB_FIELD_EXISTS);
}

#endif
