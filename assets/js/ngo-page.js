
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
    const controls = document.getElementById('billing-controls');
    const note = document.getElementById('billing-note');
    const plans = [
        { selector: '.plan-card--professional', annual: 10000, monthly: 999, column: 2, name: 'Pro' },
        { selector: '.plan-card--premium', annual: 30000, monthly: 2800, column: 3, name: 'Premium' }
    ];
    const format = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });
    controls.hidden = false;
    controls.querySelectorAll('button').forEach(function (button) {
        button.addEventListener('click', function () {
            const monthly = button.dataset.billing === 'monthly';
            controls.querySelectorAll('button').forEach(function (option) {
                option.setAttribute('aria-pressed', String(option === button));
            });
            plans.forEach(function (plan) {
                const card = pricing.querySelector(plan.selector);
                const amount = '₹' + format.format(monthly ? plan.monthly : plan.annual);
                card.querySelector('.price-amount').textContent = amount;
                card.querySelector('.price-period').textContent = monthly ? '/ month' : '/ year';
            });
            note.textContent = monthly
                ? 'Billed monthly. Free and Enterprise plans stay the same.'
                : 'Annual pricing. Free and Enterprise plans stay the same.';
        });
    });
})();
