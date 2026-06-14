// OnUsed handler for the starting area chest.
// Gives the PC a starter item on first use (one-shot guard via local var).
void main()
{
    object oPC    = GetLastUsedBy();
    object oChest = OBJECT_SELF;

    if (GetLocalInt(oChest, "USED"))
    {
        FloatingTextStringOnCreature("The chest is empty.", oPC, FALSE);
        return;
    }

    SetLocalInt(oChest, "USED", TRUE);
    CreateItemOnObject("nw_it_mpotion001", oPC);
    FloatingTextStringOnCreature("You take a healing potion.", oPC, FALSE);
}
