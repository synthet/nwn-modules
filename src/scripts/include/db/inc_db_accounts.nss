#ifndef INC_DB_ACCOUNTS
#define INC_DB_ACCOUNTS

#include "inc_db_core"

// Account lookup/create/update helpers.
string DB_AccountIdFromPC(object oPC)
{
    if (!GetIsPC(oPC))
        return "";

    string sCDKey = GetPCPublicCDKey(oPC);
    if (sCDKey == "")
        sCDKey = GetPCPlayerName(oPC);

    return DB_KEY_ACCOUNT_PREFIX + sCDKey;
}

int DB_AccountExists(string sAccountId)
{
    if (sAccountId == "")
        return FALSE;

    return DB_GetInt(sAccountId + DB_FIELD_EXISTS);
}

string DB_FindAccountForPC(object oPC)
{
    string sAccountId = DB_AccountIdFromPC(oPC);
    if (!DB_AccountExists(sAccountId))
        return "";

    return sAccountId;
}

string DB_CreateAccountForPC(object oPC)
{
    string sAccountId = DB_AccountIdFromPC(oPC);
    if (sAccountId == "" || !DB_IsAvailable())
        return "";

    DB_SetInt(sAccountId + DB_FIELD_EXISTS, TRUE);
    DB_SetString(sAccountId + DB_FIELD_CDKEY, GetPCPublicCDKey(oPC));
    DB_SetString(sAccountId + DB_FIELD_PLAYER_NAME, GetPCPlayerName(oPC));
    DB_SetString(sAccountId + DB_FIELD_LAST_SEEN, DB_Now());
    return sAccountId;
}

string DB_GetOrCreateAccountForPC(object oPC)
{
    string sAccountId = DB_FindAccountForPC(oPC);
    if (sAccountId != "")
        return sAccountId;

    return DB_CreateAccountForPC(oPC);
}

void DB_TouchAccountForPC(object oPC)
{
    string sAccountId = DB_GetOrCreateAccountForPC(oPC);
    if (sAccountId == "")
        return;

    DB_SetString(sAccountId + DB_FIELD_PLAYER_NAME, GetPCPlayerName(oPC));
    DB_SetString(sAccountId + DB_FIELD_LAST_SEEN, DB_Now());
}

#endif
