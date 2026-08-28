(() => {
  const projects = window.PROJECTS || [];
  const rail = document.querySelector("#gallery-rail");
  const nav = document.querySelector("#project-nav");
  const status = document.querySelector("#gallery-status");
  const previous = document.querySelector("#previous-slide");
  const next = document.querySelector("#next-slide");
  const dialog = document.querySelector("#image-viewer");
  const closeViewer = document.querySelector("#viewer-close");
  const viewerImage = document.querySelector("#viewer-image");
  const viewerTitle = document.querySelector("#viewer-title");
  const viewerTopic = document.querySelector("#viewer-topic");
  const viewerCaption = document.querySelector("#viewer-caption");

  const slides = projects.flatMap((project) => {
    if (project.screenshots.length) {
      return project.screenshots.map((screenshot) => ({ project, screenshot }));
    }
    return [{ project, screenshot: null }];
  });

  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;"
  })[character]);

  const arrowIcon = "<svg aria-hidden=\"true\" viewBox=\"0 0 24 24\"><path d=\"M5 12h14m-6-6 6 6-6 6\"/></svg>";
  const imageIcon = "<svg aria-hidden=\"true\" viewBox=\"0 0 24 24\"><rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"/><circle cx=\"8.5\" cy=\"9\" r=\"1.5\"/><path d=\"m21 15-5-5L5 20\"/></svg>";

  function renderCard({ project, screenshot }, index) {
    const title = escapeHtml(project.title);
    const topic = escapeHtml(project.topic);
    const proof = escapeHtml(project.proof);
    const media = screenshot
      ? `<button class="gallery-media" type="button" data-open-viewer="${index}" aria-label="Open full-size screenshot: ${escapeHtml(screenshot.alt)}"><img loading="lazy" src="${escapeHtml(screenshot.src)}" alt="${escapeHtml(screenshot.alt)}"></button>`
      : `<div class="placeholder-media" role="img" aria-label="Screenshot placeholder for ${title}">${imageIcon}<div><p>Screenshot ready to add</p><span>Add a public-safe image in <code>data/projects.js</code>.</span></div></div>`;
    const repoLink = project.repoUrl ? `<a href="${escapeHtml(project.repoUrl)}" target="_blank" rel="noreferrer">Inspect the work ${arrowIcon}</a>` : "";
    const liveLink = project.liveUrl ? `<a href="${escapeHtml(project.liveUrl)}" target="_blank" rel="noreferrer">View live ${arrowIcon}</a>` : "";

    return `<article class="gallery-card" data-project-id="${escapeHtml(project.id)}" id="${escapeHtml(project.id)}">
      ${media}
      <div class="gallery-copy">
        <p class="eyebrow">${topic}</p>
        <h3>${title}</h3>
        <p>${proof}</p>
        <div class="card-links">${repoLink}${liveLink}</div>
      </div>
    </article>`;
  }

  function render() {
    nav.innerHTML = projects.map((project) => `<button class="project-tab" type="button" data-project-id="${escapeHtml(project.id)}" aria-pressed="false">${escapeHtml(project.title)}</button>`).join("");
    rail.innerHTML = slides.map(renderCard).join("");
  }

  function projectStartIndex(id) {
    return slides.findIndex((slide) => slide.project.id === id);
  }

  function scrollToSlide(index, behavior = "smooth") {
    const card = rail.children[index];
    if (card) card.scrollIntoView({ behavior, block: "nearest", inline: "start" });
  }

  function currentIndex() {
    const center = rail.scrollLeft + rail.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Infinity;
    Array.from(rail.children).forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(center - cardCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    return closestIndex;
  }

  function updateState() {
    const index = currentIndex();
    const project = slides[index]?.project;
    if (!project) return;
    nav.querySelectorAll(".project-tab").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.projectId === project.id));
    });
    status.textContent = `${project.title} · ${index + 1} of ${slides.length}`;
  }

  function openViewer(index) {
    const slide = slides[index];
    if (!slide?.screenshot) return;
    viewerImage.src = slide.screenshot.src;
    viewerImage.alt = slide.screenshot.alt;
    viewerTopic.textContent = slide.project.topic;
    viewerTitle.textContent = slide.project.title;
    viewerCaption.textContent = slide.screenshot.caption;
    dialog.showModal();
  }

  render();
  updateState();

  nav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-project-id]");
    if (!button) return;
    const index = projectStartIndex(button.dataset.projectId);
    if (index >= 0) scrollToSlide(index);
  });

  rail.addEventListener("click", (event) => {
    const button = event.target.closest("[data-open-viewer]");
    if (button) openViewer(Number(button.dataset.openViewer));
  });

  previous.addEventListener("click", () => scrollToSlide(Math.max(0, currentIndex() - 1)));
  next.addEventListener("click", () => scrollToSlide(Math.min(slides.length - 1, currentIndex() + 1)));

  rail.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") { event.preventDefault(); previous.click(); }
    if (event.key === "ArrowRight") { event.preventDefault(); next.click(); }
    if (event.key === "Home") { event.preventDefault(); scrollToSlide(0); }
    if (event.key === "End") { event.preventDefault(); scrollToSlide(slides.length - 1); }
  });

  let scrollFrame;
  rail.addEventListener("scroll", () => {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(updateState);
  }, { passive: true });

  let dragStartX = 0;
  let dragStartScroll = 0;
  rail.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragStartX = event.clientX;
    dragStartScroll = rail.scrollLeft;
    rail.setPointerCapture(event.pointerId);
    rail.classList.add("is-dragging");
  });
  rail.addEventListener("pointermove", (event) => {
    if (!rail.classList.contains("is-dragging")) return;
    rail.scrollLeft = dragStartScroll - (event.clientX - dragStartX);
  });
  ["pointerup", "pointercancel"].forEach((type) => rail.addEventListener(type, () => rail.classList.remove("is-dragging")));

  closeViewer.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });

  function applyHash() {
    const id = decodeURIComponent(window.location.hash.slice(1));
    const index = projectStartIndex(id);
    if (index >= 0) scrollToSlide(index, "auto");
  }
  window.addEventListener("hashchange", applyHash);
  applyHash();
})();
