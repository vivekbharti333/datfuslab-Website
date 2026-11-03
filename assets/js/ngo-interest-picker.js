/* Accessible styled list; original select remains the submitted form value. */
(() => {
  const select = document.getElementById('enquiryInterest');
  if (!select) return;
  const field = select.closest('.ngo-demo-interest');
  const button = document.createElement('button');
  const list = document.createElement('div');
  button.type = 'button'; button.className = 'ngo-interest-trigger';
  button.id = 'ngo-interest-trigger';
  button.setAttribute('role', 'combobox');
  button.setAttribute('aria-label', "I'm interested in");
  button.setAttribute('aria-required', 'true');
  button.setAttribute('aria-haspopup', 'listbox');
  button.setAttribute('aria-controls', 'ngo-interest-options');
  button.setAttribute('aria-expanded', 'false');
  list.id = 'ngo-interest-options'; list.className = 'ngo-interest-options';
  list.setAttribute('role', 'listbox'); list.setAttribute('aria-label', 'Choose your interest'); list.hidden = true;
  const options = [...select.options].filter(option => option.value);
  let active = 0;
  const rows = options.map((option, index) => {
    const row = document.createElement('div');
    row.id = 'ngo-interest-option-' + index; row.className = 'ngo-interest-option';
    row.setAttribute('role', 'option'); row.textContent = option.textContent;
    row.addEventListener('pointerdown', event => event.preventDefault());
    row.addEventListener('click', () => choose(index));
    list.append(row); return row;
  });
  function highlight(index) {
    active = (index + rows.length) % rows.length;
    rows.forEach((row, i) => row.classList.toggle('is-active', i === active));
    button.setAttribute('aria-activedescendant', rows[active].id);
    rows[active].scrollIntoView({block:'nearest'});
  }
  function open(show) {
    list.hidden = !show; button.setAttribute('aria-expanded', String(show));
    field.classList.toggle('is-open', show);
    if (show) highlight(Math.max(0, options.findIndex(option => option.value === select.value)));
    else button.removeAttribute('aria-activedescendant');
  }
  function sync() {
    button.textContent = select.value ? select.selectedOptions[0].textContent : 'Select your interest';
    button.classList.toggle('has-value', !!select.value);
    rows.forEach((row,i) => row.setAttribute('aria-selected', String(options[i].value === select.value)));
    if (select.value) button.removeAttribute('aria-invalid');
  }
  function choose(index) {
    select.value = options[index].value;
    select.dispatchEvent(new Event('change', {bubbles:true}));
    sync(); open(false); button.focus();
  }
  button.addEventListener('click', () => open(list.hidden));
  button.addEventListener('keydown', event => {
    if (['ArrowDown','ArrowUp','Home','End','Escape','Enter',' '].includes(event.key)) {
      event.preventDefault();
      if (event.key === 'Escape') { open(false); return; }
      if (event.key === 'Enter' || event.key === ' ') { if (list.hidden) open(true); else choose(active); return; }
      if (list.hidden) open(true);
      else highlight(event.key === 'Home' ? 0 : event.key === 'End' ? rows.length - 1 : active + (event.key === 'ArrowDown' ? 1 : -1));
    } else if (event.key === 'Tab') open(false);
    else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
      const found = options.findIndex(option => option.textContent.toLowerCase().startsWith(event.key.toLowerCase()));
      if (found >= 0) { open(true); highlight(found); }
    }
  });
  document.addEventListener('click', event => { if (!field.contains(event.target)) open(false); });
  field.addEventListener('focusout', event => { if (!field.contains(event.relatedTarget)) open(false); });
  select.addEventListener('change', sync);
  select.addEventListener('invalid', event => { event.preventDefault(); button.setAttribute('aria-invalid','true'); button.focus(); open(true); });
  select.form.addEventListener('reset', () => { queueMicrotask(() => { sync(); open(false); button.removeAttribute('aria-invalid'); }); });
  select.classList.add('ngo-interest-native'); select.tabIndex = -1;
  select.setAttribute('aria-hidden', 'true');
  document.querySelector('label[for="enquiryInterest"]')?.setAttribute('for',button.id);
  field.append(button, list); field.classList.add('is-enhanced'); sync();
})();
