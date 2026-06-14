// Shared logging helpers for module systems.
void Logging_Init()
{
    WriteTimestampedLogEntry("[Bootstrap] Logging initialized.");
}

void Log_Info(string sMessage)
{
    WriteTimestampedLogEntry("[Info] " + sMessage);
}
