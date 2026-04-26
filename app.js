const STORAGE_KEY = 'imakore-life-v1';

const seedActions = [
  { title: '机を10秒だけ拭く', type: '整える', minutes: 1, energy: 'low', tags: ['だるい', '机にいる', 'スマホ触りたい'], source: '生活' },
  { title: 'コップを流しに持っていく', type: '整える', minutes: 1, energy: 'low', tags: ['だるい', '夜', 'スマホ触りたい'], source: '家事' },
  { title: '皿を1枚だけ洗う', type: '整える', minutes: 3, energy: 'low', tags: ['家', '夜', 'だるい'], source: '家事' },
  { title: '床のものを3個だけ拾う', type: '整える', minutes: 3, energy: 'low', tags: ['家', 'だるい'], source: '片付け' },
  { title: 'スマホを玄関かポスト近くに置く', type: '減らす', minutes: 1, energy: 'low', tags: ['スマホ触りたい', 'デトックス', '夜'], source: 'デジタルデトックス' },
  { title: 'YouTubeを閉じて、PCでこのアプリを開く', type: '減らす', minutes: 1, energy: 'low', tags: ['スマホ触りたい', 'デトックス'], source: 'デジタルデトックス' },
  { title: 'スマホなし散歩用の音楽候補を1つメモする', type: '減らす', minutes: 5, energy: 'mid', tags: ['デトックス', '外出前'], source: 'デジタルデトックス' },
  { title: '今日の気分を1行だけ残す', type: '残す', minutes: 1, energy: 'low', tags: ['だるい', '夜', '朝'], source: 'ログ' },
  { title: '美容ログを1件だけ入力する', type: '残す', minutes: 5, energy: 'mid', tags: ['美容', '夜'], source: '美容' },
  { title: '前回の美容施術日を1つ確認する', type: '整える', minutes: 5, energy: 'mid', tags: ['美容', 'だるい'], source: '美容' },
  { title: '買うものを1個だけ追加する', type: '残す', minutes: 1, energy: 'low', tags: ['買い物', '外出前', 'だるい'], source: '買う' },
  { title: '底値メモを1つだけ書く', type: '残す', minutes: 3, energy: 'mid', tags: ['買い物', 'お金'], source: '買う' },
  { title: '英単語を1個だけ見る', type: '進める', minutes: 1, energy: 'low', tags: ['英語', 'TOEIC', 'だるい'], source: '英語' },
  { title: 'TOEIC Part 5を1問だけ解く', type: '進める', minutes: 3, energy: 'mid', tags: ['英語', 'TOEIC', '机にいる'], source: '英語' },
  { title: 'AI画像制作の参考を1枚だけ保存する', type: '進める', minutes: 5, energy: 'mid', tags: ['AI制作', 'クリエイティブ'], source: 'AI制作' },
  { title: '画像生成で作りたい雰囲気を3語だけ書く', type: '進める', minutes: 3, energy: 'low', tags: ['AI制作', 'だるい'], source: 'AI制作' },
  { title: 'Scotland旅行の持ち物を1つだけ書く', type: '進める', minutes: 3, energy: 'low', tags: ['旅行', 'だるい'], source: '旅行' },
  { title: '旅行予算で気になる金額を1つメモする', type: '残す', minutes: 5, energy: 'mid', tags: ['旅行', 'お金'], source: '旅行' },
  { title: 'スクワットを5回だけする', type: '整える', minutes: 1, energy: 'mid', tags: ['運動', '朝', 'だるい'], source: '体' },
  { title: '水を飲む', type: '整える', minutes: 1, energy: 'low', tags: ['朝', 'だるい', 'スマホ触りたい'], source: '体' },
  { title: '支出メモを1つだけ残す', type: '残す', minutes: 3, energy: 'low', tags: ['お金', '夜'], source: 'お金' },
  { title: '副業アイデアを1行だけ書く', type: '進める', minutes: 3, energy: 'low', tags: ['副業', '自由な働き方'], source: '仕事' },
  { title: 'ChatGPTに聞きたいことを1行だけ書く', type: '残す', minutes: 1, energy: 'low', tags: ['だるい', '机にいる'], source: 'メモ' },
  { title: 'カーテンを開ける／閉める', type: '整える', minutes: 1, energy: 'low', tags: ['朝', '夜', 'だるい'], source: '生活' },
];

const modes = ['だるい', 'スマホ触りたい', '朝', '夜', '机にいる', '外出前', '美容', '旅行', '英語', 'AI制作', 'お金'];

const defaultState = {
  actions: seedActions,
  activeMode: 'スマホ触りたい',
  maxMinutes: 5,
  current: null,
  materials: [
    '自由な働き方に近づきたい',
    'AI画像・動画制作を少しずつ進めたい',
    'Scotland旅行準備を気楽に進めたい',
    'デジタルデトックスしたい',
    '美容ログを残して、施術の効果を比較したい',
    'TOEIC・英語を重くならない形で続けたい',
  ],
  buy: [],
  care: [],
  done: []
};

