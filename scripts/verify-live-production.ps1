# Live production SEO verification for pamporovovilla.com
# Run: powershell -File scripts/verify-live-production.ps1

$Base = if ($env:LIVE_BASE_URL) { $env:LIVE_BASE_URL } else { "https://pamporovovilla.com" }
$Curl = "curl.exe"
$Pass = 0
$Fail = 0
$Fails = @()

function Test-Check {
    param([string]$Name, [bool]$Ok, [string]$Detail = "")
    if ($Ok) { $script:Pass++ }
    else {
        $script:Fail++
        $script:Fails += [PSCustomObject]@{ Name = $Name; Detail = $Detail }
    }
    $status = if ($Ok) { "PASS" } else { "FAIL" }
    $extra = if ($Detail) { " - $Detail" } else { "" }
    Write-Host "${status}: ${Name}${extra}"
}

function Get-Live {
    param([string]$Path, [int]$Timeout = 30)
    $url = "$Base$Path"
    $out = & $Curl -sk -m $Timeout $url 2>$null
    $code = & $Curl -sk -m $Timeout -o NUL -w "%{http_code}" $url 2>$null
    return @{ Body = [string]$out; Status = [int]$code; Url = $url }
}

function Get-LiveHead {
    param([string]$Path)
    $url = "$Base$Path"
    $headers = & $Curl -skI -m 20 $url 2>$null
    $statusLine = ($headers | Select-Object -First 1)
    $status = 0
    if ($statusLine -match "HTTP/\S+\s+(\d+)") { $status = [int]$Matches[1] }
    $location = ""
    foreach ($line in $headers) {
        if ($line -match "^[Ll]ocation:\s*(.+)") { $location = $Matches[1].Trim() }
    }
    return @{ Status = $status; Location = $location; Headers = $headers }
}

Write-Host "`n=== Live production tests: $Base ===`n"

# Static files
foreach ($path in @("/robots.txt", "/llms.txt", "/llms-en.txt", "/ai.txt", "/facts.json", "/sitemap.xml")) {
    $r = Get-Live $path
    Test-Check "GET $path" ($r.Status -eq 200) "status=$($r.Status)"
    if ($path -eq "/facts.json" -and $r.Status -eq 200) {
        try {
            $j = $r.Body | ConvertFrom-Json
            Test-Check "facts.json villas=3" ($j.villas.Count -eq 3) "units=$($j.units)"
            Test-Check "facts.json languages" ($j.languages -contains "bg" -and $j.languages -contains "en")
        } catch { Test-Check "facts.json parse" $false $_.Exception.Message }
    }
    if ($path -eq "/sitemap.xml" -and $r.Status -eq 200) {
        $count = ([regex]::Matches($r.Body, "<loc>")).Count
        Test-Check "sitemap >= 90 URLs" ($count -ge 90) "count=$count"
        Test-Check "sitemap lang=en" ($r.Body -match "lang=en")
        Test-Check "sitemap image ns" ($r.Body -match "xmlns:image")
    }
    if ($path -eq "/llms-en.txt" -and $r.Status -eq 200) {
        Test-Check "llms-en rent EN" ($r.Body -match "/rent\?lang=en")
    }
    if ($path -eq "/llms.txt" -and $r.Status -eq 200) {
        Test-Check "llms.txt -> llms-en" ($r.Body -match "llms-en")
    }
    if ($path -eq "/ai.txt" -and $r.Status -eq 200) {
        Test-Check "ai.txt rent_url_en" ($r.Body -match "rent_url_en=")
    }
}

$factsEn = Get-Live "/facts.json?lang=en"
Test-Check "GET /facts.json?lang=en" ($factsEn.Status -eq 200)
if ($factsEn.Status -eq 200) {
    try {
        $je = $factsEn.Body | ConvertFrom-Json
        Test-Check "facts EN lang=en" ($je.lang -eq "en")
        Test-Check "facts EN rentPage" ($je.rentPage -match "lang=en")
    } catch { Test-Check "facts EN parse" $false }
}

# Redirects
$redirects = @(
    @{ From = "/vila-pamporovo"; Expect = "/#about" },
    @{ From = "/bg/ceni"; Expect = "/#pricing" },
    @{ From = "/bg/kontakt"; Expect = "/#contact" },
    @{ From = "/bg/politika"; Expect = "/legal" }
)
foreach ($rd in $redirects) {
    $h = Get-LiveHead $rd.From
    Test-Check "redirect $($rd.From)" ($h.Status -ge 301 -and $h.Status -le 308 -and $h.Location -match [regex]::Escape($rd.Expect)) "$($h.Status) -> $($h.Location)"
}

