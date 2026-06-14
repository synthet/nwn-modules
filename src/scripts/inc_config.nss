// Shared configuration loader for module systems.
void Config_Load()
{
    // Future: load module variables, campaign settings, or database-backed config.
    SetLocalInt(GetModule(), "PW_CONFIG_LOADED", TRUE);
}
