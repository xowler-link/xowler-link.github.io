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
    const avatar = document.getElementById('avatar');

    const audio = new Audio('assets/music.mp3');
    let isPlaying = false;
    let isMuted = false;
    let lastVolume = 70;

    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }

    function updateThemeIcon(theme) {
        themeIcon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function updateProgress() {
        const currentTime = audio.currentTime;
        const duration = audio.duration;
        
        if (duration) {
            const progressPercent = (currentTime / duration) * 100;
            progressBar.value = progressPercent;
            currentTimeEl.textContent = formatTime(currentTime);
            durationEl.textContent = formatTime(duration);
        }
    }

    function updateTrackInfo() {
        fetch('assets/music.mp3')
            .then(response => response.blob())
            .then(blob => {
                if (window.jsmediatags) {
                    window.jsmediatags.read(blob, {
                        onSuccess: function(tag) {
                            const title = tag.tags.title || 'Неизвестный трек';
                            const artist = tag.tags.artist || 'Ховлер';
                            
                            trackTitle.textContent = title;
                            trackArtist.textContent = artist;
                            
                            if (tag.tags.picture) {
                                const picture = tag.tags.picture;
                                const base64String = Array.from(picture.data)
                                    .map(byte => String.fromCharCode(byte))
                                    .join('');
                                const imageUrl = 'data:' + picture.format + ';base64,' + window.btoa(base64String);
                                
                                const img = document.createElement('img');
                                img.src = imageUrl;
                                img.alt = 'Обложка альбома';
                                albumArt.innerHTML = '';
                                albumArt.appendChild(img);
                            }
                        },
                        onError: function(error) {
                            trackTitle.textContent = 'Мой трек';
                            trackArtist.textContent = 'Ховлер';
                        }
                    });
                } else {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jsmediatags/3.9.7/jsmediatags.min.js';
                    script.onload = () => updateTrackInfo();
                    document.head.appendChild(script);
                }
            })
            .catch(error => {
                trackTitle.textContent = 'Музыкальный трек';
                trackArtist.textContent = 'Ховлер';
            });
    }

    function togglePlay() {
        if (isPlaying) {
            audio.pause();
            playIcon.className = 'fas fa-play';
        } else {
            audio.play();
            playIcon.className = 'fas fa-pause';
        }
        isPlaying = !isPlaying;
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

    progressBar.addEventListener('input', function() {
        const duration = audio.duration;
        if (duration) {
            audio.currentTime = (this.value / 100) * duration;
        }
    });

    volumeBar.addEventListener('input', function() {
        audio.volume = this.value / 100;
        if (this.value > 0 && isMuted) {
            isMuted = false;
            muteIcon.className = 'fas fa-volume-up';
        }
    });

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateProgress);
    audio.addEventListener('ended', function() {
        isPlaying = false;
        playIcon.className = 'fas fa-play';
        audio.currentTime = 0;
        updateProgress();
    });

    playBtn.addEventListener('click', togglePlay);
    muteBtn.addEventListener('click', toggleMute);

    document.getElementById('prevBtn').addEventListener('click', function() {
        audio.currentTime = 0;
        updateProgress();
    });

    document.getElementById('nextBtn').addEventListener('click', function() {
        audio.currentTime = audio.duration;
        updateProgress();
    });

    avatar.addEventListener('error', function() {
        this.src = 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">
                <rect width="150" height="150" fill="#00ff00" opacity="0.1"/>
                <circle cx="75" cy="60" r="30" fill="#00ff00" opacity="0.3"/>
                <path d="M40 110 Q75 140 110 110" stroke="#00ff00" stroke-width="4" fill="none"/>
            </svg>
        `);
    });

    initTheme();
    updateTrackInfo();
    audio.volume = volumeBar.value / 100;
    updateProgress();
});