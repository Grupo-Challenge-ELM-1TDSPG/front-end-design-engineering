// Script para interação do FAQ (perguntas frequentes) do SimplesHC

document.addEventListener('DOMContentLoaded', function () {
    // Seleciona todos os itens do FAQ
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const questionButton = item.querySelector('.faq-question');
        const answerDiv = item.querySelector('.faq-answer');

        if (questionButton && answerDiv) {
            // Adiciona evento de clique para expandir/recolher a resposta
            questionButton.addEventListener('click', () => {
                const isExpanded = questionButton.getAttribute('aria-expanded') === 'true';
                questionButton.setAttribute('aria-expanded', !isExpanded);
                
                if (!isExpanded) {
                    // Expande a resposta com animação de altura
                    answerDiv.style.maxHeight = answerDiv.scrollHeight + "px";
                } else {
                    // Recolhe a resposta
                    answerDiv.style.maxHeight = null;
                }
            });
        }
    });
});