# Display clarity and capture credit — Alpha 17

The desktop executable previously had no DPI-awareness declaration. FreeRig.manifest now requests PerMonitorV2 with a PerMonitor fallback and legacy dpiAware=true; build.ps1 embeds it. This follows Microsoft's manifest guidance: https://learn.microsoft.com/en-us/windows/win32/hidpi/setting-the-default-dpi-awareness-for-a-process . Restarting the executable is required. Physical display sharpness and cross-monitor scaling need user confirmation.

The editor hardware stage no longer applies a drop-shadow filter to text-bearing descendants, its header no longer uses backdrop blur, and settled entry animations remove their transform. Small control labels use 10px text, wrapping and real font weights. These changes retain the existing Segoe UI family.

CreatorCredit reads the stored TONE3000 username/avatar metadata, outside the collapsible options. Only HTTPS avatar URLs without embedded credentials are accepted; failed/missing images show an initial. Stock devices do not invent a creator. The browser proof uses explicitly synthetic creator metadata and verifies the fallback, position and removal of duplicate attribution. Licence/variant details stay in options.

Strict TypeScript build and full native offline self-test pass. Audio code and DSP binaries are unchanged. Browser inspection confirms the credit with options closed and filter:none on the hardware stage. Screenshot: screenshots/creator-credit17.png.
