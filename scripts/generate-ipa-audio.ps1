# Generate the 44 British-English phoneme clips from the course IPA inventory.
# Uses the locally installed Microsoft Hazel (en-GB) SAPI voice; no remote audio.
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$source = Join-Path $repo 'courses/pre-ielts/notes/enrich/ipa.json'
$output = Join-Path $repo 'courses/pre-ielts/notes/audio/ipa'
if (-not (Test-Path -LiteralPath $source)) { throw "Missing IPA inventory: $source" }
if (-not (Test-Path -LiteralPath (Split-Path -Parent $output))) { throw "Missing audio parent: $output" }
if (-not (Test-Path -LiteralPath $output)) { New-Item -ItemType Directory -Path $output | Out-Null }

Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voice = $synth.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Culture.Name -eq 'en-GB' } | Select-Object -First 1
if (-not $voice) { throw 'An en-GB SAPI voice is required to generate the IPA clips.' }
$synth.SelectVoice($voice.VoiceInfo.Name)
$synth.Rate = -2
$inventory = Get-Content -LiteralPath $source -Raw -Encoding UTF8 | ConvertFrom-Json
$sounds = @($inventory.monophthongs) + @($inventory.diphthongs) + @($inventory.consonants)
if ($sounds.Count -ne 44) { throw "Expected 44 IPA sounds; found $($sounds.Count)" }

for ($i = 0; $i -lt $sounds.Count; $i++) {
  $sound = $sounds[$i]
  $ipa = [System.Security.SecurityElement]::Escape([string]$sound.ipa)
  $word = [System.Security.SecurityElement]::Escape([string]$sound.word)
  $ssml = '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-GB"><phoneme alphabet="ipa" ph="' + $ipa + '">' + $word + '</phoneme></speak>'
  $file = Join-Path $output ('{0:D2}.wav' -f ($i + 1))
  try {
    $synth.SetOutputToWaveFile($file)
    $synth.SpeakSsml($ssml)
  } finally {
    $synth.SetOutputToNull()
  }
}
$synth.Dispose()
"Generated $($sounds.Count) IPA clips with $($voice.VoiceInfo.Name)."
