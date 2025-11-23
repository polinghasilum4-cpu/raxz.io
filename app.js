// Application logic for DARKNET DDoS Framework
let attackRunning = false;
let packetsSent = 0;
let activeThreads = 0;
let currentAttackInterval = null;
let attackStartTime = null;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    logMessage('DARKNET DDoS Framework v4.0 initialized', 'info');
    logMessage('All systems operational - Ready for commands', 'success');
    logMessage('Warning: Authorized penetration testing only', 'warning');
    
    updateStats();
    loadSavedConfigurations();
    loadCurrentSettings();
    
    // Auto-save settings every 5 seconds
    setInterval(saveCurrentSettings, 5000);
    
    // Update time elapsed for active attacks
    setInterval(updateTimeElapsed, 1000);
});

function logMessage(message, type = 'info') {
    const logContainer = document.getElementById('attackLogs');
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry log-${type}`;
    
    const timestamp = new Date().toLocaleTimeString();
    logEntry.innerHTML = `
        <span class="log-time">[${timestamp}]</span>
        <span class="log-message">${message}</span>
    `;
    
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

function updateStats() {
    document.getElementById('packetsSent').textContent = packetsSent.toLocaleString();
    document.getElementById('activeThreads').textContent = activeThreads;
    
    const attackPower = Math.min(100, Math.floor(packetsSent / 100));
    document.getElementById('attackPower').textContent = attackPower + '%';
    
    const targetStatus = document.getElementById('targetStatus');
    targetStatus.textContent = attackRunning ? 'UNDER FIRE' : 'IDLE';
    targetStatus.style.color = attackRunning ? '#00ff00' : '#ff0000';
    
    // Update progress bars
    document.querySelectorAll('.stat-fill').forEach((fill, index) => {
        const fills = [packetsSent / 1000, attackPower, activeThreads / 10, attackRunning ? 100 : 0];
        fill.style.width = Math.min(100, fills[index]) + '%';
    });
    
    // Update packet rate and bandwidth
    if (attackRunning) {
        const packetRate = Math.floor(Math.random() * 1000) + 500;
        const bandwidth = (packetRate * 1024 / 1000000).toFixed(2);
        document.getElementById('packetRate').textContent = packetRate.toLocaleString();
        document.getElementById('bandwidth').textContent = bandwidth + ' MB/s';
    }
}

function updateTimeElapsed() {
    if (attackRunning && attackStartTime) {
        const elapsed = Math.floor((Date.now() - attackStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById('timeElapsed').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

function startAttack(type) {
    if (attackRunning) {
        logMessage('Attack already in progress. Stop current attack first.', 'warning');
        return;
    }

    const target = document.getElementById('targetUrl').value.trim();
    const port = parseInt(document.getElementById('targetPort').value) || 80;
    
    if (!target) {
        logMessage('Please enter a target URL or IP address', 'error');
        return;
    }

    attackRunning = true;
    attackStartTime = Date.now();
    packetsSent = 0;
    activeThreads = parseInt(document.getElementById('threads').value) || 50;

    logMessage(`🚀 Starting ${type.toUpperCase()} attack on ${target}:${port}`, 'success');
    logMessage(`⚡ Launching ${activeThreads} attack threads`, 'info');
    logMessage(`🎯 Target: ${target} | Port: ${port} | Type: ${type}`, 'info');

    // Update progress text
    document.getElementById('progressText').textContent = `Attacking ${target}...`;
    document.getElementById('successRate').textContent = '98%';

    // Simulate attack progress
    currentAttackInterval = setInterval(() => {
        if (!attackRunning) {
            clearInterval(currentAttackInterval);
            return;
        }

        const basePackets = attackConfig.attack_methods[type]?.parameters.packet_rate || 100;
        const newPackets = Math.floor(Math.random() * basePackets * activeThreads / 10);
        packetsSent += newPackets;
        
        const progressPercent = Math.min(100, Math.floor(packetsSent / 500));
        document.getElementById('attackProgress').style.width = progressPercent + '%';
        document.getElementById('progressPercent').textContent = progressPercent + '%';
        
        updateStats();

        // Simulate attack events
        if (packetsSent > 5000 && packetsSent < 10000) {
            logMessage('Target network showing increased latency', 'warning');
        } else if (packetsSent > 20000) {
            logMessage('Target service degradation detected', 'success');
        } else if (packetsSent > 50000) {
            logMessage('Significant impact on target services', 'success');
        }

    }, 100);

    // Auto-stop after duration
    const duration = parseInt(document.getElementById('duration').value) * 1000 || 60000;
    setTimeout(() => {
        if (attackRunning) {
            stopAllAttacks();
            logMessage(`✅ Attack completed after ${duration/1000} seconds`, 'info');
            logMessage(`📊 Total packets sent: ${packetsSent.toLocaleString()}`, 'success');
        }
    }, duration);
}

function startCustomAttack() {
    const attackType = document.getElementById('attackType').value;
    
    try {
        const customPayload = document.getElementById('customPayload').value;
        if (customPayload) {
            JSON.parse(customPayload);
            logMessage('Custom payload validated successfully', 'success');
        }
    } catch (e) {
        logMessage('Invalid JSON in custom payload: ' + e.message, 'error');
        return;
    }
    
    startAttack(attackType);
}

function stopAllAttacks() {
    attackRunning = false;
    activeThreads = 0;
    attackStartTime = null;
    
    if (currentAttackInterval) {
        clearInterval(currentAttackInterval);
        currentAttackInterval = null;
    }
    
    document.getElementById('attackProgress').style.width = '0%';
    document.getElementById('progressPercent').textContent = '0%';
    document.getElementById('progressText').textContent = 'System Ready - No Active Attacks';
    document.getElementById('packetRate').textContent = '0';
    document.getElementById('bandwidth').textContent = '0 MB/s';
    document.getElementById('successRate').textContent = '100%';
    document.getElementById('timeElapsed').textContent = '00:00';
    
    logMessage('🛑 All attacks stopped', 'warning');
    logMessage(`📈 Final statistics: ${packetsSent.toLocaleString()} packets sent`, 'info');
    updateStats();
}

// ... (fungsi exportConfig, importConfig, handleFileImport, getCurrentSettings, saveCurrentSettings, loadCurrentSettings, 
// saveConfiguration, loadConfiguration, deleteConfiguration, loadSavedConfigurations, clearLogs, saveLogs tetap sama seperti sebelumnya)
// Implementasikan fungsi-fungsi tersebut sesuai dengan kebutuhan

function exportConfig() {
    const config = {
        darknet_config: {
            ...attackConfig,
            timestamp: new Date().toISOString(),
            current_settings: getCurrentSettings()
        }
    };
    
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `darknet_config_${new Date().getTime()}.json`;
    link.click();
    
    logMessage('Configuration exported successfully', 'success');
}

function importConfig() {
    document.getElementById('importFile').click();
}

function handleFileImport(file) {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const config = JSON.parse(e.target.result);
            applyImportedConfig(config);
            logMessage('Configuration imported successfully', 'success');
        } catch (error) {
            logMessage('Error importing configuration: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
}

function applyImportedConfig(config) {
    if (config.current_settings) {
        document.getElementById('targetUrl').value = config.current_settings.targetUrl || '';
        document.getElementById('targetPort').value = config.current_settings.targetPort || 80;
        document.getElementById('attackType').value = config.current_settings.attackType || 'udp';
        document.getElementById('threads').value = config.current_settings.threads || 50;
        document.getElementById('duration').value = config.current_settings.duration || 60;
        document.getElementById('packetSize').value = config.current_settings.packetSize || 1024;
        document.getElementById('customPayload').value = config.current_settings.customPayload || '';
    }
}

function getCurrentSettings() {
    return {
        targetUrl: document.getElementById('targetUrl').value,
        targetPort: document.getElementById('targetPort').value,
        attackType: document.getElementById('attackType').value,
        threads: document.getElementById('threads').value,
        duration: document.getElementById('duration').value,
        packetSize: document.getElementById('packetSize').value,
        customPayload: document.getElementById('customPayload').value
    };
}

function saveCurrentSettings() {
    const settings = getCurrentSettings();
    localStorage.setItem('darknetCurrentSettings', JSON.stringify(settings));
}

function loadCurrentSettings() {
    const saved = localStorage.getItem('darknetCurrentSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        document.getElementById('targetUrl').value = settings.targetUrl || '';
        document.getElementById('targetPort').value = settings.targetPort || 80;
        document.getElementById('attackType').value = settings.attackType || 'udp';
        document.getElementById('threads').value = settings.threads || 50;
        document.getElementById('duration').value = settings.duration || 60;
        document.getElementById('packetSize').value = settings.packetSize || 1024;
        document.getElementById('customPayload').value = settings.customPayload || '';
    }
}

function saveConfiguration() {
    const name = document.getElementById('configName').value.trim() || `config_${new Date().getTime()}`;
    const configurations = JSON.parse(localStorage.getItem('darknetConfigurations') || '{}');
    
    configurations[name] = {
        ...getCurrentSettings(),
        savedAt: new Date().toISOString()
    };
    
    localStorage.setItem('darknetConfigurations', JSON.stringify(configurations));
    logMessage(`Configuration "${name}" saved successfully`, 'success');
    loadSavedConfigurations();
}

function loadConfiguration() {
    const name = document.getElementById('configName').value.trim();
    const configurations = JSON.parse(localStorage.getItem('darknetConfigurations') || '{}');
    
    if (configurations[name]) {
        const config = configurations[name];
        document.getElementById('targetUrl').value = config.targetUrl || '';
        document.getElementById('targetPort').value = config.targetPort || 80;
        document.getElementById('attackType').value = config.attackType || 'udp';
        document.getElementById('threads').value = config.threads || 50;
        document.getElementById('duration').value = config.duration || 60;
        document.getElementById('packetSize').value = config.packetSize || 1024;
        document.getElementById('customPayload').value = config.customPayload || '';
        
        logMessage(`Configuration "${name}" loaded successfully`, 'success');
    } else {
        logMessage(`Configuration "${name}" not found`, 'error');
    }
}

function deleteConfiguration() {
    const name = document.getElementById('configName').value.trim();
    const configurations = JSON.parse(localStorage.getItem('darknetConfigurations') || '{}');
    
    if (configurations[name]) {
        delete configurations[name];
        localStorage.setItem('darknetConfigurations', JSON.stringify(configurations));
        logMessage(`Configuration "${name}" deleted`, 'success');
        loadSavedConfigurations();
    } else {
        logMessage(`Configuration "${name}" not found`, 'error');
    }
}

function loadSavedConfigurations() {
    const configurations = JSON.parse(localStorage.getItem('darknetConfigurations') || '{}');
    const configList = document.getElementById('configList');
    
    if (Object.keys(configurations).length === 0) {
        configList.innerHTML = '<em style="color: #ff4444;">No saved configurations</em>';
        return;
    }
    
    let html = '<strong style="color: #ff0000; margin-bottom: 10px; display: block;">Saved Configurations:</strong>';
    for (const [name, config] of Object.entries(configurations)) {
        const date = new Date(config.savedAt).toLocaleDateString();
        html += `
            <div style="margin: 8px 0; padding: 8px; background: rgba(255, 0, 0, 0.1); border-radius: 5px;">
                <span style="color: #00ff00; font-weight: bold;">${name}</span> 
                <small style="color: #ff4444;">(Saved: ${date})</small>
            </div>
        `;
    }
    
    configList.innerHTML = html;
}

function clearLogs() {
    document.getElementById('attackLogs').innerHTML = '';
    logMessage('Logs cleared', 'info');
}

function saveLogs() {
    const logs = document.getElementById('attackLogs').innerText;
    const blob = new Blob([logs], {type: 'text/plain'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `darknet_logs_${new Date().getTime()}.txt`;
    link.click();
    logMessage('Logs saved successfully', 'success');
            }
