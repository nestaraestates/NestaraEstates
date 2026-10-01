const fs = require('fs');

let file = 'apps/mobile/src/app/_layout.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('Notifications.setNotificationHandler')) {
  const handlerCode = `
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
`;
  content = content.replace('import { PermissionsPopup } from "@/components/PermissionsPopup";', 'import { PermissionsPopup } from "@/components/PermissionsPopup";\n' + handlerCode);
  fs.writeFileSync(file, content);
}
