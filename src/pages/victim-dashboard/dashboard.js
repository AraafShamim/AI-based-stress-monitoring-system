/**
 * Victim Dashboard - MannSetu
 * Complete functional victim dashboard with real backend integration
 */

import apiService from '../../services/apiService.js';

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', async () => {
    await initializePage();
    setupUI();
});

async function initializePage() {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../../auth/login.html';
        return;
    }

    // Load user data
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Update profile with real user data
    const profileName = document.getElementById('victimProfileName');
    const welcomeHeader = document.getElementById('victimWelcomeHeader');

    if (profileName && user.name) {
        profileName.textContent = user.name;
    }

    if (welcomeHeader && user.name) {
        const firstName = user.name.split(' ')[0];
        welcomeHeader.innerHTML = `Good morning, ${firstName}!<span class="sparkle">✦</span>`;
    }

    // Load dashboard data
    try {
        const summary = await apiService.getDashboardSummary();
        if (summary) {
            updateDashboardStats(summary);
        }
    } catch (error) {
        console.error('Failed to load dashboard:', error);
    }
}

function updateDashboardStats(data) {
    const updateElement = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    updateElement('totalClients', data.total_monitored_victims || 0);
    updateElement('activeClients', data.total_monitored_victims || 0);
    updateElement('highRisk', data.high_risk_cases || 0);
    updateElement('criticalRisk', data.critical_cases || 0);
    updateElement('moderateRisk', data.moderate_risk_cases || 0);
    updateElement('lowRisk', data.low_risk_cases || 0);
}

function setupUI() {
    // Sidebar toggle
    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.querySelector('.sidebar');
    const closeSidebar = document.getElementById('closeSidebar');

    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.add('active');
        });
    }

    if (closeSidebar && sidebar) {
        closeSidebar.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
    }

    // Close sidebar when clicking outside
    document.addEventListener('click', (event) => {
        if (sidebar && menuBtn && !sidebar.contains(event.target) && !menuBtn.contains(event.target)) {
            sidebar.classList.remove('active');
        }
    });

    // Language switcher
    const languageBtn = document.getElementById('languageBtn');
    const languageDropdown = document.getElementById('languageDropdown');

    if (languageBtn && languageDropdown) {
        languageBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            languageDropdown.classList.toggle('show');
        });

        const langOptions = languageDropdown.querySelectorAll('button');
        langOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const lang = e.target.innerText.trim();
                if (lang === 'हिन्दी') {
                    window.location.href = 'dashboard-hindi.html';
                } else if (lang === 'English') {
                    window.location.href = 'dashboard.html';
                }
            });
        });
    }

    // Profile dropdown
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');

    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            profileDropdown.classList.toggle('show');
        });
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        if (languageDropdown) languageDropdown.classList.remove('show');
        if (profileDropdown) profileDropdown.classList.remove('show');
    });

    // Mood buttons
    const moodButtons = document.querySelectorAll('.mood-btn');
    moodButtons.forEach(button => {
        button.addEventListener('click', () => {
            moodButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            const mood = button.dataset.mood;
            updateMood(mood);
        });
    });

    // Check-in button
    const checkInBtn = document.getElementById('checkInBtn');
    if (checkInBtn) {
        checkInBtn.addEventListener('click', showCheckInModal);
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (event) => {
            event.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                apiService.logout();
                window.location.href = '../../auth/login.html';
            }
        });
    }

    // Update date
    updateDate();
    updateTime();
    setInterval(updateTime, 60000);

    // Initialize distress score
    updateDistressScore(0);
}

function updateMood(mood) {
    const moodText = document.getElementById('currentMood');
    const moodDescription = document.getElementById('moodDescription');

    if (!moodText) return;

    const moodData = {
        happy: { title: 'HAPPY', description: "You're feeling positive today." },
        neutral: { title: 'NEUTRAL', description: 'Feeling okay today.' },
        worried: { title: 'WORRIED', description: "It's okay to take some time for yourself." },
        sad: { title: 'SAD', description: 'Remember that support is available.' },
        angry: { title: 'ANGRY', description: 'Take a moment to breathe and relax.' }
    };

    const selected = moodData[mood];
    if (selected) {
        moodText.textContent = selected.title;
        if (moodDescription) moodDescription.textContent = selected.description;
    }
}

async function showCheckInModal() {
    const responseText = prompt('How are you feeling today? Your response will help us understand your wellbeing.');

    if (responseText) {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const victimId = user.id || 'user-victim-id';

            const checkInData = {
                victimId: victimId,
                channel: 'CHATBOT',
                rawText: responseText,
                responseLatencySec: 3.5,
                metadata: { mood: 'Neutral' }
            };

            const response = await apiService.submitCheckIn(checkInData);

            if (response) {
                alert('Check-in submitted! Our system will process your response.');

                // Try to score the check-in
                try {
                    const score = await apiService.scoreCheckIn(responseText, 'en');
                    if (score) {
                        updateDistressScore(score.dds_score || 30);
                        updateAIInsight(score.dds_score || 30);
                    }
                } catch (err) {
                    console.error('Scoring error:', err);
                    updateDistressScore(30);
                    updateAIInsight(30);
                }
            }
        } catch (error) {
            console.error('Check-in submission failed:', error);
            alert('Failed to submit check-in. Please try again.');
        }
    }
}

function updateDistressScore(score) {
    const scoreElement = document.getElementById('distressScore');
    const circle = document.querySelector('.progress-circle');

    if (scoreElement) {
        scoreElement.textContent = `${score}%`;
    }

    if (circle) {
        circle.style.setProperty('--progress', `${score * 3.6}deg`);
    }

    updateDistressStatus(score);
}

function updateDistressStatus(score) {
    const status = document.getElementById('distressStatus');

    if (!status) return;

    if (score < 30) {
        status.textContent = 'LOW';
    } else if (score < 60) {
        status.textContent = 'MODERATE';
    } else {
        status.textContent = 'HIGH';
    }
}

function updateAIInsight(score) {
    const insight = document.getElementById('aiInsight');

    if (!insight) return;

    if (score < 30) {
        insight.textContent = "You're doing well! Continue maintaining healthy routines.";
    } else if (score < 60) {
        insight.textContent = 'Your wellbeing appears stable. Continue checking in with yourself.';
    } else {
        insight.textContent = 'You may benefit from additional support. Consider connecting with a counsellor.';
    }
}

function updateDate() {
    const dateElement = document.getElementById('currentDate');
    if (!dateElement) return;

    const today = new Date();
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    dateElement.textContent = today.toLocaleDateString('en-US', options);
}

function updateTime() {
    const timeElements = document.querySelectorAll('.live-time');
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    timeElements.forEach(element => {
        element.textContent = time;
    });
}
