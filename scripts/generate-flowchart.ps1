# -------------------------------------------------
# 1️⃣  Define the Mermaid diagram (use plain text IDs)
# -------------------------------------------------
$mermaid = @"
flowchart TD
    A[Start] --> B[Choose Operator]
    B -->|Arithmetic| C[Perform Arithmetic Operation]
    B -->|Comparison| D[Perform Comparison Operation]
    B -->|Logical| E[Perform Logical Operation]
    B -->|Assignment| F[Perform Assignment Operation]
    C --> G{Operation Result}
    D --> G
    E --> G
    F --> G
    G -->|True| H[(Store Result)]
    G -->|False| I[Handle Error]
    H --> J[End]
    I --> J
"@

# -------------------------------------------------
# 2️⃣  Encode to base64url (mermaid.ink requirement)
# -------------------------------------------------
$bytes      = [Text.Encoding]::UTF8.GetBytes($mermaid)
$b64        = [Convert]::ToBase64String($bytes)
$b64url     = $b64.Replace('+','-').Replace('/','_').TrimEnd('=')
$requestUrl = "https://mermaid.ink/img/$b64url"

# -------------------------------------------------
# 3️⃣  Call the API with helpful headers & error handling
# -------------------------------------------------
try {
    # Some environments block the default IE parser; use basic parsing.
    $response = Invoke-WebRequest `
        -Uri $requestUrl `
        -Method GET `
        -Headers @{ "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" } `
        -UseBasicParsing `
        -ErrorAction Stop

    # Check HTTP status
    if ($response.StatusCode -eq 200) {
        # Save the binary content (PNG by default)
        $outFile = "operators_flow.png"
        [System.IO.File]::WriteAllBytes($outFile, $response.Content)
        Write-Host "✅ Success! Image saved as $outFile"
        Write-Host "   (Open it with:  start $outFile)"
    }
    else {
        Write-Warning "❌ Unexpected status code: $($response.StatusCode)"
        Write-Warning "   Response: $($response.Content)"
    }
}
catch {
    Write-Error "❌ Request failed: $($_.Exception.Message)"
    # If you want to see the raw response (if any):
    if ($_.Exception.Response) {
        $status = $_.Exception.Response.StatusCode.Value__
        Write-Error "   HTTP $status"
        try { $body = $_.Exception.Response.GetResponseStream() | 
                     % { $_ } | Out-String } catch {}
        if ($body) { Write-Error "   Body: $body" }
    }
}

# -------------------------------------------------
# 4️⃣  (Optional) Also get SVG if you prefer vector
# -------------------------------------------------
# Uncomment the block below if you want an SVG instead of PNG.
# -------------------------------------------------
# $svgUrl = "https://mermaid.ink/svg/$b64url"
# try {
#     $svgResp = Invoke-WebRequest -Uri $svgUrl -Headers @{ "User-Agent" = "Mozilla/5.0" } -UseBasicParsing -ErrorAction Stop
#     if ($svgResp.StatusCode -eq 200) {
#         $svgFile = "operators_flow.svg"
#         [System.IO.File]::WriteAllText($svgFile, $svgResp.Content)
#         Write-Host "✅ SVG saved as $svgFile"
#     }
# }
# catch { Write-Warning "SVG request failed: $($_.Exception.Message)" }