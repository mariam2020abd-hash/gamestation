(() => {
  const dialog = document.getElementById('auth-dialog');
  const form = document.getElementById('auth-form');
  const opener = document.querySelector('.auth-open');
  const status = document.getElementById('auth-status');
  const fields = ['name', 'email', 'password', 'confirm'].map(name => document.getElementById(`auth-${name}`));
  const [name, email, password, confirm] = fields;
  let signup = false;

  function clearError(field) {
    field.removeAttribute('aria-invalid');
    document.getElementById(`${field.id}-error`).textContent = '';
  }

  function reset() {
    form.reset();
    fields.forEach(clearError);
    status.textContent = '';
    dialog.querySelectorAll('[data-password]').forEach(button => {
      document.getElementById(button.dataset.password).type = 'password';
      button.textContent = 'إظهار';
      button.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-label', `إظهار ${button.dataset.password === 'auth-confirm' ? 'تأكيد كلمة المرور' : 'كلمة المرور'}`);
    });
  }

  function setMode(isSignup) {
    signup = isSignup;
    reset();
    [name, confirm].forEach(field => {
      field.disabled = !signup;
      field.required = signup;
      field.closest('.auth-field').hidden = !signup;
    });
    if (signup) password.minLength = 8;
    else password.removeAttribute('minlength');
    document.getElementById('auth-password-hint').hidden = !signup;
    document.getElementById('auth-title').textContent = signup ? 'إنشاء حساب' : 'تسجيل الدخول';
    document.getElementById('auth-description').textContent = signup
      ? 'مساحة صغيرة لك، ومتعة كثيرة تنتظرك.'
      : 'أهلًا بعودتك! خذ استراحة واستمتع بألعابك.';
    form.querySelector('.auth-submit').textContent = signup ? 'إنشاء حساب' : 'تسجيل الدخول';
    document.getElementById('auth-switch-prompt').textContent = signup ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟';
    dialog.querySelector('.auth-switch').textContent = signup ? 'تسجيل الدخول' : 'إنشاء حساب';
    dialog.scrollTop = 0;
    if (dialog.open) (signup ? name : email).focus();
  }

  opener.hidden = false;
  opener.addEventListener('click', () => {
    setMode(false);
    dialog.showModal();
    email.focus();
  });
  dialog.querySelector('.auth-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll('button, input:not(:disabled)')]
      .filter(control => control.getClientRects().length > 0);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  dialog.addEventListener('close', () => {
    reset();
    opener.focus();
  });
  dialog.querySelector('.auth-switch').addEventListener('click', () => setMode(!signup));
  dialog.querySelectorAll('[data-password]').forEach(button => {
    button.addEventListener('click', () => {
      const field = document.getElementById(button.dataset.password);
      const visible = field.type === 'password';
      field.type = visible ? 'text' : 'password';
      button.textContent = visible ? 'إخفاء' : 'إظهار';
      button.setAttribute('aria-pressed', String(visible));
      button.setAttribute('aria-label', `${visible ? 'إخفاء' : 'إظهار'} ${field === confirm ? 'تأكيد كلمة المرور' : 'كلمة المرور'}`);
    });
  });
  fields.forEach(field => field.addEventListener('input', () => {
    clearError(field);
    if (field === password) clearError(confirm);
    status.textContent = '';
  }));
  form.addEventListener('submit', event => {
    event.preventDefault();
    fields.forEach(clearError);
    const errors = [];
    function error(field, message) {
      field.setAttribute('aria-invalid', 'true');
      document.getElementById(`${field.id}-error`).textContent = message;
      errors.push(field);
    }
    if (signup && !name.value.trim()) error(name, 'أدخل اسم المستخدم.');
    if (!email.value.trim()) error(email, 'أدخل البريد الإلكتروني.');
    else if (email.validity.typeMismatch) error(email, 'أدخل بريدًا إلكترونيًا صالحًا.');
    if (!password.value) error(password, 'أدخل كلمة المرور.');
    else if (signup && password.value.length < 8) error(password, 'يجب أن تتكوّن كلمة المرور من ٨ أحرف على الأقل.');
    if (signup && !confirm.value) error(confirm, 'أكّد كلمة المرور.');
    else if (signup && confirm.value !== password.value) error(confirm, 'كلمتا المرور غير متطابقتين.');
    if (errors.length) {
      status.textContent = 'راجع الحقول المحددة وأكمل البيانات المطلوبة.';
      errors[0].focus();
      return;
    }
    status.textContent = signup
      ? 'هذه واجهة تجريبية. إنشاء الحسابات غير متاح بعد، ولم يتم إنشاء حساب أو حفظ بياناتك.'
      : 'هذه واجهة تجريبية. تسجيل الدخول غير متاح بعد، ولم يتم تسجيل دخولك أو حفظ بياناتك.';
  });
})();
