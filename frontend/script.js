// Initialize Icons
lucide.createIcons();

// Quick Fill Pills
window.fillExample = function(text) {
    const textarea = document.getElementById('specification');
    if(textarea) {
        textarea.value = text;
        updateCharCount();
    }
}

// Character Count
const textarea = document.getElementById('specification');
if(textarea) {
    textarea.addEventListener('input', updateCharCount);
}

function updateCharCount() {
    const count = document.getElementById('specification').value.length;
    const charBadge = document.getElementById('char-count');
    if (charBadge) charBadge.innerText = `${count} chars`;
}

// Clear Button
const clearBtn = document.getElementById('clearBtn');
if(clearBtn) {
    clearBtn.addEventListener('click', () => {
        document.getElementById('specification').value = '';
        updateCharCount();
        resetUI();
    });
}

function resetUI() {
    document.getElementById('empty-state').classList.remove('hidden');
    document.getElementById('loading-state').classList.add('hidden');
    document.getElementById('results-dashboard').classList.add('hidden');
}

// Toast Notification System
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Style applied directly for fail-safe rendering if missing from CSS
    toast.style.padding = "12px 24px";
    toast.style.background = type === 'success' ? "#10b981" : "#ef4444";
    toast.style.color = "white";
    toast.style.borderRadius = "8px";
    toast.style.marginBottom = "10px";
    toast.style.display = "flex";
    toast.style.alignItems = "center";
    toast.style.gap = "8px";
    toast.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
    toast.style.transition = "opacity 0.3s ease";
    
    toast.innerHTML = `<i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    lucide.createIcons();
    
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==========================================
// MAIN AI API CONNECTION LOGIC
// ==========================================
const analyzeBtn = document.getElementById('analyzeBtn');
if(analyzeBtn) {
    analyzeBtn.addEventListener('click', async () => {
        const text = document.getElementById('specification').value;
        if (!text.trim()) {
            showToast('Please enter a specification first.', 'error');
            return;
        }

        // 1. Trigger Loading State
        document.getElementById('empty-state').classList.add('hidden');
        document.getElementById('results-dashboard').classList.add('hidden');
        document.getElementById('loading-state').classList.remove('hidden');
        document.getElementById('btn-text').innerText = 'Analyzing...';
        analyzeBtn.disabled = true;

        try {
            // 2. Transmit to Python Backend
            const response = await fetch('http://127.0.0.1:5001/api/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ specification: text })
            });

            if (!response.ok) throw new Error('Backend connection failed');
            
            const data = await response.json();

            // 3. Render Live Results
            renderResults(data);
            showToast('Analysis Complete & Saved to Cloud', 'success');

        } catch (error) {
            console.error('API Error:', error);
            showToast('Failed to connect to Python Engine. Is Port 5001 running?', 'error');
            resetUI();
        } finally {
            // Restore UI
            document.getElementById('loading-state').classList.add('hidden');
            document.getElementById('btn-text').innerText = 'Run AI Analysis';
            analyzeBtn.disabled = false;
        }
    });
}

function renderResults(data) {
    const dashboard = document.getElementById('results-dashboard');
    const aiContent = document.getElementById('ai-content');
    const feed = document.getElementById('standards-feed');

    aiContent.innerText = data.ai_summary;

    if (data.recommendations && data.recommendations.length > 0) {
        let html = '';
        data.recommendations.forEach(std => {
            // Generate spans for matching keywords
            const keywordsHtml = std.matched_keywords.map(kw => 
                `<span style="background: #e2e8f0; color: #475569; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-right: 6px;">${kw}</span>`
            ).join('');
            
            html += `
                <div style="border: 1px solid var(--border); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                        <div>
                            <h4 style="color: var(--primary); font-size: 18px; font-weight: 700;">${std.code}</h4>
                            <h3 style="font-size: 14px; margin-top: 4px;">${std.title}</h3>
                        </div>
                        <span style="background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">Active</span>
                    </div>
                    <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 16px;">${std.scope}</p>
                    
                    <div style="margin-bottom: 12px;">
                        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                            <span>Match Accuracy</span> <strong>${std.match_score}%</strong>
                        </div>
                        <div style="width: 100%; background: var(--bg-color); border-radius: 4px; height: 8px; overflow: hidden;">
                            <div style="width: ${std.match_score}%; background: #10b981; height: 100%;"></div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 16px;">${keywordsHtml}</div>
                </div>
            `;
        });
        feed.innerHTML = html;
    } else {
        feed.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--text-muted);">No relevant standards mapped.</div>`;
    }

    dashboard.classList.remove('hidden');
    lucide.createIcons();
}
