// Module OnPlayerDeath event handler.
#include "evt_death"

void main()
{
    Event_DispatchPlayerDeath(GetLastPlayerDied());
}
