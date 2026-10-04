function newUnlock(tab){
	document.getElementById(tab + "TabGlyph").className = "glyphicon glyphicon-exclamation-sign";
	if(tab === "more"){
		document.getElementById("achievementsTabGlyph").className = "pull-right glyphicon glyphicon-exclamation-sign";
	}
	if (window.SoundManager) {
		SoundManager.playMilestone();
	}
}

function newNavUnlock(nav){
	document.getElementById(nav + "NavGlyph").className = "glyphicon glyphicon-exclamation-sign";
	if (window.SoundManager) {
		SoundManager.playMilestone();
	}
}

function tabClicked(tab){
	document.getElementById(tab + "TabGlyph").className = "pull-right glyphicon glyphicon-exclamation-sign hidden";
	if (window.SoundManager) {
		SoundManager.playTabOpen();
	}
}

function navClicked(nav){
	document.getElementById(nav + "NavGlyph").className = "pull-right glyphicon glyphicon-exclamation-sign hidden";
	if (window.SoundManager) {
		SoundManager.playTabOpen();
	}
}

function activeResourceTab(tab){
	if (window.SoundManager) {
		SoundManager.playTabOpen();
	}
	var navs = ["plasma", "energy", "uranium", "lava"].concat(resources || []);
	for(var i = 0; i < navs.length; i++){
		var el = document.getElementById(navs[i] + "Nav");
		if (el && el.className) {
			var parts = el.className.split(' ');
			if(parts.indexOf('hidden') === -1) {
				if(parts.indexOf("earth") > -1) {
					el.className = "earth sideTab";
				} else if(parts.indexOf("innerPlanet") > -1) {
					el.className = "innerPlanet sideTab";
				} else if(parts.indexOf("outerPlanet") > -1) {
					el.className = "outerPlanet sideTab";
				} else {
					el.className = "sideTab";
				}
			}
		}
	}
	var activeEl = document.getElementById(tab);
	if (activeEl) {
		activeEl.className += " info";
	}
	if (window.GameLayoutManager) {
		window.GameLayoutManager.rememberSubtab('resources', tab);
	}
}

function activeResearchTab(tab){
	if (window.SoundManager) {
		SoundManager.playTabOpen();
	}
	var el1 = document.getElementById("scienceNav");
	var el2 = document.getElementById("technologiesNav");
	if (el1) el1.className = "sideTab";
	if (el2) el2.className = "sideTab";
	var activeEl = document.getElementById(tab);
	if (activeEl) activeEl.className = "sideTab info";
	if (window.GameLayoutManager) {
		window.GameLayoutManager.rememberSubtab('research', tab);
	}
}

function activeSolarTab(tab){
	if (window.SoundManager) {
		SoundManager.playTabOpen();
	}
	var solarNavs = [
		"rocketFuelNav", "spaceRocket", "moon", "mercury", "venus", "mars",
		"asteroidBelt", "wonderStation", "jupiter", "saturn", "uranus",
		"neptune", "pluto", "kuiperBelt", "solCenter"
	];
	for(var i = 0; i < solarNavs.length; i++){
		var el = document.getElementById(solarNavs[i]);
		if (el) {
			var baseClass = el.className.indexOf("outer") > -1 ? "outer sideTab" : (el.className.indexOf("inner") > -1 ? "inner sideTab" : "sideTab");
			if (el.classList.contains("hidden")) {
				baseClass += " hidden";
			}
			el.className = baseClass;
		}
	}
	var activeEl = document.getElementById(tab);
	if (activeEl) {
		activeEl.className += " info";
	}
	if (window.GameLayoutManager) {
		window.GameLayoutManager.rememberSubtab('solarSystem', tab);
	}
}

function activeWonderTab(tab){
	if (window.SoundManager) {
		SoundManager.playTabOpen();
	}
	var wonderNavs = [
		"theWonderStation", "preciousWonderNav", "energeticWonderNav",
		"techWonderNav", "meteoriteWonderNav", "communicationWonderNav",
		"rocketWonderNav", "antimatterWonderNav", "portalRoomNav", "stargateNav"
	];
	for(var i = 0; i < wonderNavs.length; i++){
		var el = document.getElementById(wonderNavs[i]);
		if (el) {
			if (el.classList.contains("hidden")) {
				el.className = "sideTab hidden";
			} else {
				el.className = "sideTab";
			}
		}
	}
	var activeEl = document.getElementById(tab);
	if (activeEl) {
		activeEl.className = "sideTab info";
	}
	if (window.GameLayoutManager) {
		window.GameLayoutManager.rememberSubtab('wonder', tab);
	}
}

function activeSolCenterTab(tab){
	if (window.SoundManager) {
		SoundManager.playTabOpen();
	}
	var scNavs = ["unlockPlasmaNav", "unlockEmcNav", "unlockDysonNav"];
	for(var i = 0; i < scNavs.length; i++){
		var el = document.getElementById(scNavs[i]);
		if (el) el.className = "sideTab";
	}
	var activeEl = document.getElementById(tab);
	if (activeEl) activeEl.className = "sideTab info";
	if (window.GameLayoutManager) {
		window.GameLayoutManager.rememberSubtab('solCenter', tab);
	}
}

function activeMoreTab(tab){
	if (window.SoundManager) {
		SoundManager.playTabOpen();
	}
	var moreNavs = ["savingNav", "uiNav", "statsNav", "achievementsNav", "startingNav", "faqNav", "creditsNav"];
	for(var i = 0; i < moreNavs.length; i++){
		var el = document.getElementById(moreNavs[i]);
		if (el) el.className = "sideTab";
	}
	var activeEl = document.getElementById(tab);
	if (activeEl) activeEl.className = "sideTab info";
	if (window.GameLayoutManager) {
		window.GameLayoutManager.rememberSubtab('more', tab);
	}
}

function activeInterstellarTab(tab){
	if (window.SoundManager) {
		SoundManager.playTabOpen();
	}
	if(document.getElementById("commsNav") && !document.getElementById("commsNav").classList.contains("hidden")){
		document.getElementById("commsNav").className = "sideTab";
	}
	if(document.getElementById("interRocketNav") && !document.getElementById("interRocketNav").classList.contains("hidden")){
		document.getElementById("interRocketNav").className = "sideTab";
	}
	if(document.getElementById("antimatterNav") && !document.getElementById("antimatterNav").classList.contains("hidden")){
		document.getElementById("antimatterNav").className = "sideTab";
	}
	if(document.getElementById("travelNav") && !document.getElementById("travelNav").classList.contains("hidden")){
		document.getElementById("travelNav").className = "sideTab";
	}
	var activeEl = document.getElementById(tab);
	if (activeEl) activeEl.className = "sideTab info";
	if (window.GameLayoutManager) {
		window.GameLayoutManager.rememberSubtab('interstellar', tab);
	}
}
