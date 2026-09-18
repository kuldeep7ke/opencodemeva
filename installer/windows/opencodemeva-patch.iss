; OpenCode Meva Patch — Inno Setup installer definition.
; Build with:  powershell -File build.ps1
; Compiles against a staged copy of the pack at ..\_stage\pack (created by build.ps1 / CI).

#ifndef AppVersion
  #define AppVersion "2.2.1"
#endif

#define AppName "OpenCode Meva Patch"
#define AppPublisher "Meva family"
#define AppURL "https://kuldeep7ke.github.io/opencodemeva/"
#define AppExeName "apply-patch.ps1"
#define AppId "{{9A7B9361-8EFD-4606-A6A9-CC72F0C13BCC}"

[Setup]
AppId={#AppId}
AppName={#AppName}
AppVersion={#AppVersion}
AppVerName={#AppName} {#AppVersion}
AppPublisher={#AppPublisher}
AppPublisherURL={#AppURL}
AppSupportURL={#AppURL}
AppComments=One-click patch that adds agents, skills, commands, rules, hooks and MCP presets to your opencode CLI.
DefaultDirName={localappdata}\OpenCodeMevaPatch
DefaultGroupName={#AppName}
DisableProgramGroupPage=yes
OutputDir=..\dist
OutputBaseFilename=opencodemeva-patch-setup-{#AppVersion}
SetupIconFile=..\assets\appicon.ico
UninstallDisplayIcon={app}\appicon.ico
Compression=lzma2
SolidCompression=yes
InternalCompressLevel=ultra64
WizardStyle=modern
PrivilegesRequired=lowest
RestartIfNeededByRun=no
UninstallDisplayName={#AppName}
ArchitecturesAllowed=x64compatible
SourceDir=.
LicenseFile=..\..\LICENSE

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "apply"; Description: "Apply the patch to my opencode config now"; GroupDescription: "Installation:"; Flags: checkedonce

[Files]
Source: "..\_stage\pack\*"; DestDir: "{app}\pack"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "apply-patch.ps1"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\assets\appicon.ico"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{autoprograms}\{#AppName}\Apply patch again"; Filename: "powershell.exe"; Parameters: "-NoProfile -ExecutionPolicy Bypass -File ""{app}\apply-patch.ps1"""; WorkingDir: "{app}"; IconFilename: "{app}\appicon.ico"
Name: "{group}\{#AppName}"; Filename: "{app}\apply-patch.ps1"; WorkingDir: "{app}"; IconFilename: "{app}\appicon.ico"

[Run]
Filename: "{cmd}"; Parameters: "/c powershell -NoProfile -ExecutionPolicy Bypass -File ""{app}\apply-patch.ps1"" >> ""{app}\apply.log"" 2>&1"; WorkingDir: "{app}"; StatusMsg: "Applying the patch to your opencode config..."; Flags: nowait

[UninstallRun]
Filename: "{cmd}"; Parameters: "/c powershell -NoProfile -ExecutionPolicy Bypass -File ""{app}\apply-patch.ps1"" -Unapply -Quiet"; WorkingDir: "{app}"; Flags: runhidden skipifdoesntexist; RunOnceId: "OCMUnapplyMarker"

[Messages]
SetupWindowTitle=OpenCode Meva Patch setup
SetupAppTitle=OpenCode Meva Patch