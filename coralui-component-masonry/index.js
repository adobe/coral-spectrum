import '/coralui-externals';

import Masonry from './src/scripts/Masonry';
import MasonryItem from './src/scripts/MasonryItem';
import MasonryLayout from './src/scripts/MasonryLayout';
import MasonryFixedCenteredLayout from './src/scripts/MasonryFixedCenteredLayout';
import MasonryFixedSpreadLayout from './src/scripts/MasonryFixedSpreadLayout';
import MasonryVariableLayout from './src/scripts/MasonryVariableLayout';
import MasonryDashboardLayout from './src/scripts/MasonryDashboardLayout';

// Register layouts
Masonry.registerLayout(Masonry.layouts.FIXED_CENTERED, MasonryFixedCenteredLayout);
Masonry.registerLayout(Masonry.layouts.FIXED_SPREAD, MasonryFixedSpreadLayout);
Masonry.registerLayout(Masonry.layouts.VARIABLE, MasonryVariableLayout);
Masonry.registerLayout(Masonry.layouts.DASHBOARD, MasonryDashboardLayout);

// Expose component on the Coral namespace
window.customElements.define('coral-masonry', Masonry);
window.customElements.define('coral-masonry-item', MasonryItem);

Masonry.Item = MasonryItem;
Masonry.Layout = MasonryLayout;

export {Masonry};
