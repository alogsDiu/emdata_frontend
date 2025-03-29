// lib/i18n.ts
export async function getLocalizedContent(locale: string, page: string) {
  // console.log(`Attempting to load: ${locale}/${page}`); // Debug log
  
  try {
    const content = await import(`../locales/${locale}/${page}.json`);
    // console.log('Loaded content:', content.default); // Debug log
    return content.default;
  } catch (error) {
    console.error(`Error loading ${locale}/${page}:`, error);
    
    // Fallback to English
    if (locale !== 'en') {
      try {
        const fallback = await import(`../locales/en/${page}.json`);
        return fallback.default;
      } catch (fallbackError) {
        console.error('English fallback failed:', fallbackError);
      }
    }
    
    return { 
      login: 'Login',
      signUp: 'Sign Up',
      welcome: 'Welcome'
    };
  }
}