let state = loadState();

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(defaultState);
  try {
    const parsed = JSON.parse(saved);
    return { ...structuredClone(defaultState), ...parsed, actions: parsed.actions?.length ? parsed.actions : seedActions };
  } catch {
    return structuredClone(defaultState);
  }
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function $(id) { return document.getElementById(id); }
function todayLabel() { return new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
function toast(message) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 250); }, 1600);
}

function scoreAction(action) {
  let score = 0;
  if (action.minutes <= state.maxMinutes) score += 10; else score -= (action.minutes - state.maxMinutes) * 2;
  if (action.tags.includes(state.activeMode)) score += 8;
  if (state.activeMode === 'だるい' && action.energy === 'low') score += 4;
  if (state.activeMode === 'スマホ触りたい' && ['減らす', '整える'].includes(action.type)) score += 4;
  if (state.activeMode === '朝' && action.tags.includes('朝')) score += 3;
  if (state.activeMode === '夜' && action.tags.includes('夜')) score += 3;
  score += Math.random() * 3;
  return score;
}
function candidates() {
  return [...state.actions].sort((a,b) => scoreAction(b) - scoreAction(a));
}
function pickSuggestion(lighter = false) {
  const list = candidates().filter(a => lighter ? a.minutes <= Math.min(3, state.maxMinutes) : true);
  state.current = list[0] || state.actions[0];
  saveState();
  renderNow();
}

