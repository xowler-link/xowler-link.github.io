// ============================================
// СИСТЕМА ЗАЩИТЫ ОТ DEVTOOLS - МАКСИМАЛЬНАЯ
// ============================================

(function() {
    'use strict';
    
    // Конфигурация защиты
    const SECURITY_CONFIG = {
        antiDebug: true,
        blockF12: true,
        blockRightClick: true,
        blockCtrlKeys: true,
        detectDevTools: true,
        obfuscateCode: true,
        antiTamper: true,
        redirectOnViolation: true
    };
    
    // Состояние системы защиты
    let securityBreached = false;
    let detectionCount = 0;
    const MAX_DETECTIONS = 3;
    
    // ============================================
    // 1. ОСНОВНАЯ ЗАЩИТА ОТ ОТКРЫТИЯ DEVTOOLS
    // ============================================
    
    // Метод замера времени выполнения debugger
    function debuggerDetection() {
        const startTime = performance.now();
        
        // Создаем скрытый debugger
        (function() {
            try {
                (function() {})["constructor"]("debugger")();
            } catch(e) {}
        })();
        
        const endTime = performance.now();
        
        // Если выполнение заняло слишком много времени - значит был debugger
        if (endTime - startTime > 200) {
            securityViolation("Debugger detected");
            return true;
        }
        return false;
    }
    
    // ============================================
    // 2. ОБНАРУЖЕНИЕ ОТКРЫТОЙ КОНСОЛИ
    // ============================================
    
    function detectConsole() {
        // Метод 1: Проверка размеров окна
        const widthThreshold = window.outerWidth - window.innerWidth > 160;
        const heightThreshold = window.outerHeight - window.innerHeight > 160;
        
        // Метод 2: Проверка через devtools detector
        const devtools = {
            open: false,
            orientation: undefined
        };
        
        const threshold = 160;
        
        const checkDevTools = () => {
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;
            
            if (!(heightThreshold && widthThreshold) && 
                ((window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) || 
                 widthThreshold || 
                 heightThreshold)) {
                devtools.open = true;
                securityViolation("DevTools открыты");
            } else {
                devtools.open = false;
            }
        };
        
        checkDevTools();
        window.addEventListener('resize', checkDevTools);
        
        // Метод 3: Проверка через переопределение console
        if (SECURITY_CONFIG.detectDevTools) {
            const element = new Image();
            Object.defineProperty(element, 'id', {
                get: function() {
                    securityViolation("Console property access detected");
                    return '';
                }
            });
            console.log(element);
        }
        
        return widthThreshold || heightThreshold;
    }
    
    // ============================================
    // 3. БЛОКИРОВКА КЛАВИШ
    // ============================================
    
    function setupKeyBlocking() {
        document.addEventListener('keydown', function(e) {
            // Блокировка F12
            if (e.key === 'F12' && SECURITY_CONFIG.blockF12) {
                e.preventDefault();
                e.stopPropagation();
                securityViolation("F12 pressed");
                return false;
            }
            
            // Блокировка Ctrl+Shift+I
            if (e.ctrlKey && e.shiftKey && e.key === 'I' && SECURITY_CONFIG.blockCtrlKeys) {
                e.preventDefault();
                e.stopPropagation();
                securityViolation("Ctrl+Shift+I pressed");
                return false;
            }
            
            // Блокировка Ctrl+Shift+J
            if (e.ctrlKey && e.shiftKey && e.key === 'J' && SECURITY_CONFIG.blockCtrlKeys) {
                e.preventDefault();
                e.stopPropagation();
                securityViolation("Ctrl+Shift+J pressed");
                return false;
            }
            
            // Блокировка Ctrl+Shift+C
            if (e.ctrlKey && e.shiftKey && e.key === 'C' && SECURITY_CONFIG.blockCtrlKeys) {
                e.preventDefault();
                e.stopPropagation();
                securityViolation("Ctrl+Shift+C pressed");
                return false;
            }
            
            // Блокировка Ctrl+U (просмотр исходного кода)
            if (e.ctrlKey && e.key === 'U' && SECURITY_CONFIG.blockCtrlKeys) {
                e.preventDefault();
                e.stopPropagation();
                securityViolation("Ctrl+U pressed");
                return false;
            }
            
            // Блокировка Ctrl+S (сохранение страницы)
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            
            // Блокировка Ctrl+P (печать)
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }, true);
        
        // Двойное событие для максимальной блокировки
        window.addEventListener('keydown', function(e) {
            if (e.key === 'F12') {
                e.preventDefault();
                e.stopImmediatePropagation();
                return false;
            }
        }, true);
    }
    
    // ============================================
    // 4. БЛОКИРОВКА КОНТЕКСТНОГО МЕНЮ
    // ============================================
    
    function setupContextMenuBlocking() {
        // Основная блокировка
        document.addEventListener('contextmenu', function(e) {
            if (SECURITY_CONFIG.blockRightClick) {
                e.preventDefault();
                e.stopPropagation();
                securityViolation("Right click blocked");
                return false;
            }
        }, true);
        
        // Дополнительная блокировка для body
        document.body.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        }, true);
        
        // Блокировка для всех элементов
        document.addEventListener('mousedown', function(e) {
            if (e.button === 2) {
                e.preventDefault();
                return false;
            }
        }, true);
    }
    
    // ============================================
    // 5. ОБНАРУЖЕНИЕ ИЗМЕНЕНИЙ В DOM
    // ============================================
    
    function setupDOMMonitoring() {
        if (!SECURITY_CONFIG.antiTamper) return;
        
        // Сохраняем оригинальный HTML
        const originalHTML = document.documentElement.outerHTML;
        
        // Мониторинг изменений DOM
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                // Если изменения были не от нашего скрипта
                if (mutation.type === 'attributes' || 
                    mutation.type === 'childList' ||
                    mutation.type === 'characterData') {
                    
                    // Проверяем, не связаны ли изменения с DevTools
                    const target = mutation.target;
                    if (target && 
                        (target.id === 'devToolsTrap' || 
                         target.classList.contains('devtools') ||
                         target.getAttribute('data-devtools'))) {
                        securityViolation("DOM manipulation detected");
                    }
                }
            });
        });
        
        // Начинаем наблюдение
        observer.observe(document.documentElement, {
            attributes: true,
            childList: true,
            characterData: true,
            subtree: true,
            attributeOldValue: true,
            characterDataOldValue: true
        });
        
        // Проверка целостности HTML
        setInterval(function() {
            if (document.documentElement.outerHTML.length < originalHTML.length * 0.9 ||
                document.documentElement.outerHTML.length > originalHTML.length * 1.1) {
                securityViolation("HTML integrity violation");
            }
        }, 5000);
    }
    
    // ============================================
    // 6. ЗАЩИТА ОТ ОБХОДА ЧЕРЕЗ БУКМАРКЛЕТ
    // ============================================
    
    function setupBookmarkletProtection() {
        // Проверка на выполнение javascript: в URL
        if (window.location.protocol === 'javascript:') {
            securityViolation("Bookmarklet execution detected");
            window.location.href = 'about:blank';
        }
        
        // Мониторинг изменений URL
        let lastURL = window.location.href;
        setInterval(function() {
            if (window.location.href !== lastURL) {
                if (window.location.protocol === 'javascript:') {
                    securityViolation("URL manipulation detected");
                    window.location.href = 'about:blank';
                }
                lastURL = window.location.href;
            }
        }, 100);
    }
    
    // ============================================
    // 7. АНТИ-ДЕБАГ МЕТОДЫ
    // ============================================
    
    function setupAntiDebug() {
        if (!SECURITY_CONFIG.antiDebug) return;
        
        // Метод с бесконечным циклом debugger
        function infiniteDebugger() {
            if (securityBreached) return;
            
            try {
                // Запускаем debugger в другом контексте
                Function("debugger;")();
            } catch(err) {}
            
            // Рекурсивный вызов
            setTimeout(infiniteDebugger, 50);
        }
        
        // Альтернативный метод с использованием eval
        function evalDebugger() {
            const start = Date.now();
            (function(){}).constructor("debugger")();
            const end = Date.now();
            
            if (end - start > 100) {
                securityViolation("Debugger bypass detected");
            }
        }
        
        // Запускаем оба метода
        setTimeout(infiniteDebugger, 1000);
        setInterval(evalDebugger, 2000);
        
        // Скрытый debugger в данных
        const hiddenDebugger = "debugger";
        Object.defineProperty(window, '__hidden_debug__', {
            get: function() {
                securityViolation("Hidden debugger accessed");
                return hiddenDebugger;
            },
            set: function(value) {
                if (value === 'debugger') {
                    securityViolation("Debugger attempt");
                }
            },
            configurable: false,
            enumerable: false
        });
    }
    
    // ============================================
    // 8. ОБРАБОТЧИК НАРУШЕНИЙ БЕЗОПАСНОСТИ
    // ============================================
    
    function securityViolation(reason) {
        if (securityBreached) return;
        
        detectionCount++;
        console.error(`[SECURITY VIOLATION #${detectionCount}] ${reason}`);
        
        if (detectionCount >= MAX_DETECTIONS) {
            securityBreached = true;
            activateSecurityMeasures();
        }
        
        // Запускаем дополнительные проверки
        setTimeout(debuggerDetection, 100);
        setTimeout(detectConsole, 200);
    }
    
    function activateSecurityMeasures() {
        // 1. Показываем экран блокировки
        const overlay = document.getElementById('securityOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Перемещаем overlay на верхний уровень
            document.body.appendChild(overlay);
        }
        
        // 2. Блокируем весь контент
        document.body.innerHTML = '';
        if (overlay) {
            document.body.appendChild(overlay);
        }
        
        // 3. Отключаем все скрипты
        const scripts = document.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
            try {
                scripts[i].parentNode.removeChild(scripts[i]);
            } catch(e) {}
        }
        
        // 4. Запрещаем навигацию
        window.onbeforeunload = function() {
            return "Security violation detected. Navigation blocked.";
        };
        
        // 5. Перенаправление (опционально)
        if (SECURITY_CONFIG.redirectOnViolation) {
            setTimeout(function() {
                try {
                    window.location.replace('about:blank');
                } catch(e) {
                    // Игнорируем ошибки
                }
            }, 3000);
        }
        
        // 6. Отправка уведомления (если нужно)
        try {
            if (navigator.sendBeacon) {
                const data = new FormData();
                data.append('violation', 'devtools_opened');
                data.append('url', window.location.href);
                data.append('time', new Date().toISOString());
                navigator.sendBeacon('/security-log', data);
            }
        } catch(e) {}
        
        // 7. Скрытие исходного кода
        document.documentElement.style.display = 'none';
        setTimeout(() => {
            document.documentElement.style.display = '';
        }, 100);
    }
    
    // ============================================
    // 9. СКРЫТЫЕ ЛОВУШКИ
    // ============================================
    
    function setupHiddenTraps() {
        // Ловушка для консоли
        console.trap = function() {
            securityViolation("Console trap triggered");
        };
        
        // Скрытые элементы-ловушки
        const trapDiv = document.createElement('div');
        trapDiv.id = '__devtools_trap__';
        trapDiv.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;';
        trapDiv.setAttribute('data-devtools-trap', 'true');
        trapDiv.innerHTML = 'DEVTOOLS_TRAP';
        document.body.appendChild(trapDiv);
        
        // Мониторинг изменений ловушки
        new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' || mutation.type === 'characterData') {
                    securityViolation("DevTools trap triggered");
                }
            });
        }).observe(trapDiv, {
            attributes: true,
            characterData: true,
            childList: true,
            subtree: true
        });
        
        // Ловушка через переопределение getters
        Object.defineProperty(document, '__devtools', {
            get: function() {
                securityViolation("DevTools property accessed");
                return null;
            },
            configurable: false,
            enumerable: false
        });
    }
    
    // ============================================
    // 10. ИНИЦИАЛИЗАЦИЯ ВСЕЙ СИСТЕМЫ ЗАЩИТЫ
    // ============================================
    
    function initializeSecuritySystem() {
        console.log('[SECURITY] System initializing...');
        
        // Запускаем все системы защиты
        setupKeyBlocking();
        setupContextMenuBlocking();
        setupDOMMonitoring();
        setupBookmarkletProtection();
        setupHiddenTraps();
        
        if (SECURITY_CONFIG.antiDebug) {
            setupAntiDebug();
        }
        
        // Постоянный мониторинг
        setInterval(function() {
            if (detectConsole()) {
                securityViolation("Continuous console detection");
            }
            
            if (debuggerDetection()) {
                securityViolation("Continuous debugger detection");
            }
        }, 1000);
        
        // Защита от удаления этой функции
        Object.defineProperty(window, '__security_init__', {
            value: initializeSecuritySystem,
            writable: false,
            configurable: false,
            enumerable: false
        });
        
        console.log('[SECURITY] System activated');
    }
    
    // ============================================
    // ЗАПУСК СИСТЕМЫ
    // ============================================
    
    // Запускаем после полной загрузки страницы
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeSecuritySystem);
    } else {
        initializeSecuritySystem();
    }
    
    // Дублируем запуск для надежности
    window.addEventListener('load', function() {
        setTimeout(initializeSecuritySystem, 100);
    });
    
    // Защита от остановки скрипта
    Object.defineProperty(window, 'stopSecurity', {
        get: function() {
            securityViolation("Security system access attempt");
            return function() {};
        },
        configurable: false
    });
    
})();