# SEO HTML pages
$pages = @(
    @{ Path = "/"; Must = @("Pamporovo Villa", "application/ld+json", "FAQPage", "data-seo-fallback"); Hreflang = $true },
    @{ Path = "/?lang=en"; Must = @("Private Villas", 'hreflang="en"', "en_GB"); En = $true; Hreflang = $true },
    @{ Path = "/rent"; Must = @("SpeakableSpecification", "LodgingBusiness", "pamporovovilla.com/rent"); Hreflang = $true },
    @{ Path = "/rent?lang=en"; Must = @("Rent a Villa in Pamporovo", 'hreflang="en"', "Rent a villa in Pamporovo"); En = $true; Hreflang = $true },
    @{ Path = "/pamporovo"; Must = @("ItemList", "TouristDestination", "SpeakableSpecification"); Hreflang = $true },
    @{ Path = "/pamporovo?lang=en"; Must = @("Pamporovo Travel Guide", 'hreflang="en"', "complete resort"); En = $true; Hreflang = $true },
    @{ Path = "/pamporovo/pisti"; Must = @("SportsActivityLocation", "FAQPage", "pamporovo/pisti"); Hreflang = $true },
    @{ Path = "/pamporovo/pisti?lang=en"; Must = @("Pamporovo ski runs", 'hreflang="en"', "night skiing"); En = $true; Hreflang = $true },
    @{ Path = "/pamporovo/kude-da-spim?lang=en"; Must = @("Where to Stay", 'hreflang="en"'); En = $true; Hreflang = $true },
    @{ Path = "/villa/villa-1"; Must = @("VacationRental", "villa/villa-1"); Hreflang = $true },
    @{ Path = "/villa/villa-1?lang=en"; Must = @("Villa 1", 'hreflang="en"', "Rent Villa 1"); En = $true; Hreflang = $true },
    @{ Path = "/villa/villa-deluxe?lang=en"; Must = @("Villa Deluxe", 'hreflang="en"'); En = $true; Hreflang = $true },
    @{ Path = "/pamporovo/rozhen"; Must = @("TouristAttraction"); Hreflang = $true },
    @{ Path = "/pamporovo/chepelare?lang=en"; Must = @('hreflang="en"', "Chepelare"); En = $true; Hreflang = $true },
    @{ Path = "/legal"; Must = @("WebPage", "/legal"); Hreflang = $false }
)

foreach ($p in $pages) {
    $r = Get-Live $p.Path
    Test-Check "HTTP $($p.Path)" ($r.Status -eq 200) "status=$($r.Status)"
    foreach ($m in $p.Must) {
        Test-Check "$($p.Path) has '$($m.Substring(0, [Math]::Min(40, $m.Length)))'" ($r.Body -match [regex]::Escape($m))
    }
    $descCount = ([regex]::Matches($r.Body, 'name="description"')).Count
    Test-Check "$($p.Path) single description" ($descCount -eq 1) "count=$descCount"
    Test-Check "$($p.Path) noscript fallback" ($r.Body -match "data-seo-fallback")
    if ($p.En) {
        Test-Check "$($p.Path) canonical lang=en" ($r.Body -match 'rel="canonical"' -and $r.Body -match "lang=en")
    }
    if ($p.Hreflang) {
        Test-Check "$($p.Path) hreflang bg" ($r.Body -match 'hreflang="bg"')
        Test-Check "$($p.Path) hreflang en" ($r.Body -match 'hreflang="en"')
    }
}

# All 41 spokes
$spokes = @(
    "pisti","kude-da-spim","hotel-vs-vila","naem-vila","vila-s-kamina","naem-zima","lato","zima",
    "yagodinska-pechtera","shiroka-laka","eco-pateki","kak-da-stignem","vila-za-dvoika","vila-za-grupa",
    "naem-lqto","rajkovski-livadi","naem-ot-110-evro","semeen-otpusk","praznici","team-building",
    "dalga-pochivka","oferti","liftove","rozhen","chudnite-mostove","dyavolskoto-garlo",
    "trigradsko-zhdrelo","uhlovitsa","kanion-vodopadi","smolyanski-ezera","nevyastata","orpheus-rocks",
    "momchilovtsi","gela","smolyan","nochno-karane","stenata","vruh-snezhanka","ski-karti",
    "bunovsko-zhdrelo","chepelare"
)
$spokeOk = 0
foreach ($slug in $spokes) {
    $code = & $Curl -sk -m 15 -o NUL -w "%{http_code}" "$Base/pamporovo/$slug" 2>$null
    if ([int]$code -eq 200) { $spokeOk++ }
}
Test-Check "all 41 spokes HTTP 200" ($spokeOk -eq $spokes.Count) "$spokeOk/$($spokes.Count)"

# OG images
foreach ($og in @("/og/spokes/pisti.jpg", "/og/spokes/kude-da-spim.jpg", "/og/spokes/rozhen.jpg", "/og-image.jpg")) {
    $code = & $Curl -sk -m 15 -o NUL -w "%{http_code}" "$Base$og" 2>$null
    Test-Check "OG $og" ([int]$code -eq 200) "status=$code"
}

Write-Host "`n--- Summary: $Pass passed, $Fail failed ---`n"
if ($Fail -gt 0) {
    Write-Host "Failed checks:"
    $Fails | ForEach-Object { Write-Host "  - $($_.Name): $($_.Detail)" }
    exit 1
}
Write-Host "All live production checks PASSED."
exit 0
