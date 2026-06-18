/* Section landing "explorer": update the sticky preview pane as the
   reader hovers/focuses an article in the list. Progressive enhancement —
   the list items are real links, so everything works without JS. */
(function () {
  function initExplorer(explorer) {
    var items = explorer.querySelectorAll(".article-item");
    var preview = explorer.querySelector(".article-preview");
    if (!items.length || !preview) return;

    var elTitle = preview.querySelector(".article-preview__title");
    var elDesc = preview.querySelector(".article-preview__desc");
    var elEyebrow = preview.querySelector(".article-preview__eyebrow");
    var elLink = preview.querySelector(".article-preview__link");

    function activate(item) {
      for (var i = 0; i < items.length; i++) {
        items[i].classList.remove("is-active");
      }
      item.classList.add("is-active");

      var titleNode = item.querySelector(".article-item__title");
      var descNode = item.querySelector(".article-item__desc");
      if (elTitle && titleNode) elTitle.textContent = titleNode.textContent;
      if (elDesc && descNode) elDesc.textContent = descNode.textContent;
      if (elEyebrow) {
        var meta = item.getAttribute("data-meta");
        if (meta) {
          elEyebrow.textContent = meta;
          elEyebrow.style.display = "";
        } else {
          elEyebrow.style.display = "none";
        }
      }
      if (elLink) elLink.setAttribute("href", item.getAttribute("href"));
    }

    for (var i = 0; i < items.length; i++) {
      (function (item) {
        item.addEventListener("mouseenter", function () { activate(item); });
        item.addEventListener("focus", function () { activate(item); });
      })(items[i]);
    }
    activate(items[0]);
  }

  function init() {
    var explorers = document.querySelectorAll(".article-explorer");
    for (var i = 0; i < explorers.length; i++) initExplorer(explorers[i]);
  }

  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
  // Re-run under Material instant navigation, if ever enabled.
  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(function () { init(); });
  }
})();
