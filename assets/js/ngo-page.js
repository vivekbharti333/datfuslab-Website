
document.querySelectorAll(".donexia-faq-item").forEach(function (item) {
    item.addEventListener("toggle", function () {
        if (!item.open) return;
        document.querySelectorAll(".donexia-faq-item").forEach(function (otherItem) {
            if (otherItem !== item) otherItem.removeAttribute("open");
        });
    });
});


(function () {
    const pricing = document.getElementById('pricing');
    const cards = Array.from(pricing.querySelectorAll('.plan-card'));
    function selectPlan(selected) {
        cards.forEach(function (card) {
            const active = card === selected;
            card.classList.toggle('is-selected', active);
            card.querySelector('.plan-choice').checked = active;
        });
    }
    cards.forEach(function (card) {
        const choice = document.createElement('input');
        choice.type = 'radio';
        choice.name = 'pricing-plan';
        choice.className = 'plan-choice';
        choice.value = card.querySelector('.plan-title').textContent;
        choice.setAttribute('aria-label', 'Select ' + choice.value + ' plan');
        choice.checked = card.classList.contains('is-selected');
        card.querySelector('.plan-card-top').appendChild(choice);
        choice.addEventListener('change', function () { selectPlan(card); });
        card.addEventListener('click', function (event) {
            selectPlan(card);
            if (!event.target.closest('a, input')) choice.focus();
        });
    });
    // Paid plans use annual billing; monthly equivalents are in the cards.
})();
