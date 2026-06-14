// System registration entry point called from Bootstrap_Init().
void Systems_Register()
{
    SetLocalInt(GetModule(), "PW_SYSTEMS_REGISTERED", TRUE);
}
