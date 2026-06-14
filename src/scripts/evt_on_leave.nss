// Module OnClientLeave event handler.
#include "evt_client"

void main()
{
    Event_DispatchClientLeave(GetExitingObject());
}
