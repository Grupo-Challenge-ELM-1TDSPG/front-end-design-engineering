// assets/js/guia-interativo.js
document.addEventListener('DOMContentLoaded', function () {

    const BASE_GUIDE_STORAGE_KEY = 'simplesHCGuiaConcluidoPagina_';
    const currentPagePath = window.location.pathname;
    // Cria uma chave mais "limpa" e válida para localStorage
    const pageKeyPart = currentPagePath.substring(currentPagePath.lastIndexOf('/') + 1).replace(/\.html$|\.htm$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const GUIDE_COMPLETED_KEY_FOR_CURRENT_PAGE = `${BASE_GUIDE_STORAGE_KEY}${pageKeyPart || 'homepage'}_v1`; // Adiciona 'homepage' se pageKeyPart for vazio (raiz)


    let guideStepsData = [];
    let currentStepIndex = 0;

    // Elementos do guia
    let guideOverlayEl, guideBalloonEl, guideTitleEl, guideTextEl,
        guideArrowEl, guidePrevBtn, guideNextBtn, guideSkipLinkEl, guideStepCounterEl, guideVideoContainerEl;

    let highlightedElement = null;
    let originalHighlightedElementStyles = {}; // Para restaurar estilos inline
    let wasOriginallyStatic = false; // Nova flag para controlar position:static

    const toggleGuideFloatingButton = document.getElementById('toggleGuideFloatingButton');

    // Coleta os passos do guia a partir dos elementos com data-guide-step
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

    // Cria a interface do guia interativo (overlay e balão)
    function createGuideUI() {
        if (document.getElementById('guide-interactive-overlay')) {
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
            guidePrevBtn.removeEventListener('click', prevStep); 
            guideNextBtn.removeEventListener('click', nextStep);
            guideSkipLinkEl.removeEventListener('click', skipGuideHandler);
            guidePrevBtn.addEventListener('click', prevStep);
            guideNextBtn.addEventListener('click', nextStep);
            guideSkipLinkEl.addEventListener('click', skipGuideHandler);
            return;
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
        guideSkipLinkEl.addEventListener('click', skipGuideHandler); // Usar uma função wrapper
    }

    // Wrapper para o skip link para poder usar e.preventDefault()
    function skipGuideHandler(e) {
        e.preventDefault();
        skipGuideAndStorePreference();
    }


    // Posiciona o balão do guia em relação ao elemento destacado
    function positionBalloon(targetElement, arrowDirection = 'down') {
        if (!guideBalloonEl || !guideArrowEl) return;

        const balloonRect = guideBalloonEl.getBoundingClientRect();
        guideArrowEl.className = 'guide-interactive-arrow';

        let top, left;
        const gap = 15; // Espaço entre elemento e balão

        if (targetElement) {
            const targetRect = targetElement.getBoundingClientRect();
            guideArrowEl.classList.add(arrowDirection);

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

            // Ajustes para não sair da tela
            const minMargin = 10;
            if (left < minMargin) {
                left = minMargin;
            } else if (left + balloonRect.width > window.innerWidth - minMargin) {
                left = window.innerWidth - balloonRect.width - minMargin;
            }

            if (top < minMargin) {
                if (arrowDirection === 'down' && (targetRect.bottom + gap + balloonRect.height < window.innerHeight - minMargin)) {
                    top = targetRect.bottom + gap;
                    guideArrowEl.className = 'guide-interactive-arrow up';
                } else {
                    top = minMargin;
                }
            } else if (top + balloonRect.height > window.innerHeight - minMargin) {
                if (arrowDirection === 'up' && (targetRect.top - balloonRect.height - gap > minMargin)) {
                    top = targetRect.top - balloonRect.height - gap;
                    guideArrowEl.className = 'guide-interactive-arrow down';
                } else {
                    top = window.innerHeight - balloonRect.height - minMargin;
                }
            }
        } else {
            // Centraliza se não houver elemento alvo
            top = (window.innerHeight / 2) - (balloonRect.height / 2);
            left = (window.innerWidth / 2) - (balloonRect.width / 2);
        }

        guideBalloonEl.style.top = `${top}px`;
        guideBalloonEl.style.left = `${left}px`;
    }

    // Remove destaque do elemento anterior e limpa vídeo
    function clearHighlight() {
        if (highlightedElement) {
            highlightedElement.classList.remove('guide-highlighted-element');

            // Restaura 'position'
            if (originalHighlightedElementStyles.hasOwnProperty('position')) {
                highlightedElement.style.position = originalHighlightedElementStyles.position;
            } else if (wasOriginallyStatic) { // Se nós mudamos para 'relative' de 'static'
                highlightedElement.style.removeProperty('position');
            }

            // Restaura 'z-index'
            if (originalHighlightedElementStyles.hasOwnProperty('zIndex')) {
                highlightedElement.style.zIndex = originalHighlightedElementStyles.zIndex;
            } else {
                // Se não havia z-index inline original, remove o que adicionamos.
                // Isso é importante mesmo que position tenha sido revertido para static,
                // pois um z-index pode ter sido aplicado a um elemento que já era 'relative'.
                highlightedElement.style.removeProperty('z-index');
            }
            
            originalHighlightedElementStyles = {};
            wasOriginallyStatic = false; // Reseta a flag
            highlightedElement = null;
        }
        // Limpa o vídeo também
        if (guideVideoContainerEl) {
            guideVideoContainerEl.innerHTML = '';
            guideVideoContainerEl.style.display = 'none';
        }
    }
    
    function _securePositionBalloon(elementToHighlight, arrowPos) {
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

        clearHighlight(); // Limpa destaque e vídeo ANTES de configurar o novo passo

        guideTitleEl.textContent = stepData.title;
        guideTextEl.innerHTML = stepData.text;
        guideStepCounterEl.textContent = `${index + 1} / ${guideStepsData.length}`;

        guidePrevBtn.disabled = (index === 0);
        guideNextBtn.textContent = (index === guideStepsData.length - 1) ? 'Concluir' : 'Próximo';

        highlightedElement = stepData.element;

        const navElement = document.querySelector('#primary-navigation');
        const headerElement = document.querySelector('header');
        const menuToggle = document.querySelector('.menu-toggle');

        if (navElement && headerElement && menuToggle) {
            const isTargetInsideNav = highlightedElement ? navElement.contains(highlightedElement) : false;
            const isMenuOpen = headerElement.classList.contains('menu-open');

            if (isMenuOpen && !isTargetInsideNav) {
                headerElement.classList.remove('menu-open');
                menuToggle.setAttribute('aria-expanded', 'false');
                navElement.setAttribute('aria-hidden', 'true');
            } else if (!isMenuOpen && isTargetInsideNav && window.innerWidth < 992) {
                headerElement.classList.add('menu-open');
                menuToggle.setAttribute('aria-expanded', 'true');
                navElement.setAttribute('aria-hidden', 'false');
            }
        }

        if (guideVideoContainerEl) {
            if (stepData.videoEmbedHTML) {
                guideVideoContainerEl.innerHTML = stepData.videoEmbedHTML;
                guideVideoContainerEl.style.display = 'block';
            } else {
                guideVideoContainerEl.style.display = 'none';
            }
        }

        if (highlightedElement) {
            originalHighlightedElementStyles = {}; // Limpa para o novo elemento
            wasOriginallyStatic = false; // Reseta flag

            // Salva estilos inline ANTES de modificar
            if (highlightedElement.style.position) {
                originalHighlightedElementStyles.position = highlightedElement.style.position;
            }
            if (highlightedElement.style.zIndex) {
                originalHighlightedElementStyles.zIndex = highlightedElement.style.zIndex;
            }

            highlightedElement.classList.add('guide-highlighted-element');
            
            const computedPosition = window.getComputedStyle(highlightedElement).position;
            if (computedPosition === 'static') {
                highlightedElement.style.position = 'relative';
                wasOriginallyStatic = true; // Marca que nós mudamos de static para relative
            }
            // Aplica z-index alto sempre para o elemento destacado
            highlightedElement.style.zIndex = '10000'; 

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
            console.warn("Guia Interativo: Nenhum passo definido para esta página.");
            return;
        }
        // USA A CHAVE ESPECÍFICA DA PÁGINA
        const guideCompleted = localStorage.getItem(GUIDE_COMPLETED_KEY_FOR_CURRENT_PAGE);

        if (forceStart || guideCompleted !== 'true') {
            if (forceStart) {
                localStorage.removeItem(GUIDE_COMPLETED_KEY_FOR_CURRENT_PAGE);
            }
            document.body.classList.add('guide-active-no-scroll');
            currentStepIndex = 0;
            showStep(currentStepIndex);
            document.addEventListener('keydown', handleKeyboardNavigation);
            window.addEventListener('resize', handleWindowResize);
        } else {
            console.log(`Guia Interativo para a página ${pageKeyPart || 'homepage'} já completado.`);
        }
    }

    function endGuide(markAsCompleted = false) {
        if (guideOverlayEl) {
            guideOverlayEl.classList.remove('active');
        }
        clearHighlight(); // Limpa destaque e vídeo
        document.body.classList.remove('guide-active-no-scroll');
        if (markAsCompleted) {
            // SALVA O STATUS DE "COMPLETO" PARA A PÁGINA ATUAL
            localStorage.setItem(GUIDE_COMPLETED_KEY_FOR_CURRENT_PAGE, 'true');
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
            e.preventDefault();
            if (!guideOverlayEl) createGuideUI(); 
            if (guideStepsData.length === 0) collectGuideSteps(); 

            if (guideOverlayEl && guideOverlayEl.classList.contains('active')) {
                endGuide(false);
            } else {
                startInteractiveGuide(true);
            }
        });
    }

    createGuideUI();
    collectGuideSteps();
    // Verifica se o guia para ESTA PÁGINA já foi completado
    if (guideStepsData.length > 0 && localStorage.getItem(GUIDE_COMPLETED_KEY_FOR_CURRENT_PAGE) !== 'true') {
        setTimeout(() => startInteractiveGuide(false), 700);
    }
});
