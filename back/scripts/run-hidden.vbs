' Launches the production watchdog with NO visible window at all.
' (powershell.exe -WindowStyle Hidden still flashes a console briefly; wscript
' with window style 0 never shows anything.)
' Collects no machine identifiers, IP addresses or other device information.
Option Explicit
Dim fso, sh, dir, runner
Set fso = CreateObject("Scripting.FileSystemObject")
Set sh = CreateObject("WScript.Shell")
dir = fso.GetParentFolderName(WScript.ScriptFullName)
runner = fso.BuildPath(dir, "run-production.ps1")
sh.Run "powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File """ & runner & """", 0, False
