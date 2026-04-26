const KEY = "seikatsu-app-v1";
const todayISO = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const defaultData = {
  buy: [
    { id: uid(), item: "トイレットペーパー", place: "ドラッグストア", status: "そろそろ", price: "", bestPrice: "" },
    { id: uid(), item: "バナナ", place: "スーパー", status: "ついでに買う", price: "", bestPrice: "" }
  ],
  care: [],
  reduce: [
    { id: uid(), method: "スマホを集合ポストに2時間置く", situation: "休日", score: "5", note: "家の中で隠すより効果が高い" }
  ],
  memo: [
    { id: uid(), body: "美容ログを整理したい\n英語の勉強を再開したい\n部屋を片付けたい", createdAt: todayISO() }
  ]
};

let state = load();

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || structuredClone(defaultData);
  } catch {
    return structuredClone(defaultData);
  }
}
function save() { localStorage.setItem(KEY, JSON.stringify(state)); }
function yen(v) { return v ? `${Number(v).toLocaleString()}円` : ""; }
function daysBetween(a, b) {
  const one = new Date(a); const two = new Date(b);
  return Math.ceil((two - one) / (1000 * 60 * 60 * 24));
}
function addDays(date, days) {
  const d = new Date(date); d.setDate(d.getDate() + Number(days));
  return d.toISOString().slice(0, 10);
}

function switchTab(name) {
  document.querySelectorAll(".tab").forEach(btn => btn.classList.toggle("active", btn.dataset.tab === name));
  document.querySelectorAll(".panel").forEach(panel => panel.classList.toggle("active", panel.id === name));
}

document.querySelectorAll(".tab").forEach(btn => btn.addEventListener("click", () => switchTab(btn.dataset.tab)));

document.getElementById("resetDemo").addEventListener("click", () => {
  if (!confirm("保存データを初期化しますか？")) return;
  localStorage.removeItem(KEY);
  state = structuredClone(defaultData);
  renderAll();
});

function bindForm(id, handler) {
  document.getElementById(id).addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    handler(data);
    e.currentTarget.reset();
    const dateInput = e.currentTarget.querySelector('input[type="date"]');
    if (dateInput) dateInput.value = todayISO();
    save(); renderAll();
  });
}

bindForm("buyForm", data => state.buy.unshift({ id: uid(), ...data }));
bindForm("careForm", data => state.care.unshift({ id: uid(), ...data }));
bindForm("reduceForm", data => state.reduce.unshift({ id: uid(), ...data }));
bindForm("memoForm", data => state.memo.unshift({ id: uid(), body: data.body, createdAt: todayISO() }));

document.querySelector('#careForm input[name="date"]').value = todayISO();

function removeItem(type, id) {
  state[type] = state[type].filter(x => x.id !== id);
  save(); renderAll();
}
function completeBuy(id) {
  const item = state.buy.find(x => x.id === id);
  if (item) item.status = "在庫OK";
  save(); renderAll();
}

function makeCard(type, id, html, doneLabel = "完了") {
  const template = document.getElementById("itemTemplate").content.cloneNode(true);
  template.querySelector(".item-main").innerHTML = html;
  const done = template.querySelector(".done-btn");
  done.textContent = doneLabel;
  done.addEventListener("click", () => type === "buy" ? completeBuy(id) : removeItem(type, id));
  template.querySelector(".delete-btn").addEventListener("click", () => removeItem(type, id));
  return template;
}

