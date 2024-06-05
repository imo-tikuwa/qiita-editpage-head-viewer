import { HNode } from '../types'

console.info('contentScript is running')

/**
 * 見出しタグを収集
 * @param element
 * @returns
 */
function extractHeadings(element: any): Array<HNode> {
  const headings = []
  const validHeadingTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6']

  if (element.childNodes) {
    for (const node of element.childNodes) {
      if (node.nodeType === Node.ELEMENT_NODE && validHeadingTags.includes(node.tagName)) {
        headings.push({
          level: parseInt(node.tagName.charAt(1)),
          text: node.textContent.trim(),
        })
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        headings.push(...extractHeadings(node))
      }
    }
  }

  return headings
}

let intervalId: NodeJS.Timeout | undefined

const runIntervalProcess = () => {
  intervalId = setInterval(() => {
    const mdContent = document.querySelector<HTMLDivElement>('.it-MdContent')
    if (mdContent === null) {
      console.warn('Could not find .it-MdContent element.')
      return
    }

    // 見出しタグを取得
    const headings = extractHeadings(mdContent)

    // 結果をbackground、popupに送る
    const port = chrome.runtime.connect()
    port.postMessage({
      type: 'headings',
      data: headings,
    })
    console.info(`${headings.length} h tags have been sent.`)
  }, 3000)
}

window.onload = () => {
  runIntervalProcess()
}

// 2. backgroundからメッセージを受け取ったときの処理
chrome.runtime.onMessage.addListener((message) => {
  switch (message.type) {
    case 'startProcess':
      runIntervalProcess()
      break
  }
})

// etc. タブから離れたときにsetInterval実施中の場合は解除
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && intervalId) {
    clearInterval(intervalId)
    console.log('clearInterval worked', intervalId)
  }
})
