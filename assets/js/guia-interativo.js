// assets/js/guia-interativo.js
document.addEventListener('DOMContentLoaded', function () {
    const GUIDE_COMPLETED_KEY = 'simplifyHCGuiaInterativoCompleted_v1';
    let guideStepsData = [];
    let currentStepIndex = 0;

    let guideOverlayEl, guideBalloonEl, guideTitleEl, guideTextEl,
        guideArrowEl, guidePrevBtn, guideNextBtn, guideSkipLinkEl, guideStepCounterEl;

    let highlightedElement = null;
    let originalHighlightedElementStyles = {};

    const toggleGuideFloatingButton = document.getElementById('toggleGuideFloatingButton');

    function collectGuideSteps() {
        guideStepsData = [];
        document.querySelectorAll('[data-guide-step]').forEach(el => {
            guideStepsData.push({
                element: el,
                step: parseInt(el.dataset.guideStep, 10),
                title: el.dataset.guideTitle || 'Dica Rápida',
                text: el.dataset.guideText || 'Veja este elemento importante.',
                arrowPosition: el.dataset.guideArrow || 'down',
                videoEmbedHTML: el.dataset.guideVideoEmbed || null
            });
        });
        guideStepsData.sort((a, b) => a.step - b.step);
    }

    function createGuideUI() {
        if (document.getElementById('guide-interactive-overlay')) {
            return; // UI já existe
        }

        const guideHTML = `
            <div id="guide-interactive-overlay">
                <div class="guide-interactive-step-balloon">
                    <div class="guide-interactive-arrow"></div>
                    <div id="guideVideoContainer" class="guide-video-container" style="display:none;">
                    <!-- O vídeo será inserido aqui -->
                    </div>
                    <h4></h4>
                    <p class="guide-text"></p>
                    <div class="guide-interactive-buttons">
                        <button id="guidePrevBtn" type="button">Anterior</button>
                        <span class="guide-step-counter"></span>
                        <button id="guideNextBtn" type="button">Próximo</button>
                    </div>
                    <a href="#" id="guideSkipLink">Pular Guia / Não mostrar novamente</a>
                </div>
            </div>
        `;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = guideHTML;
        document.body.appendChild(tempDiv.firstElementChild);

        guideOverlayEl = document.getElementById('guide-interactive-overlay');
        guideBalloonEl = guideOverlayEl.querySelector('.guide-interactive-step-balloon');
        guideTitleEl = guideOverlayEl.querySelector('h4');
        guideTextEl = guideOverlayEl.querySelector('p.guide-text');
        guideArrowEl = guideOverlayEl.querySelector('.guide-interactive-arrow');
        guidePrevBtn = document.getElementById('guidePrevBtn');
        guideNextBtn = document.getElementById('guideNextBtn');
        guideSkipLinkEl = document.getElementById('guideSkipLink');
        guideStepCounterEl = guideOverlayEl.querySelector('.guide-step-counter');
        guideVideoContainerEl = guideOverlayEl.querySelector('#guideVideoContainer');

        guidePrevBtn.addEventListener('click', prevStep);
        guideNextBtn.addEventListener('click', nextStep);
        guideSkipLinkEl.addEventListener('click', (e) => {
            e.preventDefault();
            skipGuideAndStorePreference();
        });
    }

    function positionBalloon(targetElement, arrowDirection = 'down') {
        if (!guideBalloonEl || !guideArrowEl) return;

        const balloonRect = guideBalloonEl.getBoundingClientRect();
        guideArrowEl.className = 'guide-interactive-arrow'; // Reset all arrow classes first

        let top, left;
        const gap = 15; // Space between element and balloon

        if (targetElement) {
            const targetRect = targetElement.getBoundingClientRect();
            guideArrowEl.classList.add(arrowDirection); // Add specific direction class

            switch (arrowDirection) {
                case 'up':
                    top = targetRect.bottom + gap;
                    left = targetRect.left + (targetRect.width / 2) - (balloonRect.width / 2);
                    break;
                case 'left':
                    top = targetRect.top + (targetRect.height / 2) - (balloonRect.height / 2);
                    left = targetRect.right + gap;
                    break;
                case 'right':
                    top = targetRect.top + (targetRect.height / 2) - (balloonRect.height / 2);
                    left = targetRect.left - balloonRect.width - gap;
                    break;
                case 'down':
                default:
                    top = targetRect.top - balloonRect.height - gap;
                    left = targetRect.left + (targetRect.width / 2) - (balloonRect.width / 2);
                    break;
            }

            // Viewport adjustments
            const minMargin = 10;
            if (left < minMargin) {
                left = minMargin;
            } else if (left + balloonRect.width > window.innerWidth - minMargin) {
                left = window.innerWidth - balloonRect.width - minMargin;
            }

            if (top < minMargin) {
                // If balloon is trying to go off the top
                // And if it was meant to be above (arrow:down), and there's space below, flip it
                if (arrowDirection === 'down' && (targetRect.bottom + gap + balloonRect.height < window.innerHeight - minMargin)) {
                    top = targetRect.bottom + gap;
                    guideArrowEl.className = 'guide-interactive-arrow up'; // Flip arrow
                } else {
                    top = minMargin; // Otherwise, stick to top margin
                }
            } else if (top + balloonRect.height > window.innerHeight - minMargin) {
                // If balloon is trying to go off the bottom
                // And if it was meant to be below (arrow:up), and there's space above, flip it
                if (arrowDirection === 'up' && (targetRect.top - balloonRect.height - gap > minMargin)) {
                    top = targetRect.top - balloonRect.height - gap;
                    guideArrowEl.className = 'guide-interactive-arrow down'; // Flip arrow
                } else {
                    top = window.innerHeight - balloonRect.height - minMargin; // Otherwise, stick to bottom
                }
            }
        } else { // No targetElement, center the balloon
            top = (window.innerHeight / 2) - (balloonRect.height / 2);
            left = (window.innerWidth / 2) - (balloonRect.width / 2);
            // No arrow class added, so it remains a simple dot or invisible if styled that way
        }

        guideBalloonEl.style.top = `${top}px`;
        guideBalloonEl.style.left = `${left}px`;
    }

    function clearHighlight() {
        if (highlightedElement) {
            highlightedElement.classList.remove('guide-highlighted-element');
            for (const prop in originalHighlightedElementStyles) {
                highlightedElement.style[prop] = originalHighlightedElementStyles[prop];
            }
            originalHighlightedElementStyles = {};
            highlightedElement = null;
        }
    }
    
    /**
     * Helper function to reliably position the balloon after potential DOM changes (like scroll).
     */
    function _securePositionBalloon(elementToHighlight, arrowPos) {
        // Use double requestAnimationFrame to ensure layout is stable.
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                positionBalloon(elementToHighlight, arrowPos);
            });
        });
    }


    function showStep(index) {
        if (index < 0 || index >= guideStepsData.length) {
            endGuide(false);
            return;
        }
        currentStepIndex = index;
        const stepData = guideStepsData[index];

        clearHighlight(); // Limpa destaque anterior E VÍDEO ANTERIOR

        guideTitleEl.textContent = stepData.title;
        guideTextEl.innerHTML = stepData.text;
        guideStepCounterEl.textContent = `${index + 1} / ${guideStepsData.length}`;

        guidePrevBtn.disabled = (index === 0);
        guideNextBtn.textContent = (index === guideStepsData.length - 1) ? 'Concluir' : 'Próximo';

        highlightedElement = stepData.element;

        // --- LÓGICA DE CONTROLE DO MENU MOBILE ---
        const navElement = document.querySelector('#primary-navigation');
        const headerElement = document.querySelector('header');
        const menuToggle = document.querySelector('.menu-toggle');

        if (navElement && headerElement && menuToggle) {
            const isTargetInsideNav = highlightedElement ? navElement.contains(highlightedElement) : false;
            const isMenuOpen = headerElement.classList.contains('menu-open');

            if (isMenuOpen && !isTargetInsideNav) {
                // Se o menu está aberto, MAS o novo alvo NÃO está dentro do menu, FECHA o menu.
                headerElement.classList.remove('menu-open');
                menuToggle.setAttribute('aria-expanded', 'false');
                navElement.setAttribute('aria-hidden', 'true');
            } else if (!isMenuOpen && isTargetInsideNav && window.innerWidth < 992) {
                // Se o menu está fechado, E o novo alvo ESTÁ dentro do menu, E estamos em tela mobile, ABRE o menu.
                headerElement.classList.add('menu-open');
                menuToggle.setAttribute('aria-expanded', 'true');
                navElement.setAttribute('aria-hidden', 'false');
            }
        }
        // --- FIM DA LÓGICA DE CONTROLE DO MENU MOBILE ---

        // Renderiza vídeo se houver
        if (guideVideoContainerEl) {
            if (stepData.videoEmbedHTML) {
                guideVideoContainerEl.innerHTML = stepData.videoEmbedHTML;
                guideVideoContainerEl.style.display = 'block';
            } else {
                guideVideoContainerEl.innerHTML = '';
                guideVideoContainerEl.style.display = 'none';
            }
        }

        if (highlightedElement) {
            if (highlightedElement.style.position) originalHighlightedElementStyles.position = highlightedElement.style.position;
            if (highlightedElement.style.zIndex) originalHighlightedElementStyles.zIndex = highlightedElement.style.zIndex;

            highlightedElement.classList.add('guide-highlighted-element');
            if (window.getComputedStyle(highlightedElement).position === 'static') {
                highlightedElement.style.position = 'relative';
            }
            highlightedElement.style.zIndex = '10000';

            // Scroll e posicionamento (usando _securePositionBalloon)
            // Espera um frame para garantir que o menu abriu/fechou antes de posicionar
            requestAnimationFrame(() => {
                const rect = highlightedElement.getBoundingClientRect();
                const isElementInView = (
                    rect.top >= 0 && rect.left >= 0 &&
                    rect.bottom <= window.innerHeight && rect.right <= window.innerWidth
                );

                if (!isElementInView) {
                    highlightedElement.scrollIntoView({ block: 'center', inline: 'nearest' });
                    _securePositionBalloon(highlightedElement, stepData.arrowPosition);
                } else {
                    _securePositionBalloon(highlightedElement, stepData.arrowPosition);
                }
            });

        } else {
            _securePositionBalloon(null, stepData.arrowPosition);
        }
        guideOverlayEl.classList.add('active');
    }

    function nextStep() {
        if (currentStepIndex < guideStepsData.length - 1) {
            showStep(currentStepIndex + 1);
        } else {
            endGuide(true);
        }
    }

    function prevStep() {
        if (currentStepIndex > 0) {
            showStep(currentStepIndex - 1);
        }
    }

    function skipGuideAndStorePreference() {
        endGuide(true);
    }

    function startInteractiveGuide(forceStart = false) {
        if (guideStepsData.length === 0) {
            console.warn("Guia Interativo: Nenhum passo definido.");
            return;
        }
        const guideCompleted = localStorage.getItem(GUIDE_COMPLETED_KEY);
        if (forceStart || guideCompleted !== 'true') {
            if (forceStart) {
                localStorage.removeItem(GUIDE_COMPLETED_KEY);
            }
            document.body.classList.add('guide-active-no-scroll'); // Trava rolagem
            currentStepIndex = 0;
            showStep(currentStepIndex);
            document.addEventListener('keydown', handleKeyboardNavigation);
            window.addEventListener('resize', handleWindowResize);
        } else {
            console.log("Guia Interativo já completado.");
        }
    }

    function endGuide(markAsCompleted = false) {
        if (guideOverlayEl) {
            guideOverlayEl.classList.remove('active');
        }
        clearHighlight();
        document.body.classList.remove('guide-active-no-scroll'); // Libera rolagem
        if (markAsCompleted) {
            localStorage.setItem(GUIDE_COMPLETED_KEY, 'true');
        }
        document.removeEventListener('keydown', handleKeyboardNavigation);
        window.removeEventListener('resize', handleWindowResize);
    }

    function handleKeyboardNavigation(event) {
        if (!guideOverlayEl || !guideOverlayEl.classList.contains('active')) return;
        if (event.key === 'ArrowRight' && !guideNextBtn.disabled) {
            event.preventDefault(); nextStep();
        } else if (event.key === 'ArrowLeft' && !guidePrevBtn.disabled) {
            event.preventDefault(); prevStep();
        } else if (event.key === 'Escape') {
            event.preventDefault(); skipGuideAndStorePreference();
        }
    }

    function handleWindowResize() {
        if (guideOverlayEl && guideOverlayEl.classList.contains('active') && guideStepsData[currentStepIndex]) {
            const currentStepData = guideStepsData[currentStepIndex];
            _securePositionBalloon(currentStepData.element, currentStepData.arrowPosition);
        }
    }

    if (toggleGuideFloatingButton) {
        toggleGuideFloatingButton.addEventListener('click', function(e) {
            console.log("Botão flutuante do guia CLICADO!", e.target);
            e.preventDefault();
            if (!guideOverlayEl) createGuideUI();
            if (guideStepsData.length === 0) collectGuideSteps();

            if (guideOverlayEl.classList.contains('active')) {
                endGuide(false);
            } else {
                startInteractiveGuide(true);
            }
        });
    }

    createGuideUI();
    collectGuideSteps();
    if (guideStepsData.length > 0 && localStorage.getItem(GUIDE_COMPLETED_KEY) !== 'true') {
        setTimeout(() => startInteractiveGuide(false), 700);
    }
});