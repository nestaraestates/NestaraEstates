const fs = require('fs');

let file = 'apps/mobile/src/utils/pushNotifications.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /shouldSetBadge: true,/g,
  "shouldSetBadge: true,\n    shouldShowBanner: true,\n    shouldShowList: true,"
);

fs.writeFileSync(file, content);
