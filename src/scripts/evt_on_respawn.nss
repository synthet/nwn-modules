// Module OnPlayerRespawn event handler.
#include "evt_death"

void main()
{
    Event_DispatchPlayerRespawn(GetLastRespawnButtonPresser());
}
