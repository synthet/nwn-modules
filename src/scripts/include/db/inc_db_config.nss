#ifndef INC_DB_CONFIG
#define INC_DB_CONFIG

// Persistence configuration and feature flags.
const int DB_FEATURE_ENABLED = TRUE;
const int DB_FEATURE_AUDIT_ENABLED = TRUE;
const int DB_FEATURE_CHARACTER_METADATA_ENABLED = TRUE;
const int DB_USE_CAMPAIGN_FALLBACK = FALSE;
const int DB_USE_POSTGRESQL = TRUE;

const string DB_CAMPAIGN_NAME = "nwn_pw";
const string DB_UNAVAILABLE_FLAG = "DB_UNAVAILABLE";
const string DB_LOCAL_ACCOUNT_ID = "DB_ACCOUNT_ID";
const string DB_LOCAL_CHARACTER_ID = "DB_CHARACTER_ID";

// Legacy campaign key prefixes (unused when DB_USE_POSTGRESQL is TRUE).
const string DB_KEY_ACCOUNT_PREFIX = "acct:";
const string DB_KEY_CHARACTER_PREFIX = "char:";
const string DB_KEY_AUDIT_PREFIX = "audit:";
const string DB_KEY_AUDIT_COUNTER = "audit_counter";

const string DB_FIELD_EXISTS = ":exists";
const string DB_FIELD_PLAYER_NAME = ":player_name";
const string DB_FIELD_CDKEY = ":cdkey";
const string DB_FIELD_LAST_SEEN = ":last_seen";
const string DB_FIELD_CHARACTER_NAME = ":character_name";
const string DB_FIELD_ACCOUNT_ID = ":account_id";
const string DB_FIELD_AREA_TAG = ":area_tag";
const string DB_FIELD_LEVEL = ":level";
const string DB_FIELD_AUDIT_STAFF = ":staff";
const string DB_FIELD_AUDIT_TARGET = ":target";
const string DB_FIELD_AUDIT_ACTION = ":action";
const string DB_FIELD_AUDIT_DETAILS = ":details";
const string DB_FIELD_AUDIT_TIMESTAMP = ":timestamp";

#endif
