function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    pageLanguage: 'en',
    includedLanguages: 'en,zh-CN,es,fr,de,ja,ko',
    layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
    autoDisplay: true
  }, 'google_translate_element');
}

function toggleTranslate() {
  var el = document.getElementById('google_translate_element');
  if (el.classList.contains('open')) {
    el.classList.remove('open');
  } else {
    el.classList.add('open');
  }
}

// Close when clicking outside
document.addEventListener('click', function(e) {
  var container = document.querySelector('.md-header__translate');
  var el = document.getElementById('google_translate_element');
  if (el && container && !container.contains(e.target)) {
    el.classList.remove('open');
  }
});
