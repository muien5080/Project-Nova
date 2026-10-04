Game.resourcesUI = (function(){

	var instance = {};

	var resourcePageConfig = [
		{ id: 'plasma', tabId: 'plasmaTab', hasStorage: true },
		{ id: 'energy', tabId: 'energyTab', hasStorage: true },
		{ id: 'uranium', tabId: 'uraniumTab', hasStorage: true },
		{ id: 'lava', tabId: 'lavaTab', hasStorage: true },
		{ id: 'oil', tabId: 'oilTab', hasStorage: true },
		{ id: 'metal', tabId: 'metalTab', hasStorage: true },
		{ id: 'gem', tabId: 'gemTab', hasStorage: true },
		{ id: 'charcoal', tabId: 'charcoalTab', hasStorage: true },
		{ id: 'wood', tabId: 'woodTab', hasStorage: true },
		{ id: 'silicon', tabId: 'siliconTab', hasStorage: true },
		{ id: 'lunarite', tabId: 'lunariteTab', hasStorage: true },
		{ id: 'methane', tabId: 'methaneTab', hasStorage: true },
		{ id: 'titanium', tabId: 'titaniumTab', hasStorage: true },
		{ id: 'gold', tabId: 'goldTab', hasStorage: true },
		{ id: 'silver', tabId: 'silverTab', hasStorage: true },
		{ id: 'hydrogen', tabId: 'hydrogenTab', hasStorage: true },
		{ id: 'helium', tabId: 'heliumTab', hasStorage: true },
		{ id: 'ice', tabId: 'iceTab', hasStorage: true },
		{ id: 'meteorite', tabId: 'meteoriteTab', hasStorage: true },
		{ id: 'science', tabId: 'scienceTab', hasStorage: true },
		{ id: 'rocketFuel', tabId: 'rocketFuelTab', hasStorage: true }
	];

	// Storage percentage resources (explicitly excluding energy, plasma, research points, rocket fuel, and antimatter)
	var percentResources = [
		'uranium', 'oil', 'metal', 'gem', 'charcoal', 'wood', 'silicon',
		'lunarite', 'methane', 'titanium', 'gold', 'silver', 'lava',
		'hydrogen', 'helium', 'ice', 'meteorite'
	];

	function injectLiveHeaders() {
		for (var i = 0; i < resourcePageConfig.length; i++) {
			var cfg = resourcePageConfig[i];
			var $tab = $('#' + cfg.tabId);
			if ($tab.length === 0) continue;

			// If already injected, skip
			if ($('#' + cfg.id + '_live_header').length > 0) continue;

			var $h2 = $tab.find('h2').first();
			if ($h2.length === 0) continue;

			var title = $h2.text().trim();
			var capHtml = '';
			if (cfg.hasStorage) {
				capHtml = '<span class="resource-stat-chip capacity-chip" id="' + cfg.id + '_cap_container">' +
					'<span class="chip-label">Capacity:</span> ' +
					'<span class="chip-value" id="' + cfg.id + '_cap_chip">0</span>' +
				'</span>';
			}

			// Clean 2-row layout:
			// Top row: Name on left, exact value on right
			// Bottom row: Gain below name (left), Capacity below value (right)
			var headerHtml = '<div class="resource-live-header" id="' + cfg.id + '_live_header">' +
				'<div class="resource-title-row">' +
					'<h2 class="default btn-link resource-page-heading">' + title + '</h2>' +
					'<span class="resource-exact-badge" id="' + cfg.id + '_exact_badge">0</span>' +
				'</div>' +
				'<div class="resource-stats-row">' +
					'<span class="resource-stat-chip gain-chip">' +
						'<span class="chip-label">Gain:</span> ' +
						'<span class="chip-value" id="' + cfg.id + '_gain_chip">0 /Sec</span>' +
					'</span>' +
					capHtml +
				'</div>' +
			'</div>';

			$h2.replaceWith(headerHtml);
		}
	}

	function injectStoragePercentages() {
		for (var p = 0; p < percentResources.length; p++) {
			var pId = percentResources[p];
			if ($('#' + pId + 'StoragePercent').length > 0) continue;
			var $nextStorage = $('#' + pId + 'NextStorage');
			if ($nextStorage.length > 0) {
				var $br = $nextStorage.nextAll('br').first();
				if ($br.length > 0) {
					$('<span class="storage-percent-line"><br>Storage filled: <b><span id="' + pId + 'StoragePercent">0.0%</span></b></span>').insertAfter($br);
				}
			}
		}
	}

	instance.initialise = function() {
		for (var id in RESOURCE) {
			if ($('#' + RESOURCE[id]).length > 0) {
				Game.ui.bindElement(RESOURCE[id], this.createResourceDelegate(RESOURCE[id]));
			}
			if ($('#' + RESOURCE[id] + 'ps').length > 0) {
				Game.ui.bindElement(RESOURCE[id] + 'ps', this.createProductionDelegate(RESOURCE[id]));
			}
			if ($('#' + RESOURCE[id] + 'Storage').length > 0) {
				Game.ui.bindElement(RESOURCE[id] + 'Storage', this.createStorageDelegate(RESOURCE[id]));
			}
			if ($('#' + RESOURCE[id] + 'NextStorage').length > 0) {
				Game.ui.bindElement(RESOURCE[id] + 'NextStorage', this.createNextStorageDelegate(RESOURCE[id]));
			}
		}

		injectLiveHeaders();
		injectStoragePercentages();

		// the auto bindings need to be updated after this is done
		Game.ui.updateAutoDataBindings();
	};

	instance.update = function(delta) {
		// Ensure headers and storage percentages exist if loaded dynamically
		injectLiveHeaders();
		injectStoragePercentages();

		// Update active resource headers
		for (var i = 0; i < resourcePageConfig.length; i++) {
			var cfg = resourcePageConfig[i];
			var $badge = $('#' + cfg.id + '_exact_badge');
			if ($badge.length === 0) continue;

			var cur = getResource(cfg.id);
			var exactStr = (isNaN(cur) || cur === null || typeof cur === 'undefined') ? '0' : Math.floor(cur).toLocaleString('en-US');
			$badge.text(exactStr);

			var prod = getProduction(cfg.id);
			var prodFormatted;
			if (cfg.id === RESOURCE.Energy) {
				if (prod >= 0) {
					prodFormatted = (prod > 250) ? Game.settings.format(prod) : (Game.settings.format(prod * 2) / 2);
				} else {
					prodFormatted = (prod < -250) ? Math.round(prod) : (Math.round(prod * 2) / 2);
				}
			} else if (cfg.id === RESOURCE.Science || cfg.id === RESOURCE.RocketFuel) {
				prodFormatted = Game.settings.format(prod, 1);
			} else {
				prodFormatted = Game.settings.format(prod);
			}

			var sign = (prod > 0) ? '+' : '';
			$('#' + cfg.id + '_gain_chip').text(sign + prodFormatted + ' /Sec');

			if (cfg.hasStorage) {
				var storage = getStorage(cfg.id);
				var storageFormatted = (storage < 0 || cfg.id === 'rocketFuel' || cfg.id === 'science') ? '∞' : Game.settings.format(storage);
				$('#' + cfg.id + '_cap_chip').text(storageFormatted);
			}
		}

		// Update percentage filled for storage upgrades
		for (var p = 0; p < percentResources.length; p++) {
			var pId = percentResources[p];
			var $pctEl = $('#' + pId + 'StoragePercent');
			if ($pctEl.length > 0) {
				var curVal = getResource(pId);
				var capVal = getStorage(pId);
				var pct = (capVal > 0) ? Math.min(100, Math.max(0, (curVal / capVal) * 100)) : 0;
				$pctEl.text(pct.toFixed(1) + '%');
			}
		}
	};

	// Normal notations for the sidebar delegate (restores previous sidebar format)
	instance.createResourceDelegate = function(id) {
		var func;
		if (id === RESOURCE.Science) {
			func = (function() {
				var current = getResource(id);
				if (current < 100) {
					return Game.settings.format(current, 1);
				}
				else {
					return Game.settings.format(current);
				}
			});
		}
		else if (id === RESOURCE.RocketFuel) {
			func = (function() {
				var current = getResource(id);
				if (current < 100) {
					return Game.settings.format(current, 1);
				} else {
					return Game.settings.format(current);
				}
			});
		}
		else {
			func = (function() {
				return Game.settings.format(getResource(id));
			});
		}
		return func;
	};

	instance.createProductionDelegate = function(id) {
		var func;
		if (id === RESOURCE.Energy) {
			func = (function() {
				var production = getProduction(id);
				if (production >= 0) {
					if (production > 250) {
						return Game.settings.format(production);
					}
					else {
						return Game.settings.format(production * 2) / 2;
					}
				}
				else {
					if (production < -250) {
						return Math.round(production);
					}
					else {
						return Math.round(production * 2) / 2;
					}
				}
			});
		}
		else if (id === RESOURCE.Science) {
			func = (function() {
				return Game.settings.format(getProduction(id), 1);
			});
		}
		else if (id === RESOURCE.RocketFuel) {
			func = (function() {
				return Game.settings.format(getProduction(id), 1);
			});
		}
		else {
			func = (function() {
				return Game.settings.format(getProduction(id));
			});
		}

		return func;
	};

	instance.createStorageDelegate = function(id) {
		return (function() {
			var s = getStorage(id);
			if (s < 0 || id === RESOURCE.RocketFuel || id === RESOURCE.Science) {
				return '∞';
			}
			return Game.settings.format(s);
		});
	};

	instance.createNextStorageDelegate = function(id) {
		return (function() {
			return Game.settings.format(getStorage(id) * 2);
		});
	};

	Game.uiComponents.push(instance);

	return instance;

}());
