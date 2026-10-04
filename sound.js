/**
 * Project Nova - Sound Engine
 * Synthesizes lightweight, pleasant procedural Web Audio effects:
 * - Manual resource mining clicks (tactile, crisp, varied by resource)
 * - Upgrades & building purchases (rewarding ascending two-tone chime)
 * - Tab open / switches (subtle tactile feedback)
 * - Milestones & New Tab unlocks (triumphant arpeggio chime)
 * 
 * Non-continuous: Only triggered on specific player actions and milestone events.
 */

var SoundManager = (function() {
    var instance = {};
    var audioCtx = null;
    var isEnabled = true;

    // Load initial preference
    try {
        var stored = localStorage.getItem('nova_sound_enabled');
        if (stored !== null) {
            isEnabled = stored === 'true';
        }
    } catch (e) {
        isEnabled = true;
    }

    function getAudioContext() {
        if (!audioCtx) {
            var AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    instance.isEnabled = function() {
        return isEnabled;
    };

    instance.toggle = function() {
        isEnabled = !isEnabled;
        try {
            localStorage.setItem('nova_sound_enabled', isEnabled ? 'true' : 'false');
        } catch (e) {}
        instance.updateUI();
        if (isEnabled) {
            instance.playMine('metal');
        }
        return isEnabled;
    };

    instance.updateUI = function() {
        var btn = document.getElementById('soundToggleBtn');
        var icon = document.getElementById('soundIcon');
        var label = document.getElementById('soundLabel');
        if (btn && icon && label) {
            if (isEnabled) {
                icon.className = 'glyphicon glyphicon-volume-up';
                label.textContent = 'Sound: ON';
                btn.className = 'btn btn-sm btn-sound-toggle sound-on';
            } else {
                icon.className = 'glyphicon glyphicon-volume-off';
                label.textContent = 'Sound: OFF';
                btn.className = 'btn btn-sm btn-sound-toggle sound-off';
            }
        }
    };

    // 1. Manual Resource Mining (Crisp, tactile, varies pleasantly by resource type)
    instance.playMine = function(resource) {
        if (!isEnabled) return;
        var ctx = getAudioContext();
        if (!ctx) return;

        try {
            var now = ctx.currentTime;
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();

            var baseFreq = 620;
            var dropFreq = 220;
            var waveType = 'triangle';

            var res = (resource || '').toLowerCase();
            if (res === 'metal' || res === 'titanium' || res === 'silver' || res === 'gold') {
                baseFreq = 780;
                dropFreq = 300;
                waveType = 'sine';
            } else if (res === 'wood' || res === 'charcoal') {
                baseFreq = 440;
                dropFreq = 160;
                waveType = 'triangle';
            } else if (res === 'gem' || res === 'lunarite' || res === 'silicon') {
                baseFreq = 980;
                dropFreq = 420;
                waveType = 'sine';
            } else if (res === 'energy' || res === 'plasma') {
                baseFreq = 860;
                dropFreq = 340;
                waveType = 'sine';
            } else if (res === 'oil' || res === 'lava' || res === 'methane') {
                baseFreq = 360;
                dropFreq = 140;
                waveType = 'triangle';
            }

            osc.type = waveType;
            osc.frequency.setValueAtTime(baseFreq, now);
            osc.frequency.exponentialRampToValueAtTime(dropFreq, now + 0.04);

            gain.gain.setValueAtTime(0.16, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.045);
        } catch (e) {
            console.warn('Audio playback error', e);
        }
    };

    // 2. Upgrade / Building Purchase (Reward chime)
    instance.playUpgrade = function() {
        if (!isEnabled) return;
        var ctx = getAudioContext();
        if (!ctx) return;

        try {
            var now = ctx.currentTime;
            var notes = [523.25, 659.25]; // C5, E5
            notes.forEach(function(freq, idx) {
                var osc = ctx.createOscillator();
                var gain = ctx.createGain();
                var start = now + (idx * 0.055);

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, start);

                gain.gain.setValueAtTime(0.14, start);
                gain.gain.exponentialRampToValueAtTime(0.001, start + 0.11);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(start);
                osc.stop(start + 0.12);
            });
        } catch (e) {
            console.warn('Audio upgrade error', e);
        }
    };

    // 3. Tab Switch / Open Feedback
    instance.playTabOpen = function() {
        if (!isEnabled) return;
        var ctx = getAudioContext();
        if (!ctx) return;

        try {
            var now = ctx.currentTime;
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(460, now);
            osc.frequency.exponentialRampToValueAtTime(320, now + 0.03);

            gain.gain.setValueAtTime(0.07, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.035);
        } catch (e) {
            console.warn('Audio tab error', e);
        }
    };

    // 4. Milestone / New Tab Unlocked (Triumphant achievement arpeggio)
    instance.playMilestone = function() {
        if (!isEnabled) return;
        var ctx = getAudioContext();
        if (!ctx) return;

        try {
            var now = ctx.currentTime;
            var notes = [523.25, 659.25, 783.99, 1046.50]; // C5 -> E5 -> G5 -> C6
            notes.forEach(function(freq, idx) {
                var osc = ctx.createOscillator();
                var gain = ctx.createGain();
                var start = now + (idx * 0.065);

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, start);

                gain.gain.setValueAtTime(0.16, start);
                gain.gain.exponentialRampToValueAtTime(0.001, start + 0.20);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(start);
                osc.stop(start + 0.22);
            });
        } catch (e) {
            console.warn('Audio milestone error', e);
        }
    };

    return instance;
})();

function toggleSound() {
    SoundManager.toggle();
}

// Auto-initialize UI and unlock audio context on initial page load
document.addEventListener('DOMContentLoaded', function() {
    SoundManager.updateUI();
});

// Delegate click sounds for upgrade and purchase buttons
document.addEventListener('click', function(e) {
    var target = e.target.closest('button, .btn, [onclick]');
    if (!target) return;

    var onclickAttr = target.getAttribute('onclick') || '';
    if (onclickAttr.indexOf('gainResource') > -1) {
        // Handled directly inside gainResource
        return;
    }
    if (onclickAttr.indexOf('toggleSound') > -1) {
        return;
    }

    if (onclickAttr.match(/^(upgrade|get[A-Z]|buy|research|build|unlock|launch)/)) {
        if (window.SoundManager) {
            window.SoundManager.playUpgrade();
        }
    }
});
