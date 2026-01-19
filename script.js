document.addEventListener('DOMContentLoaded', function() {
    let snowActive = localStorage.getItem('snow') === 'true';
    let snowAnimation = null;
    let snowflakes = [];
    
    function initSnow() {
        const canvas = document.getElementById('snowCanvas');
        if (!canvas) return;
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const ctx = canvas.getContext('2d');
        
        for (let i = 0; i < 100; i++) {
            snowflakes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 3 + 1,
                speed: Math.random() * 1 + 0.5,
                opacity: Math.random() * 0.5 + 0.3,
                wind: Math.random() * 0.3 - 0.15
            });
        }
        
        function drawSnowflakes() {
            if (!snowActive) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            snowflakes.forEach(flake => {
                ctx.beginPath();
                ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
                ctx.fill();
                
                flake.y += flake.speed;
                flake.x += flake.wind;
                
                if (flake.y > canvas.height) {
                    flake.y = -10;
                    flake.x = Math.random() * canvas.width;
                }
                
                if (flake.x > canvas.width) {
                    flake.x = 0;
                } else if (flake.x < 0) {
                    flake.x = canvas.width;
                }
            });
        }
        
        function animateSnow() {
            drawSnowflakes();
            snowAnimation = requestAnimationFrame(animateSnow);
        }
        
        if (snowActive) {
            animateSnow();
        }
        
        window.addEventListener('resize', function() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
        
        updateSnowIcon();
    }
    
    function toggleSnow() {
        snowActive = !snowActive;
        localStorage.setItem('snow', snowActive);
        
        const snowIcon = document.querySelector('#snowToggle i');
        if (snowIcon) {
            if (snowActive) {
                snowIcon.style.color = '#00ff00';
                snowIcon.style.transform = 'rotate(360deg)';
            } else {
                snowIcon.style.color = '';
                snowIcon.style.transform = 'rotate(0deg)';
            }
        }
        
        if (snowActive) {
            if (!snowAnimation) {
                initSnow();
            }
        } else {
            if (snowAnimation) {
                cancelAnimationFrame(snowAnimation);
                snowAnimation = null;
            }
            const canvas = document.getElementById('snowCanvas');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    }
    
    function updateSnowIcon() {
        const snowIcon = document.querySelector('#snowToggle i');
        if (snowIcon) {
            if (snowActive) {
                snowIcon.style.color = '#00ff00';
            } else {
                snowIcon.style.color = '';
            }
        }
    }
    
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }
    
    document.getElementById('themeToggle').addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const themeIcon = this.querySelector('i');
        if (themeIcon) {
            themeIcon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        }
    });
    
    const tracks = [
        {
            file: 'assets/music.mp3',
            title: 'БРАТИКИ САЙФЕР',
            artist: 'KAMZ0NER, временно в рехабе, 7leaf, golki, мистер деньги, афоня рекордс, ONMYPLAK, mecinat',
            duration: 100
        },
        {
            file: 'assets/music2.mp3',
            title: 'большая с:',
            artist: 'KAMZ0NER, no9hook',
            duration: 83
        },
        {
            file: 'assets/music3.mp3',
            title: 'Чипсы',
            artist: 'Ernest Merkel, LilSemmi, KAMZ0NER, Cumottyyx, geoxantes, dabbackwood',
            duration: 221
        }
    ];
    
    let currentTrackIndex = 0;
    let isPlaying = false;
    let isMuted = false;
    let lastVolume = 30;
    
    const audio = new Audio(tracks[currentTrackIndex].file);
    
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    
    function updateTrackInfo() {
        const track = tracks[currentTrackIndex];
        document.getElementById('trackTitle').textContent = track.title;
        document.getElementById('trackArtist').textContent = track.artist;
        document.getElementById('duration').textContent = formatTime(track.duration);
        
        document.querySelectorAll('.playlist-track').forEach((trackEl, index) => {
            if (index === currentTrackIndex) {
                trackEl.classList.add('active');
            } else {
                trackEl.classList.remove('active');
            }
        });
    }
    
    function updateProgress() {
        const progressBar = document.getElementById('progressBar');
        const currentTimeEl = document.getElementById('currentTime');
        const durationEl = document.getElementById('duration');
        
        if (!progressBar || !currentTimeEl || !durationEl) return;
        
        const currentTime = audio.currentTime || 0;
        const duration = audio.duration || tracks[currentTrackIndex].duration;
        
        const progressPercent = (currentTime / duration) * 100;
        progressBar.value = progressPercent;
        currentTimeEl.textContent = formatTime(currentTime);
        durationEl.textContent = formatTime(duration);
    }
    
    function changeTrack(index) {
        if (index < 0) index = tracks.length - 1;
        if (index >= tracks.length) index = 0;
        
        const wasPlaying = isPlaying;
        
        audio.pause();
        currentTrackIndex = index;
        audio.src = tracks[currentTrackIndex].file;
        
        updateTrackInfo();
        updateProgress();
        
        if (wasPlaying) {
            audio.play().catch(e => console.log('Ошибка воспроизведения:', e));
        }
    }
    
    function togglePlay() {
        const playIcon = document.querySelector('#playBtn i');
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
    
    function toggleMute() {
        const muteIcon = document.querySelector('#muteBtn i');
        const volumeBar = document.getElementById('volumeBar');
        if (!muteIcon) return;
        
        if (isMuted) {
            audio.volume = lastVolume / 100;
            muteIcon.className = 'fas fa-volume-up';
            if (volumeBar) volumeBar.value = lastVolume;
            isMuted = false;
        } else {
            lastVolume = audio.volume * 100;
            audio.volume = 0;
            muteIcon.className = 'fas fa-volume-mute';
            if (volumeBar) volumeBar.value = 0;
            isMuted = true;
        }
    }
    
    initTheme();
    initSnow();
    audio.volume = 0.3;
    updateTrackInfo();
    
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateProgress);
    audio.addEventListener('play', function() {
        isPlaying = true;
        const playIcon = document.querySelector('#playBtn i');
        if (playIcon) playIcon.className = 'fas fa-pause';
    });
    audio.addEventListener('pause', function() {
        isPlaying = false;
        const playIcon = document.querySelector('#playBtn i');
        if (playIcon) playIcon.className = 'fas fa-play';
    });
    audio.addEventListener('ended', function() {
        changeTrack(currentTrackIndex + 1);
    });
    
    document.getElementById('playBtn').addEventListener('click', togglePlay);
    document.getElementById('muteBtn').addEventListener('click', toggleMute);
    document.getElementById('snowToggle').addEventListener('click', toggleSnow);
    
    document.getElementById('prevBtn').addEventListener('click', function() {
        changeTrack(currentTrackIndex - 1);
    });
    
    document.getElementById('nextBtn').addEventListener('click', function() {
        changeTrack(currentTrackIndex + 1);
    });
    
    document.getElementById('progressBar').addEventListener('input', function() {
        const duration = audio.duration || tracks[currentTrackIndex].duration;
        audio.currentTime = (this.value / 100) * duration;
    });
    
    document.getElementById('volumeBar').addEventListener('input', function() {
        audio.volume = this.value / 100;
        if (this.value > 0 && isMuted) {
            isMuted = false;
            const muteIcon = document.querySelector('#muteBtn i');
            if (muteIcon) muteIcon.className = 'fas fa-volume-up';
        }
    });
    
    document.querySelectorAll('.playlist-track').forEach((trackEl, index) => {
        trackEl.addEventListener('click', function() {
            changeTrack(index);
        });
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }
    });
    
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
}); 140 110 110" stroke="#00ff00" stroke-width="4" fill="none"/>
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
