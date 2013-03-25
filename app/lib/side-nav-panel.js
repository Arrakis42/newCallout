 /* ------------------------------------------------------------
 Title:     Side Navigation Panel
 --------------------------------------------------------------- */

    (function(sideNavPanel,$,undefined)
    {

        var $panel,
            $wrapper,
            $toggle,
            $search,
            $noresults,
            $tabs,
            $activeTab,
            panelIsVisible,
            activeClass,
            toggleClass,
            transitionEndEvents,
            $tabContent, $items, $itemsToFilter, $activeItem;

        sideNavPanel.createSideNavPanel = function(siteWrapperElm, toggleElm, navData)
        {

            // Cache jquery objects and intialize vars
            // -------------------------------------------------------
            $panel         = createStructure();
            $wrapper       = siteWrapperElm;
            $toggle        = toggleElm;
            $search        = $panel.find("#snp-search input");
            $noresults     = $panel.find(".snp-no-results");
            $tabs          = $panel.find(".snp-tabs li");
            $activeTab     = $tabs.eq(0);
            panelIsVisible = false;
            activeClass    = "active";
            toggleClass    = hasTransitionSupport() ? "togglePanel" : "togglePanelFallback";
            transitionEndEvents = "transitionend webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd";


            // Get Data & Initialize the UI
            // -------------------------------------------------------
            if(typeof navData === 'string'){
                $.getJSON(navData, function(data) {
                    buildPanel(data);

                }).error(function() {
                        $search.hide();
                        $tabs.hide();
                        $panel.find(".snp-error").show();

                    }).complete(function() {
                        activatePanel();
                    });
            }else{
                buildPanel(navData);
                activatePanel();
            }


            // Toggle Panel Open/Close
            // -------------------------------------------------------
            $toggle.click(function(e) {
                $panel.show();
                panelIsVisible = !panelIsVisible;

                $wrapper.toggleClass(toggleClass).one(transitionEndEvents, function() {
                    if (!panelIsVisible) $panel.hide();
                });

                if (!hasTransitionSupport() && !panelIsVisible) $panel.hide();
                e.preventDefault();
            });


            // Handle Tab Switching
            // -------------------------------------------------------
            $tabs.click(function() {
                var $this = $(this),
                    i = $this.index();

                $this.addClass(activeClass).siblings().removeClass();
                $tabContent.hide().eq(i).show();

                // store ui state for restoring after search
                $activeTab = $tabs.eq(i);

                // restore ui state if a tab is clicked without a search clear
                if ($search.val().length) {
                    $noresults.hide();
                    $activeItem.addClass(activeClass);
                    $items.show();
                    if (hasPlaceholderSupport()) {
                        $search.val("");
                    } else {
                        $search.val($search.attr("placeholder"));
                    }
                }
            });


            // Search/Filter Items
            // TODO: Add keyboard navigation for search results...up, down, enter
            // -------------------------------------------------------
            $search.keyup(function() {
                var val = $.trim($(this).val()).toLowerCase() || '',
                    results;

                if (val.length) {
                    // setup ui for results display (only on first keyup)
                    if (!$activeTab.siblings().hasClass(activeClass)) {
                        $tabs.addClass("active");
                        $itemsToFilter.removeClass(); // not $items so .snp-group's keep their class
                        $tabContent.show(); // so items in non-active tab will show in results
                    }

                    $items.hide();

                    // filter and show search results
                    results = $itemsToFilter.filter(function() {
                        return $(this).text().toLowerCase().indexOf(val) > -1;
                    });

                    if (results.length) {
                        $noresults.hide();
                        results.show();
                    } else {
                        $noresults.show();
                    }

                } else {
                    // restore ui state to what it was before searching
                    $noresults.hide();
                    $tabs.removeClass();
                    $activeTab.addClass(activeClass);
                    $activeItem.addClass(activeClass);
                    $tabContent.hide().eq($activeTab.index()).show();
                    $items.show();
                }
            });


            // Close panel before following a link (css transition-supporting browsers only)
            // -------------------------------------------------------
            $panel.on("click", "a", function(e) {
                panelIsVisible = false,
                    that = this;

                $wrapper.toggleClass(toggleClass).one(transitionEndEvents, function() {
                    $search.val("");
                    window.location = that.href;
                });

                if (hasTransitionSupport()) e.preventDefault();
            });
        };

        // Build Initial Nav Structure
        // -------------------------------------------------------
        function createStructure(){
            $("body").prepend(
                '<div id="side-nav-panel">' +
                    '<div id="snp-search">'+
                    '<input type="text" placeholder="Search...">'+
                    '</div>'+
                    '<ul class="snp-tabs">'+
                    '<li>My Apps</li>'+
                    '<li>My Reports</li>'+
                    '</ul>'+
                    '<div class="snp-no-results">No Results Found</div>' +
                    '</div>');
            return $("#side-nav-panel");
        };

        // Build Item HTML from JSON Data
        // -------------------------------------------------------
        function buildItems(data) {
            var html, icon;

            // groups
            $.each(data, function(i, group){
                html += '<li class="snp-group">' + (i == "undefined" ? "Applications" : i) + '</li>';

                // items
                $.each(group, function(x, item){
                    icon = item.iconName || "globe";
                    html += '<li><a href="' + buildHref(item.baseUrl) + item.location + '"><i class="icon-' + icon + '"></i>' + truncateText(item.name, 26) + "</a></li>";
                });
            });

            return '<ul class="snp-tab-content">' + html + "</ul>";
        };

        // Build out all items from JSON data
        // -------------------------------------------------------
        function buildPanel(data){
            var apps = buildItems(data.Applications),
                reports = buildItems(data.Reports);
            $panel.append(apps); // some IE builds choked on: $panel.append([apps, reports]);
            $panel.append(reports);

        }

        // Finish panel setup after everything else is done
        // -------------------------------------------------------
        function activatePanel(){
            $tabContent    = $panel.find(".snp-tab-content");
            $items         = $tabContent.find("li");
            $itemsToFilter = $items.not(".snp-group");
            $activeItem    = $items.filter(function() { return $(this).find("a").attr("href") == location.href; });

            // manually add Search placeholder text for IE8 and below
            if (!hasPlaceholderSupport()) placeholderPolyfill();

            $activeTab.addClass(activeClass);
            $activeItem.addClass(activeClass);
            $tabContent.eq(0).show();
        }

        // Build HREF, adds "http://" if it doesn't exist
        function buildHref(href) {
            return href.indexOf("://") == -1 ? "http://" + href : href;
        }

        // Add Placeholder Text Support for Non-Supporting Browsers
        // -------------------------------------------------------
        function placeholderPolyfill() {
            var placeholder = $search.attr("placeholder");

            $search.focus(function() {
                if ($search.val() == placeholder) $search.val("");
            });

            $search.blur(function() {
                if ($search.val() != placeholder && $search.val() == "") $search.val(placeholder);
            });

            $search.blur();
        };


        // Truncate Text
        // Fix for IE Font Awesome Bug...IE tries to apply font awesome to the ellipsis (no usable css fix found)
        // ----------------------------------------------------------
        function truncateText(text, length) {

            // Still using text-overflow: ellipsis for non-IE browsers, because it's more reliable layout-wise
            if (navigator.userAgent.indexOf("MSIE") == -1) return text;

            var str = text.substring(0, Math.min(length, text.length));
            if (str.length >= length) return str + "...";
            return str;
        };


        // Test Browser for CSS Transition Support
        // -------------------------------------------------------
        function hasTransitionSupport() {
            var s = document.createElement("div").style;
            return "transition" in s || "WebkitTransition" in s || "MozTransition" in s || "msTransition" in s || "OTransition" in s;
        };


        // Test Browser for Placeholder Text Support
        // -------------------------------------------------------
        function hasPlaceholderSupport() {
            var i = document.createElement('input');
            return "placeholder" in i;
        }

    }(window.sideNavPanel = window.sideNavPanel || {}, jQuery));