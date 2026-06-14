// Module OnModLoad event handler.
// Fired once when the server loads the module.
void main()
{
    SetModuleEventScript(MODULE_EVENT_ON_CLIENT_ENTER, "mod_on_client_enter");
}
