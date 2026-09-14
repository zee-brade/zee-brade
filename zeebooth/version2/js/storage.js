(() => {
  const PHOTO_KEY = "zeebooth.photos.v1";
  const HISTORY_KEY = "zeebooth.history.v1";
  const SESSION_KEY = "zeebooth.pending.v1";

  const read = (key, fallback = []) => {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

  window.ZeeboothStore = {
    getPhotos(){ return read(PHOTO_KEY, []); },
    savePhoto(photo){
      const photos = read(PHOTO_KEY, []);
      photos.unshift(photo);
      write(PHOTO_KEY, photos.slice(0, 100));
      return photo;
    },
    deletePhoto(id){
      write(PHOTO_KEY, read(PHOTO_KEY, []).filter(x => x.id !== id));
    },
    getHistory(){ return read(HISTORY_KEY, []); },
    saveHistory(item){
      const history = read(HISTORY_KEY, []);
      history.unshift(item);
      write(HISTORY_KEY, history.slice(0, 100));
      return item;
    },
    setPending(session){ write(SESSION_KEY, session); },
    getPending(){ return read(SESSION_KEY, null); },
    clearPending(){ localStorage.removeItem(SESSION_KEY); }
  };

  window.renderPhotosPage = () => {
    const grid = document.getElementById("photosGrid");
    const empty = document.getElementById("photosEmpty");
    if (!grid || !empty) return;
    const photos = window.ZeeboothStore.getPhotos();
    grid.innerHTML = "";
    empty.classList.toggle("hidden", photos.length > 0);
    photos.forEach(photo => {
      const card = document.createElement("article");
      card.className = "photo-card glass-card";
      card.innerHTML = `
        <div class="photo-image-wrap">
          <img src="${photo.dataUrl}" alt="Saved Zeebooth result">
        </div>
        <div class="photo-card-body">
          <div class="photo-meta">
            <strong>${photo.shots || 1} photo${(photo.shots || 1) > 1 ? "s" : ""}</strong>
            <span>${window.Zeebooth.formatDate(photo.createdAt)}</span>
          </div>
          <div class="card-actions">
            <button class="icon-btn" data-download="${photo.id}">Download</button>
            <button class="icon-btn" data-delete="${photo.id}">Delete</button>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    grid.querySelectorAll("[data-download]").forEach(btn => {
      btn.addEventListener("click", () => {
        const photo = photos.find(x => x.id === btn.dataset.download);
        if (!photo) return;
        const a = document.createElement("a");
        a.href = photo.dataUrl;
        a.download = `zeebooth-${new Date(photo.createdAt).toISOString().replace(/[:.]/g,"-")}.png`;
        a.click();
      });
    });

    grid.querySelectorAll("[data-delete]").forEach(btn => {
      btn.addEventListener("click", () => {
        window.ZeeboothStore.deletePhoto(btn.dataset.delete);
        renderPhotosPage();
      });
    });
  };

  window.renderHistoryPage = () => {
    const list = document.getElementById("historyList");
    const empty = document.getElementById("historyEmpty");
    if (!list || !empty) return;
    const history = window.ZeeboothStore.getHistory();
    list.innerHTML = "";
    empty.classList.toggle("hidden", history.length > 0);
    history.forEach(item => {
      const card = document.createElement("article");
      card.className = "history-card glass-card";
      card.innerHTML = `
        <div class="history-thumb">
          <img src="${item.preview}" alt="Session preview">
        </div>
        <div>
          <strong>${item.shots || 1} photo session</strong>
          <span>${window.Zeebooth.formatDate(item.createdAt)} · ${item.aspect || "3:4"} · ${item.layoutName || "Grid"}</span>
          <span>Background: ${item.backgroundName || "Soft Mist"}</span>
        </div>
        <a href="photos.html" class="btn btn-secondary">View Photos</a>
      `;
      list.appendChild(card);
    });
  };
})();
