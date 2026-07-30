export function detectLanguage(text: string): 'en' | 'vi' | 'fr' {
  if (!text) return 'en';
  const str = text.toLowerCase();
  
  // Vietnamese specific characters
  const viRegex = /[ăđơưảãạắằẳẵặấầẩẫậẻẽẹếềểễệỉĩịỏõọốồổỗộớờởỡợủũụứừửữựỷỹỵ]/;
  // French specific characters
  const frRegex = /[çëäöüïœæ]/;
  
  // Common words to help disambiguate shared accents (é, è, ê, à, â, ô)
  const viWordsRegex = /\b(và|của|không|có|trong|một|là|người|với|những|đã|các|như|cho|được|để|khi|này|tôi|về|đến)\b/;
  const frWordsRegex = /\b(le|la|les|des|un|une|est|dans|pour|qui|que|et|sur|avec|nous|vous|ce|il|elle)\b/;

  if (viRegex.test(str) || viWordsRegex.test(str)) return 'vi';
  if (frRegex.test(str) || frWordsRegex.test(str)) return 'fr';
  
  // Fallback check for shared accents
  if (/[éèêàâô]/.test(str)) return 'fr'; // If it has accents but no VN words, it's likely French
  
  return 'en';
}

export function getLanguageFontClass(text: string, titleFont?: string) {
  if (titleFont && titleFont !== 'auto') {
    return `font-${titleFont}`;
  }
  const lang = detectLanguage(text || '');
  return lang === 'en' ? 'font-gamja' : 'font-patrick';
}

export function getBodyLanguageFontClass(text: string) {
  const lang = detectLanguage(text || '');
  return lang === 'en' ? 'font-jost' : 'font-montserrat';
}
