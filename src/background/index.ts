import { ContentMessage } from "../types"

console.log('background is running')

// 1. タブをアクティブに切り替えた時の処理
chrome.tabs.onActivated.addListener(async () => {
  chrome.action.setBadgeText({ text: '' });

  // アクティブになったタブを取得しcontent_script側で受信可能なメッセージを送信
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id!, { type: 'startProcess' });
});

// 3. content_scriptからメッセージを受け取ったときの処理
chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener((message: ContentMessage) => {
    switch (message.type) {
      case 'headings':
        // バッジに記事内に含まれるhタグの件数をセット
        const count = message.data.length;
        chrome.action.setBadgeText({ text: count.toString() });
        chrome.action.setBadgeBackgroundColor({ color: '#FFFFFF' });
        break
    }
  })
})