function renderNow() {
  if (!state.current) state.current = candidates()[0] || state.actions[0];
  $('suggestionTitle').textContent = state.current.title;
  $('suggestionMeta').textContent = `${state.current.type}・${state.current.minutes}分・${state.current.source}`;
  renderModes();
  renderQuickList();
}
function renderModes() {
  $('modeChips').innerHTML = modes.map(mode => `<button type="button" class="chip ${state.activeMode === mode ? 'active' : ''}" data-mode="${mode}">${mode}</button>`).join('');
  document.querySelectorAll('[data-mode]').forEach(btn => btn.addEventListener('click', () => {
    state.activeMode = btn.dataset.mode;
    pickSuggestion();
  }));
}
function renderQuickList() {
  const list = candidates().slice(0, 5);
  $('quickList').innerHTML = list.map((a, index) => `
    <div class="item">
      <div class="item-title">${escapeHtml(a.title)}</div>
      <div class="item-meta">${a.type}・${a.minutes}分・${a.source}</div>
      <div class="item-actions">
        <button class="secondary small" data-do-index="${index}" type="button">できた</button>
        <button class="ghost small" data-use-index="${index}" type="button">これにする</button>
      </div>
    </div>`).join('');
  document.querySelectorAll('[data-use-index]').forEach(btn => btn.addEventListener('click', () => {
    state.current = list[Number(btn.dataset.useIndex)];
    saveState(); renderNow();
  }));
  document.querySelectorAll('[data-do-index]').forEach(btn => btn.addEventListener('click', () => completeAction(list[Number(btn.dataset.doIndex)])));
}
function completeAction(action = state.current) {
  state.done.unshift({ ...action, at: todayLabel() });
  state.done = state.done.slice(0, 80);
  saveState();
  toast('記録しました。小さくても進んでいます。');
  pickSuggestion();
  renderAll();
}
function renderMaterials() {
  $('materialsList').innerHTML = state.materials.length ? state.materials.map((m, i) => `
    <div class="item">
      <div class="item-title">${escapeHtml(m)}</div>
      <div class="item-actions">
        <button class="secondary small" data-step="${i}" type="button">小さい行動にする</button>
        <button class="ghost small" data-delete-material="${i}" type="button">削除</button>
      </div>
    </div>`).join('') : '<p class="muted">まだ材料がありません。</p>';
  document.querySelectorAll('[data-delete-material]').forEach(btn => btn.addEventListener('click', () => { state.materials.splice(Number(btn.dataset.deleteMaterial), 1); saveState(); renderMaterials(); updatePrompt(); }));
  document.querySelectorAll('[data-step]').forEach(btn => btn.addEventListener('click', () => {
    addGeneratedActions(state.materials[Number(btn.dataset.step)]);
    toast('行動候補に追加しました');
    renderAll();
  }));
  updatePrompt();
}
function addGeneratedActions(text) {
  const t = text.trim();
  if (!t) return;
  const generated = [
    { title: `${t}について1行だけメモする`, type: '残す', minutes: 1, energy: 'low', tags: ['だるい', '机にいる'], source: '材料' },
    { title: `${t}の次の一手を3つ書く`, type: '進める', minutes: 5, energy: 'mid', tags: ['机にいる'], source: '材料' },
    { title: `${t}を15分だけ進める`, type: '進める', minutes: 15, energy: 'mid', tags: ['机にいる'], source: '材料' },
  ];
  state.actions.unshift(...generated);
  saveState();
}
function updatePrompt() {
  $('promptBox').value = `以下は私の生活アプリに入っている材料です。これを「今この瞬間にできる一番小さい行動」に分けてください。完璧な予定表ではなく、1分・5分・15分・30分の行動候補にしてください。種類は「進める」「整える」「減らす」「残す」に分けて、だるい時にもできる候補を優先してください。\n\n${state.materials.map((m, i) => `${i + 1}. ${m}`).join('\n')}`;
}
function renderBuy() {
  $('buyList').innerHTML = state.buy.length ? state.buy.map((b, i) => `
    <div class="item"><div class="item-title">${escapeHtml(b.name)}</div><div class="item-meta">${escapeHtml(b.place || '場所未設定')}・${escapeHtml(b.price || '値段未設定')}</div><button class="ghost small" data-delete-buy="${i}" type="button">削除</button></div>`).join('') : '<p class="muted">買うものはまだありません。</p>';
  document.querySelectorAll('[data-delete-buy]').forEach(btn => btn.addEventListener('click', () => { state.buy.splice(Number(btn.dataset.deleteBuy), 1); saveState(); renderBuy(); }));
}
function renderCare() {
  $('careList').innerHTML = state.care.length ? state.care.map((c, i) => `
    <div class="item"><div class="item-title">${escapeHtml(c.name)}</div><div class="item-meta">${escapeHtml(c.date || '日付未設定')}・${escapeHtml(c.category || 'カテゴリ未設定')}・${escapeHtml(c.memo || '')}</div><button class="ghost small" data-delete-care="${i}" type="button">削除</button></div>`).join('') : '<p class="muted">美容・メンテ記録はまだありません。</p>';
  document.querySelectorAll('[data-delete-care]').forEach(btn => btn.addEventListener('click', () => { state.care.splice(Number(btn.dataset.deleteCare), 1); saveState(); renderCare(); }));
}
function renderDone() {
  $('doneList').innerHTML = state.done.length ? state.done.map(d => `
    <div class="item"><div class="item-title">${escapeHtml(d.title)}</div><div class="item-meta">${escapeHtml(d.at)}・${d.type}・${d.minutes}分</div></div>`).join('') : '<p class="muted">まだ記録はありません。小さい行動ができたら「できた」を押してください。</p>';
}
function renderAll() { renderNow(); renderMaterials(); renderBuy(); renderCare(); renderDone(); }
function escapeHtml(str) { return String(str).replace(/[&<>'"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[s])); }

function bindEvents() {
  document.querySelectorAll('.nav').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.nav').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    $(`tab-${btn.dataset.tab}`).classList.add('active');
  }));
  document.querySelectorAll('[data-time]').forEach(btn => btn.addEventListener('click', () => { state.maxMinutes = Number(btn.dataset.time); pickSuggestion(); toast(`${state.maxMinutes}分以内で探します`); }));
  $('doneBtn').addEventListener('click', () => completeAction());
  $('nextBtn').addEventListener('click', () => pickSuggestion());
  $('lighterBtn').addEventListener('click', () => pickSuggestion(true));
  $('shuffleListBtn').addEventListener('click', () => { pickSuggestion(); renderQuickList(); });
  $('saveDumpBtn').addEventListener('click', () => {
    const text = $('brainDump').value.trim();
    if (!text) return;
    const lines = text.split(/\n|。|、/).map(x => x.trim()).filter(Boolean);
    state.materials.unshift(...lines);
    $('brainDump').value = '';
    saveState(); renderMaterials(); toast('材料に保存しました');
  });
  $('makeStepsBtn').addEventListener('click', () => {
    const text = $('brainDump').value.trim();
    if (!text) return;
    const lines = text.split(/\n|。/).map(x => x.trim()).filter(Boolean);
    lines.forEach(addGeneratedActions);
    toast('行動候補を作りました');
    renderAll();
  });
  $('clearMaterialsBtn').addEventListener('click', () => { state.materials = []; saveState(); renderMaterials(); });
  $('copyPromptBtn').addEventListener('click', async () => { await navigator.clipboard.writeText($('promptBox').value); toast('コピーしました'); });
  $('addBuyBtn').addEventListener('click', () => {
    const name = $('buyName').value.trim(); if (!name) return;
    state.buy.unshift({ name, place: $('buyPlace').value.trim(), price: $('buyPrice').value.trim() });
    ['buyName','buyPlace','buyPrice'].forEach(id => $(id).value = ''); saveState(); renderBuy(); toast('追加しました');
  });
  $('addCareBtn').addEventListener('click', () => {
    const name = $('careName').value.trim(); if (!name) return;
    state.care.unshift({ name, category: $('careCategory').value.trim(), date: $('careDate').value, memo: $('careMemo').value.trim() });
    ['careName','careCategory','careDate','careMemo'].forEach(id => $(id).value = ''); saveState(); renderCare(); toast('記録しました');
  });
  $('resetBtn').addEventListener('click', () => {
    if (!confirm('保存データを初期化しますか？')) return;
    localStorage.removeItem(STORAGE_KEY); state = structuredClone(defaultState); renderAll(); toast('初期化しました');
  });
}

bindEvents();
renderAll();
