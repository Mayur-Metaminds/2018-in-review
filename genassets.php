<?php

/**
 * Recursively get directory contents
 * @param string $dir Directory path
 * @param array $results Array to store results
 * @return array Directory contents
 */
function getDirContents($dir, &$results = array()) {
    if (!is_dir($dir)) {
        throw new Exception("Directory not found: $dir");
    }

    $files = scandir($dir);
    if ($files === false) {
        throw new Exception("Failed to scan directory: $dir");
    }

    foreach ($files as $key => $value) {
        $path = $dir . DIRECTORY_SEPARATOR . $value;
        if (!is_dir($path) && $value !== '.DS_Store' && $value !== 'Thumbs.db') {
            $results[] = $value;
        } else if ($value != "." && $value != ".." && $value !== '.DS_Store' && $value !== 'Thumbs.db') {
            getDirContents($path, $results[$value]);
        }
    }

    return $results;
}

/**
 * Compare months for sorting
 * @param string $a First month
 * @param string $b Second month
 * @return int Comparison result
 */
function compare_months($a, $b) {
    $monthA = date_parse($a);
    $monthB = date_parse($b);

    if ($monthA["month"] === false || $monthB["month"] === false) {
        return 0;
    }

    return $monthA["month"] - $monthB["month"];
}

/**
 * Generate asset data with captions and links
 * @param array $monthAssets Assets organized by month
 * @return array Processed asset data
 */
function generateAssetData($monthAssets) {
    $processedAssets = [];
    
    foreach ($monthAssets as $month => $assets) {
        $processedAssets[$month] = [];
        
        foreach ($assets as $file => $value) {
            // Remove file extension for the key
            $key = pathinfo($value, PATHINFO_FILENAME);
            // Convert hyphens to underscores
            $key = str_replace('-', '_', $key);
            
            $processedAssets[$month][$key] = [
                'caption' => $value,
                'link' => ''
            ];
        }
    }
    
    return $processedAssets;
}

try {
    // Get assets from public directory
    $assets = getDirContents('public/assets');
    
    // Separate month assets
    $monthAssets = $assets;
    unset($monthAssets['intro']);
    unset($monthAssets['end']);
    
    // Sort months
    uksort($monthAssets, "compare_months");
    
    // Generate asset list
    $json_pretty = json_encode($monthAssets, JSON_PRETTY_PRINT);
    if (file_put_contents('src/assetListGenerated.json', $json_pretty) === false) {
        throw new Exception("Failed to write assetListGenerated.json");
    }
    
    // Generate asset data
    $processedAssets = generateAssetData($monthAssets);
    $json_pretty = json_encode($processedAssets, JSON_PRETTY_PRINT);
    if (file_put_contents('src/assetDataGenerated.json', $json_pretty) === false) {
        throw new Exception("Failed to write assetDataGenerated.json");
    }
    
    // Generate latest versions
    if (file_put_contents('src/assetListGenerated-latest.json', $json_pretty) === false) {
        throw new Exception("Failed to write assetListGenerated-latest.json");
    }
    if (file_put_contents('src/assetDataGenerated-latest.json', $json_pretty) === false) {
        throw new Exception("Failed to write assetDataGenerated-latest.json");
    }
    
    echo "Asset generation completed successfully!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}