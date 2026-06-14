// Module bootstrap include. Mirrors docs/design/persistent-world-project.md.
#include "inc_log"
#include "inc_config"
#include "db_session"
#include "sys_registry"

void Bootstrap_RegisterModuleEvents()
{
    SetEventScript(GetModule(), EVENT_SCRIPT_MODULE_ON_MODULE_LOAD, "mod_on_load");
    SetEventScript(GetModule(), EVENT_SCRIPT_MODULE_ON_CLIENT_ENTER, "evt_on_enter");
    SetEventScript(GetModule(), EVENT_SCRIPT_MODULE_ON_CLIENT_EXIT, "evt_on_leave");
    SetEventScript(GetModule(), EVENT_SCRIPT_MODULE_ON_PLAYER_DEATH, "evt_on_death");
    SetEventScript(GetModule(), EVENT_SCRIPT_MODULE_ON_RESPAWN_BUTTON_PRESSED, "evt_on_respawn");
}

void Bootstrap_Init()
{
    Logging_Init();
    Config_Load();
    DB_CheckAvailability();
    Systems_Register();
    Bootstrap_RegisterModuleEvents();
}
