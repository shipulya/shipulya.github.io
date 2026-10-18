/* Live Telegram-bot demo (barbershop booking). Needs #chat, #chatLog, #chatKb, #chatReset. */
(function(){
const $ = id => document.getElementById(id);
if (!$('chat')) return;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const PRICES = {'Стрижка':35,'Борода':20,'Комплекс':50};
const FLOW = {
  start:   {bot:'Здравствуйте! Это бот барбершопа «Лезвие». Чем помочь?', kb:['Записаться','Цены','Адрес']},
  'Цены':  {bot:'Стрижка — 35 BYN\nБорода — 20 BYN\nКомплекс — 50 BYN', kb:['Записаться','Адрес']},
  'Адрес': {bot:'ул. Демонстрационная, 1\nЕжедневно с 10:00 до 21:00', kb:['Записаться','Цены']},
  'Записаться': {bot:'Выберите услугу', kb:['Стрижка','Борода','Комплекс']}
};
const chat = {service:null};
let notifTimer = 0;
function addMsg(text, who){
  const el = document.createElement('div');
  el.className = 'msg ' + who; el.textContent = text;
  $('chatLog').appendChild(el); $('chatLog').scrollTop = $('chatLog').scrollHeight;
}
function setKb(btns){
  $('chatKb').innerHTML = '';
  btns.forEach(b => {
    const bt = document.createElement('button'); bt.type='button'; bt.textContent = b;
    bt.addEventListener('click', () => answer(b)); $('chatKb').appendChild(bt);
  });
}
function botSay(text, kb){
  setKb([]);
  if (reduce){ addMsg(text,'bot'); setKb(kb); return; }
  const t = document.createElement('div'); t.className='typing'; t.innerHTML='<i></i><i></i><i></i>';
  $('chatLog').appendChild(t); $('chatLog').scrollTop = $('chatLog').scrollHeight;
  setTimeout(() => { t.remove(); addMsg(text,'bot'); setKb(kb); }, 600);
}
function notify(service, time){
  document.querySelector('.notif')?.remove();
  const n = document.createElement('div'); n.className='notif';
  n.innerHTML = `<small>● уведомление администратору</small>Новая запись: ${service}, сегодня ${time}`;
  $('chat').appendChild(n);
  clearTimeout(notifTimer); notifTimer = setTimeout(() => n.remove(), 4200);
}
function answer(b){
  addMsg(b,'me');
  if (FLOW[b]) return botSay(FLOW[b].bot, FLOW[b].kb);
  if (PRICES[b]){ chat.service = b; return botSay(`${b}, ${PRICES[b]} BYN.\nСвободно сегодня:`, ['15:00','17:30','19:00']); }
  if (/^\d{2}:\d{2}$/.test(b)){
    botSay(`Готово ✓ Вы записаны:\n${chat.service}, сегодня в ${b}.\nНапомню за 2 часа до визита.`, ['Начать заново']);
    setTimeout(() => notify(chat.service, b), reduce ? 0 : 900);
    return;
  }
  if (b === 'Начать заново') resetChat();
}
function resetChat(){
  $('chatLog').innerHTML=''; document.querySelector('.notif')?.remove();
  addMsg(FLOW.start.bot,'bot'); setKb(FLOW.start.kb);
}
$('chatReset').addEventListener('click', resetChat);
resetChat();
})();
