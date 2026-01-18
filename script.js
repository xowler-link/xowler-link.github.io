document.addEventListener('DOMContentLoaded', function() {
    console.log('Сайт Ховлера загружается...');
    
    // === ПЕРЕМЕННЫЕ ===
    const audio = new Audio('assets/music.mp3');
    let isPlaying = false;
    let isMuted = false;
    let lastVolume = 30;
    const trackDuration = 100;
    
    // === ЭЛЕМЕНТЫ ===
    const elements = {
        themeToggle: document.getElementById('themeToggle'),
        playBtn: document.getElementById('playBtn'),
        progressBar: document.getElementById('progressBar'),
        currentTimeEl: document.getElementById('currentTime'),
        durationEl: document.getElementById('duration'),
        volumeBar: document.getElementById('volumeBar'),
        muteBtn: document.getElementById('muteBtn'),
        prevBtn: document.getElementById('prevBtn'),
        nextBtn: document.getElementById('nextBtn'),
        primaryColor: document.getElementById('primaryColor'),
        bgColor: document.getElementById('bgColor'),
        saveTheme: document.getElementById('saveTheme'),
        resetTheme: document.getElementById('resetTheme')
    };
    
    // === ФУНКЦИИ ===
    
    // Форматирование времени
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    
    // Обновление прогресса
    function updateProgress() {
        if (!elements.progressBar || !elements.currentTimeEl || !elements.durationEl) return;
        
        const currentTime = audio.currentTime || 0;
        const duration = audio.duration || trackDuration;
        
        const progressPercent = (currentTime / duration) * 100;
        elements.progressBar.value = progressPercent;
        elements.currentTimeEl.textContent = formatTime(currentTime);
        elements.durationEl.textContent = formatTime(duration);
    }
    
    // Воспроизведение/пауза
    function togglePlay() {
        const playIcon = elements.playBtn?.querySelector('i');
        if (!playIcon) return;
        
        if (isPlaying) {
            audio.pause();
            playIcon.className = 'fas fa-play';
            isPlaying = false;
        } else {
            audio.play()
                .then(() => {
                    playIcon.className = 'fas fa-pause';
                    isPlaying = true;
                })
                .catch(error => {
                    console.log('Ошибка воспроизведения:', error);
                });
        }
    }
    
    // Громкость
    function toggleMute() {
        const muteIcon = elements.muteBtn?.querySelector('i');
        if (!muteIcon) return;
        
        if (isMuted) {
            audio.volume = lastVolume / 100;
            muteIcon.className = 'fas fa-volume-up';
            if (elements.volumeBar) elements.volumeBar.value = lastVolume;
            isMuted = false;
        } else {
            lastVolume = audio.volume * 100;
            audio.volume = 0;
            muteIcon.className = 'fas fa-volume-mute';
            if (elements.volumeBar) elements.volumeBar.value = 0;
            isMuted = true;
        }
    }
    
    // Инициализация темы
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Загружаем кастомные цвета если есть
        const customPrimary = localStorage.getItem('customPrimary');
        const customBg = localStorage.getItem('customBg');
        
        if (customPrimary && customBg) {
            applyCustomTheme(customPrimary, customBg);
        }
        
        updateThemeIcon(savedTheme);
    }
    
    // Обновление иконки темы
    function updateThemeIcon(theme) {
        const themeIcon = elements.themeToggle?.querySelector('i');
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }
    
    // Применение кастомной темы
    function applyCustomTheme(primary, bg) {
        const root = document.documentElement;
        root.style.setProperty('--primary-color', primary);
        root.style.setProperty('--primary-dark', darkenColor(primary, 20));
        root.style.setProperty('--bg-color', bg);
        
        // Сохраняем цвета
        if (elements.primaryColor) elements.primaryColor.value = primary;
        if (elements.bgColor) elements.bgColor.value = bg;
    }
    
    // Затемнение цвета
    function darkenColor(color, percent) {
        let r = parseInt(color.slice(1, 3), 16);
        let g = parseInt(color.slice(3, 5), 16);
        let b = parseInt(color.slice(5, 7), 16);
        
        r = Math.floor(r * (100 - percent) / 100);
        g = Math.floor(g * (100 - percent) / 100);
        b = Math.floor(b * (100 - percent) / 100);
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    // === ОБРАБОТЧИКИ СОБЫТИЙ ===
    
    // Тема
    if (elements.themeToggle) {
        elements.themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }
    
    // Плеер
    if (elements.playBtn) {
        elements.playBtn.addEventListener('click', togglePlay);
    }
    
    if (elements.progressBar) {
        elements.progressBar.addEventListener('input', function() {
            const duration = audio.duration || trackDuration;
            audio.currentTime = (this.value / 100) * duration;
        });
    }
    
    if (elements.volumeBar) {
        elements.volumeBar.addEventListener('input', function() {
            audio.volume = this.value / 100;
            if (this.value > 0 && isMuted) {
                isMuted = false;
                const muteIcon = elements.muteBtn?.querySelector('i');
                if (muteIcon) muteIcon.className = 'fas fa-volume-up';
            }
        });
    }
    
    if (elements.muteBtn) {
        elements.muteBtn.addEventListener('click', toggleMute);
    }
    
    if (elements.prevBtn) {
        elements.prevBtn.addEventListener('click', function() {
            audio.currentTime = 0;
            updateProgress();
        });
    }
    
    if (elements.nextBtn) {
        elements.nextBtn.addEventListener('click', function() {
            audio.currentTime = audio.duration || trackDuration;
            updateProgress();
        });
    }
    
    // Кастомная тема
    if (elements.saveTheme) {
        elements.saveTheme.addEventListener('click', function() {
            const primary = elements.primaryColor?.value || '#00ff00';
            const bg = elements.bgColor?.value || '#0a0a0a';
            
            applyCustomTheme(primary, bg);
            localStorage.setItem('customPrimary', primary);
            localStorage.setItem('customBg', bg);
            
            alert('Тема сохранена!');
        });
    }
    
    if (elements.resetTheme) {
        elements.resetTheme.addEventListener('click', function() {
            localStorage.removeItem('customPrimary');
            localStorage.removeItem('customBg');
            
            // Возвращаем стандартные цвета
            const root = document.documentElement;
            root.style.removeProperty('--primary-color');
            root.style.removeProperty('--primary-dark');
            root.style.removeProperty('--bg-color');
            
            if (elements.primaryColor) elements.primaryColor.value = '#00ff00';
            if (elements.bgColor) elements.bgColor.value = '#0a0a0a';
            
            alert('Тема сброшена к стандартной');
        });
    }
    
    // События аудио
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateProgress);
    audio.addEventListener('play', function() {
        isPlaying = true;
        const playIcon = elements.playBtn?.querySelector('i');
        if (playIcon) playIcon.className = 'fas fa-pause';
    });
    audio.addEventListener('pause', function() {
        isPlaying = false;
        const playIcon = elements.playBtn?.querySelector('i');
        if (playIcon) playIcon.className = 'fas fa-play';
    });
    audio.addEventListener('ended', function() {
        isPlaying = false;
        const playIcon = elements.playBtn?.querySelector('i');
        if (playIcon) playIcon.className = 'fas fa-play';
        audio.currentTime = 0;
        updateProgress();
    });
    
    // === ИНИЦИАЛИЗАЦИЯ ===
    initTheme();
    audio.volume = 0.3;
    updateProgress();
    
    // Автовоспроизведение по клику
    document.addEventListener('click', function initAudio() {
        if (audio.paused && !isPlaying) {
            audio.play().catch(e => {
                console.log('Автовоспроизведение не удалось:', e);
            });
        }
        document.removeEventListener('click', initAudio);
    }, { once: true });
    
    console.log('Сайт Ховлера готов!');
    
    // === ПРОСТАЯ ЗАЩИТА ОТ F12 ===
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }
    });
    
    // Блокировка правой кнопки
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
});on() {
            this.src = 'data:image/svg+xml;base64,' + btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">
                    <rect width="150" height="150" fill="#00ff00" opacity="0.1"/>
                    <circle cx="75" cy="60" r="30" fill="#00ff00" opacity="0.3"/>
                    <path d="M40 110 Q75 140 110 110" stroke="#00ff00" stroke-width="4" fill="none"/>
                </svg>
            `);
        });
    }
    
    if (elements.albumCover) {
        elements.albumCover.addEventListener('error', function() {
            const albumArt = document.getElementById('albumArt');
            if (albumArt) {
                albumArt.innerHTML = '<i class="fas fa-music"></i>';
            }
        });
    }
    
    // События аудио
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateProgress);
    audio.addEventListener('play', function() {
        isPlaying = true;
        const playIcon = elements.playBtn?.querySelector('i');
        if (playIcon) playIcon.className = 'fas fa-pause';
    });
    audio.addEventListener('pause', function() {
        isPlaying = false;
        const playIcon = elements.playBtn?.querySelector('i');
        if (playIcon) playIcon.className = 'fas fa-play';
    });
    audio.addEventListener('ended', function() {
        isPlaying = false;
        const playIcon = elements.playBtn?.querySelector('i');
        if (playIcon) playIcon.className = 'fas fa-play';
        audio.currentTime = 0;
        updateProgress();
    });
    
    // Автовоспроизведение по клику
    document.addEventListener('click', function initAudio() {
        if (audio.paused && !isPlaying) {
            audio.play().catch(e => {
                console.log('Автовоспроизведение не удалось:', e);
            });
        }
        document.removeEventListener('click', initAudio);
    }, { once: true });
    
    // === ИНИЦИАЛИЗАЦИЯ ===
    initTheme();
    setupSecurity();
    updateProgress();
    
    console.log('Сайт Ховлера готов!');
});
