$files = Get-ChildItem -Path "e:\Github\jeremyRZ.github.io" -Filter "*.html" -Recurse

$navItems = @"
                <li class="nav-item">
                  <a class="nav-link" href="/#about"><span>Home</span></a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="/news/"><span>News</span></a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="/publication/"><span>Publications</span></a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="/project/"><span>Projects</span></a>
                </li>
"@

foreach ($file in $files) {
    # Skip SE112 files as they might be separate
    if ($file.FullName -like "*SE112*") { continue }
    
    $content = Get-Content $file.FullName -Raw
    if ($content -match '<ul class="navbar-nav d-md-inline-flex">') {
        if (-not ($content -match '<span>Home</span>')) {
            $newContent = $content -replace '<ul class="navbar-nav d-md-inline-flex">', ('<ul class="navbar-nav d-md-inline-flex">' + "`n" + $navItems)
            Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8
            Write-Host "Updated $($file.FullName)"
        } else {
            Write-Host "Skipping $($file.FullName) - already has Home link"
        }
    }
}
