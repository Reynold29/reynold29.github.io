function tableForLang(lang) {
  if (lang === "english") return "english_data";
  if (lang === "kannada") return "kannada_data";
  return "other_data";
}

function langForCategory(category) {
  const c = (category || "").replace(/_data$/, "");
  if (c === "english" || c === "kannada") return c;
  return "other";
}

function createClient() {
  return window.supabase.createClient(
    window.WC_CONFIG.supabaseUrl,
    window.WC_CONFIG.supabaseAnonKey,
    { realtime: { params: { eventsPerSecond: 2 } } }
  );
}

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

function storeButtons(container) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const url = isIOS ? window.WC_CONFIG.appStoreUrl : window.WC_CONFIG.playStoreUrl;
  const label = isIOS ? "Get iOS app" : "Get Android app";
  container.innerHTML = `
    <p>Get Worship Companion for chords, transpose, and offline lyrics.</p>
    <a class="btn" href="${url}">${label}</a>
  `;
}

function subscribeFiltered(client, channelName, table, filter, onChange) {
  const channel = client
    .channel(channelName)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table, filter },
      onChange
    )
    .subscribe();
  return channel;
}