function renderBuy() {
  const root = document.getElementById("buyList"); root.innerHTML = "";
  if (!state.buy.length) root.innerHTML = `<div class="empty-state">買うものはまだありません。</div>`;
  state.buy.forEach(x => {
    root.appendChild(makeCard("buy", x.id, `
      <strong>${escapeHTML(x.item)}</strong>
      <div class="meta">${escapeHTML(x.place || "場所未定")}</div>
      <span class="badge">${escapeHTML(x.status)}</span>
      ${x.price ? `<span class="badge">値段 ${yen(x.price)}</span>` : ""}
      ${x.bestPrice ? `<span class="badge">底値 ${yen(x.bestPrice)}</span>` : ""}
    `, "在庫OK"));
  });
}
function renderCare() {
  const root = document.getElementById("careList"); root.innerHTML = "";
  if (!state.care.length) root.innerHTML = `<div class="empty-state">美容・メンテ記録はまだありません。</div>`;
  state.care
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .forEach(x => {
      const next = x.nextDays ? addDays(x.date, x.nextDays) : "";
      root.appendChild(makeCard("care", x.id, `
        <strong>${escapeHTML(x.title)}</strong>
        <div class="meta">${escapeHTML(x.date)}｜${escapeHTML(x.category)}｜${escapeHTML(x.shop || "店舗未入力")}</div>
        ${x.cost ? `<span class="badge">${yen(x.cost)}</span>` : ""}
        ${next ? `<span class="badge">次回目安 ${next}</span>` : ""}
        ${x.note ? `<p class="meta">${escapeHTML(x.note)}</p>` : ""}
      `, "閉じる"));
    });
}
function renderReduce() {
  const root = document.getElementById("reduceList"); root.innerHTML = "";
  if (!state.reduce.length) root.innerHTML = `<div class="empty-state">デジタルデトックス記録はまだありません。</div>`;
  state.reduce.forEach(x => {
    root.appendChild(makeCard("reduce", x.id, `
      <strong>${escapeHTML(x.method)}</strong>
      <div class="meta">${escapeHTML(x.situation)}｜効果 ${escapeHTML(x.score)}/5</div>
      ${x.note ? `<p class="meta">${escapeHTML(x.note)}</p>` : ""}
    `, "閉じる"));
  });
}
function renderMemo() {
  const root = document.getElementById("memoList"); root.innerHTML = "";
  if (!state.memo.length) root.innerHTML = `<div class="empty-state">メモはまだありません。</div>`;
  state.memo.forEach(x => {
    root.appendChild(makeCard("memo", x.id, `
      <strong>${escapeHTML(x.createdAt)}</strong>
      <p class="meta">${escapeHTML(x.body).replace(/\n/g, "<br>")}</p>
    `, "処理済み"));
  });
}

function getAllMemoText() {
  return state.memo.map(x => x.body).join("\n");
}

function splitWants(text) {
  return text
    .split(/[\n。.!！?？、,・]+/)
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 24);
}

function categorize(text) {
  const t = text.toLowerCase();
  if (/美容|髪|ヘア|カラー|脱毛|ボトックス|サーマ|肌|爪|ネイル/.test(t)) return "整える";
  if (/買|購入|amazon|楽天|スーパー|洗剤|日用品|食材/.test(t)) return "買う";
  if (/スマホ|youtube|sns|インスタ|デトックス|ショート|だらだら/.test(t)) return "減らす";
  if (/旅行|英語|勉強|仕事|副業|アプリ|片付け|部屋/.test(t)) return "進める";
  return "生活";
}

function candidateFor(want, minutes) {
  const cat = categorize(want);
  const safeWant = want.replace(/^したい/, "");
  if (minutes <= 5) {
    return {
      title: `${cat}：まず1行だけ書く`,
      body: `「${safeWant}」について、今わかっていること・次に迷っていることを1行だけメモする。`
    };
  }
  if (minutes <= 15) {
    return {
      title: `${cat}：小さな手順を3つに分ける`,
      body: `「${safeWant}」を、準備・確認・実行の3ステップに分ける。今日やるのは一番軽い1つだけ。`
    };
  }
  if (minutes <= 30) {
    return {
      title: `${cat}：1ステップだけ実行する`,
      body: `「${safeWant}」のために、検索・予約確認・比較・片付けなど、完了が見える作業を1つだけ進める。`
    };
  }
  return {
    title: `${cat}：まとまった作業にする`,
    body: `「${safeWant}」を30分作業＋10分整理＋5分次回メモに分けて進める。終わったら次の一手を1つ残す。`
  };
}

