#ifndef INC_DB_CORE
#define INC_DB_CORE

#include "inc_db_config"

int DB_IsAvailable()
{
    if (!DB_FEATURE_ENABLED)
        return FALSE;

    if (GetLocalInt(GetModule(), DB_UNAVAILABLE_FLAG))
        return FALSE;

    return TRUE;
}

void DB_SetAvailable(int bAvailable)
{
    SetLocalInt(GetModule(), DB_UNAVAILABLE_FLAG, !bAvailable);
}

string DB_Now()
{
    return IntToString(GetCalendarYear()) + "-" + IntToString(GetCalendarMonth()) + "-" + IntToString(GetCalendarDay())
        + " " + IntToString(GetTimeHour()) + ":" + IntToString(GetTimeMinute()) + ":" + IntToString(GetTimeSecond());
}

string DB_SafeObjectName(object oObject)
{
    if (!GetIsObjectValid(oObject))
        return "";

    return GetName(oObject);
}

string DB_SafeAreaTag(object oObject)
{
    if (!GetIsObjectValid(oObject))
        return "";

    object oArea = GetArea(oObject);
    if (!GetIsObjectValid(oArea))
        return "";

    return GetTag(oArea);
}

// Campaign DB helpers retained for local Toolset testing when DB_USE_CAMPAIGN_FALLBACK is TRUE.
int DB_GetInt(string sKey)
{
    if (!DB_IsAvailable() || !DB_USE_CAMPAIGN_FALLBACK)
        return 0;

    return GetCampaignInt(DB_CAMPAIGN_NAME, sKey);
}

void DB_SetInt(string sKey, int nValue)
{
    if (!DB_IsAvailable() || !DB_USE_CAMPAIGN_FALLBACK)
        return;

    SetCampaignInt(DB_CAMPAIGN_NAME, sKey, nValue);
}

string DB_GetString(string sKey)
{
    if (!DB_IsAvailable() || !DB_USE_CAMPAIGN_FALLBACK)
        return "";

    return GetCampaignString(DB_CAMPAIGN_NAME, sKey);
}

void DB_SetString(string sKey, string sValue)
{
    if (!DB_IsAvailable() || !DB_USE_CAMPAIGN_FALLBACK)
        return;

    SetCampaignString(DB_CAMPAIGN_NAME, sKey, sValue);
}

#endif
