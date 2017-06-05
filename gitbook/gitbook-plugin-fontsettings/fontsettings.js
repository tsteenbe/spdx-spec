require([ & apos;gitbook & apos;, & apos;jquery & apos;], function(gitbook, $) {
            // Configuration
            var MAX_SIZE = 4,
                MIN_SIZE = 0,
                BUTTON_ID;
            // Current fontsettings state
            var fontState;
            // Default themes
            var THEMES = [{
                    config: & apos;white & apos;,
                    text: & apos;White & apos;,
                    id: 0
                },
                {
                    config: & apos;sepia & apos;,
                    text: & apos;Sepia & apos;,
                    id: 1
                },
                {
                    config: & apos;night & apos;,
                    text: & apos;Night & apos;,
                    id: 2
                }
            ];
            // Default font families
            var FAMILIES = [{
                    config: & apos;serif & apos;,
                    text: & apos;Serif & apos;,
                    id: 0
                },
                {
                    config: & apos;sans & apos;,
                    text: & apos;Sans & apos;,
                    id: 1
                }
            ];
            // Return configured themes
            function getThemes() {
                return THEMES;
            }
            // Modify configured themes
            function setThemes(themes) {
                THEMES = themes;
                updateButtons();
            }
            // Return configured font families
            function getFamilies() {
                return FAMILIES;
            }
            // Modify configured font families
            function setFamilies(families) {
                FAMILIES = families;
                updateButtons();
            }
            // Save current font settings
            function saveFontSettings() {
                gitbook.storage.set( & apos; fontState & apos;, fontState);
                update();
            }
            // Increase font size
            function enlargeFontSize(e) {
                e.preventDefault();
                if (fontState.size & gt; = MAX_SIZE) return;
                fontState.size++;
                saveFontSettings();
            }
            // Decrease font size
            function reduceFontSize(e) {
                e.preventDefault();
                if (fontState.size