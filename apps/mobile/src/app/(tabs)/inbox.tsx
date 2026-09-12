import React, { useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

export default function InboxScreen() {
  const webviewRef = useRef<WebView>(null);
  
  const INJECTED_JS = `
    setTimeout(function() {
      const bottomNav = document.querySelector('.fixed.bottom-0');
      if (bottomNav) bottomNav.style.display = 'none';
      const header = document.querySelector('header');
      if (header) header.style.display = 'none';
    }, 100);
    true;
  `;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-zinc-950">
      <WebView 
        ref={webviewRef}
        source={{ uri: 'https://nestara-estates-web.vercel.app/inbox' }}
        className="flex-1"
        injectedJavaScript={INJECTED_JS}
        onMessage={() => {}}
      />
    </SafeAreaView>
  );
}
