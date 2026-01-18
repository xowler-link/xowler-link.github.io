document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('i');
    const playBtn = document.getElementById('playBtn');
    const playIcon = playBtn.querySelector('i');
    const progressBar = document.getElementById('progressBar');
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('duration');
    const volumeBar = document.getElementById('volumeBar');
    const muteBtn = document.getElementById('muteBtn');
    const muteIcon = muteBtn.querySelector('i');
    const trackTitle = document.getElementById('trackTitle');
    const trackArtist = document.getElementById('trackArtist');
    const albumArt = document.getElementById('albumArt');
    const albumCover = document.getElementById('albumCover');
    const avatar = document.getElementById('avatar');

    const audio = new Audio('assets/music.mp3');
    let isPlaying = false;
    let isMuted = false;
    let lastVolume = 70;
    
    const trackDuration = 100; // 1:40 в секундах

    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }

    function updateThemeIcon(theme) {
        themeIcon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function updateProgress() {
        const currentTime = audio.currentTime;
        const duration = audio.duration || trackDuration;
        
        const progressPercent = (currentTime / duration) * 100;
        progressBar.value = progressPercent;
        currentTimeEl.textContent = formatTime(currentTime);
        durationEl.textContent = formatTime(duration);
    }

    function setTrackInfo() {
        trackTitle.textContent = 'БРАТИКИ САЙФЕР';
        trackArtist.textContent = 'KAMZ0NER, временно в рехабе, 7leaf, golki, мистер деньги, афоня рекордс, ONMYPLAK, mecinat';
        
        if (albumCover) {
            albumCover.addEventListener('error', function() {
                this.style.display = 'none';
                albumArt.innerHTML = '<i class="fas fa-music"></i>';
            });
        }
    }

    function togglePlay() {
        if (isPlaying) {
            audio.pause();
            playIcon.className = 'fas fa-play';
        } else {
            audio.play().then(() => {
                playIcon.className = 'fas fa-pause';
                isPlaying = true;
            }).catch(error => {
                console.log('Ошибка воспроизведения:', error);
                // Показываем уведомление, если нужно
                alert('Нажмите на страницу, чтобы разрешить воспроизведение музыки');
            });
        }
    }

    function toggleMute() {
        if (isMuted) {
            audio.volume = lastVolume / 100;
            muteIcon.className = 'fas fa-volume-up';
            volumeBar.value = lastVolume;
        } else {
            lastVolume = audio.volume * 100;
            audio.volume = 0;
            muteIcon.className = 'fas fa-volume-mute';
            volumeBar.value = 0;
        }
        isMuted = !isMuted;
    }

    if (progressBar) {
        progressBar.addEventListener('input', function() {
            const duration = audio.duration || trackDuration;
            audio.currentTime = (this.value / 100) * duration;
        });
    }

    if (volumeBar) {
        volumeBar.addEventListener('input', function() {
            audio.volume = this.value / 100;
            if (this.value > 0 && isMuted) {
                isMuted = false;
                muteIcon.className = 'fas fa-volume-up';
            }
        });
    }

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', function() {
        if (audio.duration) {
            durationEl.textContent = formatTime(audio.duration);
        } else {
            durationEl.textContent = formatTime(trackDuration);
        }
    });
    
    audio.addEventListener('ended', function() {
        isPlaying = false;
        playIcon.className = 'fas fa-play';
        audio.currentTime = 0;
        updateProgress();
    });

    audio.addEventListener('play', function() {
        isPlaying = true;
        playIcon.className = 'fas fa-pause';
    });

    audio.addEventListener('pause', function() {
        isPlaying = false;
        playIcon.className = 'fas fa-play';
    });

    if (playBtn) {
        playBtn.addEventListener('click', togglePlay);
    }

    if (muteBtn) {
        muteBtn.addEventListener('click', toggleMute);
    }

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            audio.currentTime = 0;
            updateProgress();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            audio.currentTime = audio.duration || trackDuration;
            updateProgress();
        });
    }

    if (avatar) {
        avatar.addEventListener('error', function() {
            this.src = 'data:image/svg+xml;base64,' + btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">
                    <rect width="150" height="150" fill="#00ff00" opacity="0.1"/>
                    <circle cx="75" cy="60" r="30" fill="#00ff00" opacity="0.3"/>
                    <path d="M40 110 Q75 140 110 110" stroke="#00ff00" stroke-width="4" fill="none"/>
                </svg>
            `);
        });
    }

    // Запускаем всё
    initTheme();
    setTrackInfo();
    audio.volume = volumeBar ? volumeBar.value / 100 : 0.7;
    updateProgress();
    
    // Обработка клика по странице для автовоспроизведения
    document.addEventListener('click', function initAudio() {
        if (audio.paused) {
            audio.play().catch(e => console.log('Автовоспроизведение заблокировано'));
        }
        document.removeEventListener('click', initAudio);
    });

    // Для мобильных устройств
    document.addEventListener('touchstart', function initAudioTouch() {
        if (audio.paused) {
            audio.play().catch(e => console.log('Автовоспроизведение заблокировано'));
        }
        document.removeEventListener('touchstart', initAudioTouch);
    });
});
