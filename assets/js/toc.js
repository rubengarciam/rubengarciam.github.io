(function () {
  var content = document.querySelector('.post-content');
  var tocNav = document.getElementById('toc');
  var tocSidebar = document.getElementById('toc-sidebar');
  var tocToggle = document.getElementById('toc-toggle');

  if (!content || !tocNav || !tocSidebar) return;

  var headings = content.querySelectorAll('h2, h3');
  if (headings.length < 2) {
    tocSidebar.remove();
    return;
  }

  // Widen layout for sidebar
  var post = document.querySelector('.post');
  if (post) post.classList.add('has-toc');

  // Ensure headings have IDs
  headings.forEach(function (h, i) {
    if (!h.id) {
      h.id = h.textContent
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-') || 'section-' + i;
    }
  });

  // Build list
  var ol = document.createElement('ol');
  headings.forEach(function (h) {
    var li = document.createElement('li');
    if (h.tagName === 'H3') li.classList.add('toc-h3');
    var a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    li.appendChild(a);
    ol.appendChild(li);
  });
  tocNav.appendChild(ol);

  // Mobile toggle
  if (tocToggle) {
    tocToggle.addEventListener('click', function () {
      var open = tocSidebar.classList.toggle('open');
      tocToggle.setAttribute('aria-expanded', open);
    });
  }

  // Active section tracking
  var tocLinks = tocNav.querySelectorAll('a');

  function updateActive() {
    var scrollY = window.scrollY || window.pageYOffset;
    var active = null;
    headings.forEach(function (h) {
      if (h.offsetTop <= scrollY + 120) active = h;
    });
    tocLinks.forEach(function (l) { l.classList.remove('active'); });
    if (active) {
      var link = tocNav.querySelector('a[href="#' + CSS.escape(active.id) + '"]');
      if (link) link.classList.add('active');
    }
  }

  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
})();
