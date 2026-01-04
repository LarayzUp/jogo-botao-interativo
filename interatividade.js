let clicks = 0;
        let streak = 0;
        let lastClickTime = null;
        let soundEnabled = true;
        let achievementsUnlocked = [];
        let secretCodeClicks = [];
        let easterEggUnlocked = false;
        let audioContext = null;

        const messages = [
            "Você está arrasando! 🔥",
            "Continue assim! 💪",
            "Incrível! ⚡",
            "Você é imparável! 🚀",
            "Sensacional! ✨",
            "Que ritmo! 🎵",
            "Mandou bem! 👏",
            "Está pegando fogo! 🔥",
            "Show de bola! ⚽",
            "Você é demais! 🌟"
        ];

        const achievements = [
            { id: 'first_click', name: 'Primeiro Passo', description: 'Clicou pela primeira vez', requirement: 1, icon: '🎯' },
            { id: 'ten_clicks', name: 'Aquecendo', description: 'Alcançou 10 cliques', requirement: 10, icon: '🔥' },
            { id: 'fifty_clicks', name: 'Dedicado', description: 'Alcançou 50 cliques', requirement: 50, icon: '💪' },
            { id: 'hundred_clicks', name: 'Centenário', description: 'Alcançou 100 cliques', requirement: 100, icon: '💯' },
            { id: 'speed_demon', name: 'Demônio da Velocidade', description: 'Streak de 5 cliques rápidos', requirement: 5, type: 'streak', icon: '⚡' },
            { id: 'streak_master', name: 'Mestre do Streak', description: 'Streak de 10 cliques', requirement: 10, type: 'streak', icon: '🔥' },
            { id: 'easter_egg', name: 'Explorador Secreto', description: 'Descobriu o Easter Egg', requirement: 1, type: 'secret', icon: '🥚' }
        ];

        const themes = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        ];
        let currentThemeIndex = 0;

        const mainButton = document.getElementById('mainButton');
        const totalClicksEl = document.getElementById('totalClicks');
        const streakValueEl = document.getElementById('streakValue');
        const achievementsCountEl = document.getElementById('achievementsCount');
        const motivationalMessageEl = document.getElementById('motivationalMessage');
        const soundToggle = document.getElementById('soundToggle');
        const soundIcon = document.getElementById('soundIcon');
        const soundStatus = document.getElementById('soundStatus');
        const achievementsGrid = document.getElementById('achievementsGrid');
        const easterEggHint = document.getElementById('easterEggHint');
        const easterEggUnlockedEl = document.getElementById('easterEggUnlocked');
        const streakIcon = document.getElementById('streakIcon');

        function initAchievements() {
            achievements.forEach(achievement => {
                const card = document.createElement('div');
                card.className = 'achievement-card';
                card.id = `achievement-${achievement.id}`;
                card.innerHTML = `
                    <div class="achievement-content">
                        <div class="achievement-icon">${achievement.icon}</div>
                        <div class="achievement-info">
                            <h3>${achievement.name}</h3>
                            <p>${achievement.description}</p>
                        </div>
                    </div>
                `;
                achievementsGrid.appendChild(card);
            });
        }

        function playClickSound() {
            if (!soundEnabled) return;
            
            try {
                if (!audioContext) {
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                }
                
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = 800 + (streak * 50);
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
            } catch (error) {
                console.log('Audio não suportado');
            }
        }

        function playAchievementSound() {
            if (!soundEnabled) return;
            
            try {
                if (!audioContext) {
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                }
                
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = 1000;
                oscillator.type = 'square';
                
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
            } catch (error) {
                console.log('Audio não suportado');
            }
        }

        function createParticles(x, y) {
            const particleCount = 8 + Math.floor(streak / 2);
            
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                
                const angle = (Math.PI * 2 * i) / particleCount;
                const distance = 100 + Math.random() * 50;
                const tx = Math.cos(angle) * distance;
                const ty = Math.sin(angle) * distance;
                
                particle.style.left = x + 'px';
                particle.style.top = y + 'px';
                particle.style.setProperty('--tx', tx + 'px');
                particle.style.setProperty('--ty', ty + 'px');
                
                document.body.appendChild(particle);
                
                setTimeout(() => particle.remove(), 1000);
            }
        }

        function showMotivationalMessage() {
            const message = messages[Math.floor(Math.random() * messages.length)];
            motivationalMessageEl.textContent = message;
            motivationalMessageEl.style.animation = 'none';
            setTimeout(() => {
                motivationalMessageEl.style.animation = 'bounce 0.5s ease';
            }, 10);
            
            setTimeout(() => {
                motivationalMessageEl.textContent = '';
            }, 2000);
        }

        function checkAchievements(clickCount, currentStreak) {
            achievements.forEach(achievement => {
                if (achievementsUnlocked.includes(achievement.id)) return;
                
                let unlocked = false;
                
                if (achievement.type === 'streak' && currentStreak >= achievement.requirement) {
                    unlocked = true;
                } else if (!achievement.type && clickCount >= achievement.requirement) {
                    unlocked = true;
                }
                
                if (unlocked) {
                    unlockAchievement(achievement);
                }
            });
        }

        function unlockAchievement(achievement) {
            achievementsUnlocked.push(achievement.id);
            
            const card = document.getElementById(`achievement-${achievement.id}`);
            card.classList.add('unlocked');
            card.innerHTML += '<div class="achievement-badge">✓ DESBLOQUEADO</div>';
            
            achievementsCountEl.textContent = achievementsUnlocked.length;
            
            showAchievementNotification(achievement);
            playAchievementSound();
        }

        function showAchievementNotification(achievement) {
            const notification = document.createElement('div');
            notification.className = 'achievement-notification';
            notification.innerHTML = `
                <div class="notification-content">
                    <div class="notification-icon">${achievement.icon}</div>
                    <div>
                        <div class="notification-header">
                            🏆 Conquista Desbloqueada!
                        </div>
                        <div class="notification-title">${achievement.name}</div>
                        <div class="notification-desc">${achievement.description}</div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideIn 0.5s ease reverse';
                setTimeout(() => notification.remove(), 500);
            }, 3000);
        }

        function checkEasterEgg() {
            if (secretCodeClicks.length >= 5 && !easterEggUnlocked) {
                const now = Date.now();
                const firstClick = secretCodeClicks[0];
                
                if (now - firstClick < 1000) {
                    easterEggUnlocked = true;
                    const easterEggAchievement = achievements.find(a => a.id === 'easter_egg');
                    unlockAchievement(easterEggAchievement);
                    
                    easterEggHint.style.display = 'none';
                    
                    easterEggUnlockedEl.innerHTML = `
                        <div class="easter-egg-unlocked">
                            <h3>🎉 PARABÉNS! 🎉</h3>
                            <p>Você descobriu o Easter Egg secreto! Você é incrível!</p>
                        </div>
                    `;
                    easterEggUnlockedEl.style.display = 'block';
                }
            }
        }

        function changeTheme() {
            currentThemeIndex = (currentThemeIndex + 1) % themes.length;
            document.body.style.background = themes[currentThemeIndex];
            mainButton.style.background = themes[currentThemeIndex];
        }

        mainButton.addEventListener('click', function(e) {
            const now = Date.now();
            clicks++;
            
            totalClicksEl.textContent = clicks;
            
            if (lastClickTime && now - lastClickTime < 500) {
                streak++;
            } else {
                streak = 1;
            }
            streakValueEl.textContent = streak;
            lastClickTime = now;
            
            streakIcon.textContent = streak > 0 ? '🔥' : '❄️';
            
            playClickSound();
            
            const x = e.clientX;
            const y = e.clientY;
            createParticles(x, y);
            
            showMotivationalMessage();
            
            mainButton.style.transform = 'scale(0.9)';
            setTimeout(() => {
                mainButton.style.transform = 'scale(1)';
            }, 100);
            
            checkAchievements(clicks, streak);
            
            secretCodeClicks.push(now);
            if (secretCodeClicks.length > 5) {
                secretCodeClicks.shift();
            }
            checkEasterEgg();
            
            if (clicks % 25 === 0) {
                changeTheme();
            }
        });

        soundToggle.addEventListener('click', function() {
            soundEnabled = !soundEnabled;
            soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
            soundStatus.textContent = soundEnabled ? 'Ligado' : 'Desligado';
        });

        setInterval(() => {
            if (lastClickTime && Date.now() - lastClickTime > 1000) {
                streak = 0;
                streakValueEl.textContent = 0;
                streakIcon.textContent = '❄️';
            }
        }, 100);

        initAchievements();