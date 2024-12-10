function googleTranslateElementInit() {
    new google.translate.TranslateElement(
      { pageLanguage: 'en', includedLanguages: 'en,es,fr,zh-CN', layout: google.translate.TranslateElement.InlineLayout.SIMPLE },
      'google_translate_element'
    );
  }
  
  /* Apply theme-aware styling */
  document.addEventListener('DOMContentLoaded', function () {
    const applyThemeToTranslation = () => {
      const theme = document.documentElement.getAttribute('data-md-color-scheme');
      const translateElement = document.getElementById('google_translate_element');
      if (translateElement) {
        if (theme === 'default') {
          translateElement.style.backgroundColor = '#f5f5f5';
          translateElement.style.color = '#000';
        } else {
          translateElement.style.backgroundColor = '#333';
          translateElement.style.color = '#fff';
        }
      }
    };
  
    applyThemeToTranslation();
    const toggleButton = document.querySelector('[data-md-toggle]');
    if (toggleButton) {
      toggleButton.addEventListener('click', applyThemeToTranslation);
    }
  });
  