/**
 * Utility functions for image fallback handling
 */

// Fallback image as data URI (SVG) - works offline and doesn't require external requests
export const getFallbackImage = (width: number = 400, height: number = 300, text: string = 'لا توجد صورة'): string => {
  const encodedText = encodeURIComponent(text);
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Crect fill='%23f3f4f6' width='${width}' height='${height}'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='%239ca3af'%3E${encodedText}%3C/text%3E%3C/svg%3E`;
};

// Common fallback images
export const FALLBACK_IMAGES = {
  property: getFallbackImage(400, 300, 'لا توجد صورة'),
  thumbnail: getFallbackImage(100, 80, ''),
  partner: getFallbackImage(200, 120, 'شريك'),
  hotel: getFallbackImage(200, 120, 'فندق'),
  small: getFallbackImage(40, 40, ''),
};

// Handle image error by setting fallback
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, fallback?: string) => {
  const target = e.currentTarget;
  target.src = fallback || FALLBACK_IMAGES.property;
  target.onerror = null; // Prevent infinite loop
};





