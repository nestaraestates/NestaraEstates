const fs = require('fs');

function fixGap(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /keyboardVerticalOffset=\{Platform\.OS === 'ios' \? 90 : 90\}/g,
    "keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}"
  );
  fs.writeFileSync(file, content);
}

fixGap('apps/mobile/src/app/chat/buyer/[enquiryId].tsx');
fixGap('apps/mobile/src/app/chat/seller/[enquiryId].tsx');
