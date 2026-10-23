(() => {
  const status = document.getElementById("network-status");
  if (!status) return;

  const update = () => {
    const offline = navigator.onLine === false;
    status.classList.toggle("is-offline", offline);
    status.textContent = offline
      ? "裝置目前顯示離線；AI、契約辨識與 Supabase 雲端資料需要網路。"
      : "本機資料可使用；AI、契約辨識與 Supabase 雲端資料需要網路。";
  };

  update();
  window.addEventListener("online", update);
  window.addEventListener("offline", update);
})();
