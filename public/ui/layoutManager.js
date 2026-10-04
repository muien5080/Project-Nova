/**
 * GameLayoutManager - Unified 2-Column Sidebar + Detail Panel Architecture
 * Ensures consistent navigation, memory of selected items per tab,
 * and robust crash-safe switching across all 8 major tabs.
 */
(function() {
    'use strict';

    var subtabMemory = {
        resources: 'metalNav',
        research: 'scienceNav',
        solarSystem: 'rocketFuelNav',
        wonder: 'theWonderStation',
        solCenter: 'unlockPlasmaNav',
        more: 'savingNav',
        stargaze: null,
        interstellar: null
    };

    var navToTabMap = {
        // Resources
        plasmaNav: 'plasmaTab', energyNav: 'energyTab', uraniumNav: 'uraniumTab', lavaNav: 'lavaTab',
        oilNav: 'oilTab', metalNav: 'metalTab', gemNav: 'gemTab', charcoalNav: 'charcoalTab',
        woodNav: 'woodTab', siliconNav: 'siliconTab', lunariteNav: 'lunariteTab', methaneNav: 'methaneTab',
        titaniumNav: 'titaniumTab', goldNav: 'goldTab', silverNav: 'silverTab', hydrogenNav: 'hydrogenTab',
        heliumNav: 'heliumTab', iceNav: 'iceTab', meteoriteNav: 'meteoriteTab',
        
        // Research
        scienceNav: 'scienceTab', technologiesNav: 'technologiesTab',
        
        // Solar System
        rocketFuelNav: 'rocketFuelTab', spaceRocket: 'rocketTab', moon: 'moonTab', mercury: 'mercuryTab',
        venus: 'venusTab', mars: 'marsTab', asteroidBelt: 'asteroidBeltTab', wonderStation: 'wonderStationTab',
        jupiter: 'jupiterTab', saturn: 'saturnTab', uranus: 'uranusTab', neptune: 'neptuneTab',
        pluto: 'plutoTab', kuiperBelt: 'kuiperBeltTab', solCenter: 'solCenterTab',
        
        // Wonders
        theWonderStation: 'theWonderStationTab', preciousWonderNav: 'preciousWonderTab',
        energeticWonderNav: 'energeticWonderTab', techWonderNav: 'techWonderTab',
        meteoriteWonderNav: 'meteoriteWonderTab', communicationWonderNav: 'communicationWonderTab',
        rocketWonderNav: 'rocketWonderTab', antimatterWonderNav: 'antimatterWonderTab',
        portalRoomNav: 'portalRoomTab', stargateNav: 'stargateTab',
        
        // Sol Center
        unlockPlasmaNav: 'unlockPlasmaResearch', unlockEmcNav: 'unlockEmcResearch', unlockDysonNav: 'unlockDysonResearch',
        
        // More
        savingNav: 'savingTab', uiNav: 'uiTab', statsNav: 'statsTab', achievementsNav: 'achievementsTab',
        startingNav: 'startingTab', faqNav: 'faqTab', creditsNav: 'creditsTab'
    };

    var tabParents = {
        resources: { navParent: '#resourceNavParent', contentParent: '#resourceTabParent' },
        research: { navParent: '#researchNavParent', contentParent: '#researchTabParent' },
        solarSystem: { navParent: '#solarNavParent', contentParent: '#solarTabParent' },
        wonder: { navParent: '#wonderNavParent', contentParent: '#wonderTabParent' },
        solCenter: { navParent: '#solCenterNavParent', contentParent: '#solCenterTabParent' },
        more: { navParent: '#moreNavParent', contentParent: '#moreTabParent' },
        stargaze: { navParent: '#stargazeTab_nav', contentParent: '#stargazeTab_content' },
        interstellar: { navParent: '#interstellarTab_nav', contentParent: '#interstellarTab_content' }
    };

    var manager = {
        rememberSubtab: function(tabName, subtabId) {
            if (tabName && subtabId) {
                subtabMemory[tabName] = subtabId;
            }
        },

        getRememberedSubtab: function(tabName) {
            return subtabMemory[tabName] || null;
        },

        selectItem: function(tabName, navId) {
            if (!navId) return;
            subtabMemory[tabName] = navId;

            var cfg = tabParents[tabName];
            if (!cfg) return;

            var $nav = $(cfg.navParent);
            var $content = $(cfg.contentParent);

            // Highlight nav row safely
            $nav.find('tr').removeClass('info');
            var $targetRow = $('#' + navId);
            if ($targetRow.length > 0) {
                $targetRow.addClass('info');
            }

            // Determine target detail panel ID
            var targetPanelId = navToTabMap[navId];
            if (!targetPanelId) {
                // Check if row has an href attribute pointing to tab pane
                var href = $targetRow.attr('href');
                if (href && href.indexOf('#') === 0) {
                    targetPanelId = href.substring(1);
                }
            }

            if (targetPanelId) {
                $content.find('> .tab-pane').removeClass('active in');
                var $targetPanel = $('#' + targetPanelId);
                if ($targetPanel.length > 0) {
                    $targetPanel.addClass('active in');
                }
            }
        },

        onTopTabShown: function(tabName) {
            if (!tabName) return;

            // Normalize tab name if needed
            if (tabName === 'solCenterPage') tabName = 'solCenter';

            var rememberedNav = subtabMemory[tabName];
            var cfg = tabParents[tabName];
            if (!cfg) return;

            var $nav = $(cfg.navParent);
            var $content = $(cfg.contentParent);

            // Check if there is already an active row in the sidebar
            var $activeRow = $nav.find('tr.info:visible');
            var $activePane = $content.find('> .tab-pane.active');

            if (rememberedNav && $('#' + rememberedNav).is(':visible')) {
                // If remembered item is visible, select it
                manager.selectItem(tabName, rememberedNav);
            } else if ($activeRow.length > 0) {
                // Otherwise use the currently active row
                var activeId = $activeRow.attr('id');
                if (activeId) manager.rememberSubtab(tabName, activeId);
                if ($activePane.length === 0) {
                    manager.selectItem(tabName, activeId);
                }
            } else {
                // Select first visible sidebar item
                var $firstVisible = $nav.find('tr:not(.hidden):not(.side-nav-category-header):not([id*="_collapse"]):first');
                if ($firstVisible.length > 0) {
                    var firstId = $firstVisible.attr('id');
                    if (firstId) {
                        manager.selectItem(tabName, firstId);
                    }
                }
            }
        },

        init: function() {
            // Attach click listeners to all tab sidebar rows across tabs
            $(document).on('click', '.tab-sidebar-table tr[onclick], .side-nav-table tr[onclick], .tab-sidebar table tr[onclick], #stargazeTab_nav tr, #interstellarTab_nav tr', function() {
                var navId = $(this).attr('id');
                if (!navId) return;

                // Determine which tab we belong to
                var $tabPane = $(this).closest('.tab-with-sidebar, #tabContent > .tab-pane');
                var tabId = $tabPane.attr('id');
                if (tabId) {
                    if (tabId === 'solCenterPage') tabId = 'solCenter';
                    if (tabId === 'stargazeTab_pane') tabId = 'stargaze';
                    if (tabId === 'interstellarTab_pane') tabId = 'interstellar';
                    manager.rememberSubtab(tabId, navId);
                }
            });

            // Listen to Bootstrap top tab switches
            $(document).on('shown.bs.tab', '#tabList a[data-toggle="tab"]', function(e) {
                var targetHref = $(e.target).attr('href');
                if (!targetHref) return;
                var tabId = targetHref.replace('#', '');
                manager.onTopTabShown(tabId);
            });

            // Set initial state for resources
            setTimeout(function() {
                manager.onTopTabShown('resources');
            }, 50);
        }
    };

    window.GameLayoutManager = manager;

    $(document).ready(function() {
        manager.init();
    });
})();
