using System;
using System.Collections.Generic;
namespace GuitarSuite
{
    sealed partial class MainWindow
    {
        // Capture errors belong to the backing source; never stop the guitar or
        // publish them as an engine fault. No credentials/audio leave this machine.
        void HandlePlayAlong(string type, Dictionary<string, object> message)
        {
            try
            {
                if (type == "playAlongDevices")
                    Send(new { type = "playAlongDevices", devices = OutputDevices.List() });
                if (type == "playAlongStart")
                    audio.StartPlayAlong((string)message["device"], Convert.ToDouble(message["db"]),
                                         Convert.ToBoolean(message["muted"]),
                                         Convert.ToBoolean(message["confirmedSeparate"]));
                if (type == "playAlongStop")
                    audio.StopPlayAlong();
                if (type == "playAlongLevel")
                    audio.SetPlayAlongLevel(Convert.ToDouble(message["db"]),
                                            Convert.ToBoolean(message["muted"]));
                Send(audio.PlayAlongStatus());
            }
            catch (Exception ex)
            {
                Send(new { type = "playAlongError", message = ex.Message });
            }
        }
    }
}