function buildActionCandidates(minutes = 15) {
  const wants = splitWants(getAllMemoText());
  if (!wants.length) return [];
  return wants.slice(0, 8).map(w => candidateFor(w, minutes));
}

function renderActionCandidates(minutes = 15, target = "actionCandidates") {
  const root = document.getElementById(target);
  const candidates = buildActionCandidates(minutes);
  if (!candidates.length) {
    root.innerHTML = `<div class="empty-state">まず「メモ」にやりたいことを書いてください。</div>`;
    return;
  }
  root.innerHTML = candidates.map(c => `
    <div class="suggestion">
      <b>${escapeHTML(c.title)}</b>
      <span>${escapeHTML(c.body)}</span>
    </div>
  `).join("");
}

function renderSoon() {
  const root = document.getElementById("soonList");
  const buys = state.buy.filter(x => ["優先", "そろそろ", "ついでに買う"].includes(x.status));
  const cares = state.care.filter(x => x.nextDays && daysBetween(todayISO(), addDays(x.date, x.nextDays)) <= 14);
  const items = [
    ...buys.map(x => `買う：${x.item}（${x.status}）`),
    ...cares.map(x => `整える：${x.title}（次回目安が近い）`)
  ].slice(0, 8);
  root.innerHTML = items.length
    ? items.map(x => `<div class="suggestion">${escapeHTML(x)}</div>`).join("")
    : `<div class="empty-state">今すぐの「そろそろ」はありません。</div>`;
}

function renderTodaySuggestions() {
  const root = document.getElementById("todaySuggestions");
  const suggestions = [];
  const urgentBuy = state.buy.find(x => x.status === "優先") || state.buy.find(x => x.status === "そろそろ");
  if (urgentBuy) suggestions.push({ title: "買い物の詰まりを1つ減らす", body: `「${urgentBuy.item}」を今日買うか、買わないならステータスを変える。` });
  const goodDetox = state.reduce.sort((a,b) => Number(b.score) - Number(a.score))[0];
  if (goodDetox) suggestions.push({ title: "スマホ時間を軽くする", body: `前に効果が高かった「${goodDetox.method}」を短時間だけ試す。` });
  const memoCandidate = buildActionCandidates(5)[0];
  if (memoCandidate) suggestions.push(memoCandidate);
  if (!suggestions.length) suggestions.push({ title: "まず1つだけ預ける", body: "気になっていることをメモに1行だけ書く。" });
  root.innerHTML = suggestions.map(c => `<div class="suggestion"><b>${escapeHTML(c.title)}</b><span>${escapeHTML(c.body)}</span></div>`).join("");
}

document.getElementById("makeActionCandidates").addEventListener("click", () => renderActionCandidates(15));
document.getElementById("refreshToday").addEventListener("click", renderTodaySuggestions);
document.querySelectorAll(".time-chip").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".time-chip").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderActionCandidates(Number(btn.dataset.minutes), "timeSuggestions");
  });
});

document.getElementById("copyPrompt").addEventListener("click", async () => {
  const text = getAllMemoText();
  const prompt = `以下は私の「やりたいこと」メモです。\n目的は、抱え込まずに今日動ける小さな次アクションへ分解することです。\n\n条件：\n- 5分、15分、30分、1時間でできる行動候補に分けてください。\n- 最初の一歩は心理的ハードルが低いものにしてください。\n- 完璧に進めるより、詰まりを取ることを優先してください。\n\nメモ：\n${text}`;
  try {
    await navigator.clipboard.writeText(prompt);
    alert("ChatGPT用プロンプトをコピーしました。");
  } catch {
    alert(prompt);
  }
});

function escapeHTML(str = "") {
  return String(str).replace(/[&<>'"]/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  }[ch]));
}

function renderAll() {
  renderBuy(); renderCare(); renderReduce(); renderMemo(); renderSoon(); renderTodaySuggestions(); renderActionCandidates(15);
}
renderAll();
