/* Project cost calculator on the home page. Needs #plats, #included, #modsList, #estSum, #estDays, #estList, #copyCalc, #copied. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  if (!$('plats')) return;

  var PLATFORMS = [
    {id:'landing', name:'Лендинг',          sub:'1 страница, до 6 блоков', price:290,  days:5,  kind:'site'},
    {id:'card',    name:'Сайт-визитка',     sub:'до 4 страниц',            price:450,  days:7,  kind:'site'},
    {id:'multi',   name:'Сайт для бизнеса', sub:'многостраничный',         price:700,  days:12, kind:'site'},
    {id:'shop',    name:'Интернет-магазин', sub:'каталог и корзина',       price:1500, days:20, kind:'site'},
    {id:'bot',     name:'Telegram-бот',     sub:'меню, ответы, заявки',    price:150,  days:4,  kind:'bot'}
  ];
  var INCLUDED = {
    site:['Адаптив под телефон','Заявки в Telegram','Кнопки мессенджеров','Базовое SEO','Яндекс Метрика','Подключение домена','2 круга правок'],
    bot:['Меню и кнопки','Ответы на частые вопросы','Заявки вам в личку','Запуск на сервере','2 круга правок']
  };
  var MODULES = [
    {id:'texts',   name:'Тексты под ключ',             price:80,  days:2, for:['site']},
    {id:'quiz',    name:'Квиз или калькулятор',         price:80,  days:2, for:['site']},
    {id:'booking', name:'Онлайн-запись по слотам',      price:120, days:3, for:['site','bot']},
    {id:'catalog', name:'Каталог с фильтрами',          price:150, days:3, for:['site'], not:['shop']},
    {id:'lang',    name:'Вторая языковая версия',       price:150, days:3, for:['site']},
    {id:'pay',     name:'Онлайн-оплата',                price:200, days:3, for:['site','bot']},
    {id:'sheets',  name:'Заявки в Google Таблицу',      price:60,  days:1, for:['site','bot']},
    {id:'crm',     name:'Интеграция с CRM',             price:150, days:3, for:['site','bot']},
    {id:'admin',   name:'Админ-панель',                 price:150, days:3, for:['bot']},
    {id:'mailing', name:'Рассылки по базе клиентов',    price:80,  days:2, for:['bot']},
    {id:'ads',     name:'Запуск рекламы Яндекс или Google', price:200, days:3, for:['site']},
    {id:'ai',      name:'ИИ-консультант*',              price:300, days:4, for:['site','bot']},
    {id:'support', name:'Поддержка 3 месяца',           price:150, days:0, for:['site','bot']}
  ];

  var fmt = function (n) { return n.toLocaleString('ru-RU').replace(/\s/g, '\u00A0'); };
  var platform = 'landing';
  var picked = new Set(['texts', 'sheets']);
  var tick = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  function renderPlats() {
    $('plats').innerHTML = PLATFORMS.map(function (p) {
      return '<div class="opt plat"><input type="radio" name="plat" id="plat-' + p.id + '" value="' + p.id + '"' + (p.id === platform ? ' checked' : '') + '>' +
        '<label for="plat-' + p.id + '"><span class="nm">' + p.name + '</span><span class="sub2">' + p.sub + '</span><span class="pr">от ' + fmt(p.price) + ' BYN</span></label></div>';
    }).join('');
    $('plats').querySelectorAll('input').forEach(function (i) {
      i.addEventListener('change', function (e) { platform = e.target.value; renderMods(); update(); });
    });
  }
  function current() { return PLATFORMS.find(function (x) { return x.id === platform; }); }
  function available() {
    var p = current();
    return MODULES.filter(function (m) { return m.for.indexOf(p.kind) > -1 && (m.not || []).indexOf(platform) < 0; });
  }
  function renderMods() {
    var av = available();
    Array.from(picked).forEach(function (id) { if (!av.some(function (m) { return m.id === id; })) picked.delete(id); });
    $('modsList').innerHTML = av.map(function (m) {
      return '<div class="opt mod"><input type="checkbox" id="mod-' + m.id + '" value="' + m.id + '"' + (picked.has(m.id) ? ' checked' : '') + '>' +
        '<label for="mod-' + m.id + '"><span class="box">' + tick + '</span><span class="nm">' + m.name + '</span><span class="pr">+' + fmt(m.price) + '</span></label></div>';
    }).join('');
    $('modsList').querySelectorAll('input').forEach(function (i) {
      i.addEventListener('change', function (e) { e.target.checked ? picked.add(e.target.value) : picked.delete(e.target.value); update(); });
    });
    $('included').innerHTML = INCLUDED[current().kind].map(function (t) { return '<span>' + t + '</span>'; }).join('');
  }
  function totals() {
    var p = current();
    var mods = MODULES.filter(function (m) { return picked.has(m.id); });
    var sum = p.price + mods.reduce(function (a, m) { return a + m.price; }, 0);
    var days = p.days + Math.ceil(mods.reduce(function (a, m) { return a + m.days; }, 0) * 0.7);
    return { p: p, mods: mods, sum: sum, days: days };
  }
  function plural(n, a, b, c) { var m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? b : c); }
  function update() {
    var t = totals();
    $('estSum').innerHTML = '<small>от</small>' + fmt(t.sum) + '<em>BYN</em>';
    $('estDays').textContent = 'примерно ' + t.days + ' ' + plural(t.days, 'рабочий день', 'рабочих дня', 'рабочих дней');
    $('estList').innerHTML = ['<li><span>' + t.p.name + '</span><span>' + fmt(t.p.price) + '</span></li>']
      .concat(t.mods.map(function (m) { return '<li><span>' + m.name + '</span><span>+' + fmt(m.price) + '</span></li>'; })).join('') +
      (picked.has('ai') ? '<li><span style="font-size:13px;color:var(--on-pine-muted)">* оплата ИИ-сервиса отдельно, по его тарифу</span><span></span></li>' : '');
    $('copied').textContent = '';
  }
  function fallbackCopy(text, ok) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    var done = false; try { done = document.execCommand('copy'); } catch (e) {}
    ta.remove();
    if (done) ok(); else $('copied').textContent = 'Не получилось скопировать. Перечислите выбранное в сообщении';
  }
  $('copyCalc').addEventListener('click', function () {
    var t = totals();
    var text = 'Здравствуйте! Посчитал проект на вашем сайте:\n• ' + t.p.name + ' — от ' + t.p.price + ' BYN\n' +
      t.mods.map(function (m) { return '• ' + m.name.replace('*', '') + ' — +' + m.price + ' BYN'; }).join('\n') +
      (t.mods.length ? '\n' : '') + 'Итого: от ' + t.sum + ' BYN, срок примерно ' + t.days + ' раб. дн.\nМоя задача: ';
    var ok = function () { $('copied').textContent = 'Расчёт скопирован. Вставьте его в сообщение'; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok).catch(function () { fallbackCopy(text, ok); });
    else fallbackCopy(text, ok);
  });
  renderPlats(); renderMods(); update();
})();
