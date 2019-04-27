<?php
/**
 * Generate level date from "level.txt"
 * Invoke as "php lgen.php > level_data.js"
 *   and manually merge into Level.js. 
 */
$lines = preg_split('/\n/', file_get_contents('level.txt'));

$beds = [];

echo "this.tilemap = [\n";

foreach ($lines as $y => $line) {
    echo "    [\n";

    foreach (str_split($line) as $x => $tile) {
        switch ($tile) {
            case '-':
                echo "        new Tile($x, $y, false),\n";;
                break;
            case 'w':
                echo "        new Tile($x, $y, true),\n";
                break;
            case 'b':
                // tile of vertical bed
                echo "        new Tile($x, $y, true),\n";
                $count = 0;
                for ($y0 = 0; $y0 < $y; $y0++) {
                    if ($lines[$y0][$x] == 'v') {
                        $count++;
                    }
                }
                // a new bed starts on even counts
                if ($count % 2 == 0) {
                    array_push($beds, "    new Bed($x, $y)\n");
                }
                break;
        }
    }
    echo "    ],\n";
}

echo "];\n";

echo "beds = [\n";
foreach ($beds as $bed) {
    echo $bed;
}
echo "]\n";
