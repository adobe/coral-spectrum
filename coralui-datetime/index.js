import '/coralui-externals';
import DateTime from './src/scripts/DateTime';

// Expose DateTime on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.DateTime = DateTime;

// Set moment global locale if provided
if (typeof window.moment !== 'undefined') {
  window.moment.locale(document.documentElement.lang || window.navigator.language || 'en');
}

export {DateTime};
