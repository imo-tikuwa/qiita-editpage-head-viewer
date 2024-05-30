<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Skeleton from 'primevue/skeleton'
import type { ContentMessage, HNode } from '../types'

const currentTab = ref<chrome.tabs.Tab | null>(null)
const headings = ref<Array<HNode>>([])

/**
 * 現在のページURLのアンカー部分を取り除いたURLを算出
 */
const currentTabUrl = computed(() => currentTab.value?.url?.split('#')[0])

chrome.runtime.onConnect.addListener((port) => {
  // 3. content_scriptからメッセージを受け取ったときの処理
  port.onMessage.addListener((message: ContentMessage) => {
    headings.value = message.data
  })
})

onMounted(() => {

  // 現在アクティブなタブのページURLを表示
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      const activeTab = tabs[0];
      if (activeTab.url) {
        currentTab.value = activeTab;
      } else {
        currentTab.value = null
      }
    }
  });
})

/**
 * URLをアップデート
 * @param anchor 
 */
const updateUrl = (anchor: string) => {
  // TODO 以下の変換処理は不足あるかも？
  const transformedAnchor = anchor
    .toLowerCase() // 大文字を小文字に変換
    .replace(/\s/g, '-') // 半角スペースを「-」に置き換える
    .replace(/　/g, '') // 全角スペースを取り除く
    .replace(/（|）|\(|\)/g, '') // 「（」「）」「(」「)」を取り除く
    .replace(/,|\.|。|、/g, ''); // 「,」「.」「。」「、」を取り除く
  const newUrl = currentTab.value!.url?.split('#')[0] + '#' + transformedAnchor;
  console.log (newUrl)
  chrome.tabs.update(currentTab.value!.id!, {
    url: newUrl
  })
}
</script>

<template>
  <Card>
    <template #header>
      <div class="flex align-items-center justify-content-between">
        <div class="mx-auto">
          <h2 class="text-primary text-2xl">Qiita EditPage Head Viewer</h2>
        </div>
        <div>
          <Button
            class="p-1 mr-4"
            severity="help"
            icon="pi pi-question"
            size="small"
            text
          />
        </div>
      </div>
    </template>

    <template #subtitle>
      <template v-if="currentTabUrl">
        <div class="grid mx-3" style="min-width: 400px;width:auto">
          <div class="col-2 flex align-items-center">
            URL
          </div>
          <div class="col-10 flex align-items-center">
            <div>
              {{ currentTabUrl }}
            </div>
          </div>
        </div>
      </template>
    </template>
    
    <template #content>
      <template v-if="headings && headings.length > 0">
        <DataTable class="head-list w-full" :value="headings" size="small" :pt="{
          bodyRow: () => ({
            style: 'background-color: transparent'
          }),
          emptyMessageCell: () => ({
            style: 'background-color: transparent'
          })
        }">
          <Column header="Link" frozen style="min-width: 50px" :pt="{
            bodyCell: () => ({
              class: 'py-0 text-center',
            })
          }">
            <template #body="slotProps">
              <Button
                class="p-1 w-auto"
                severity="help"
                icon="pi pi-link"
                size="small"
                text
                @click="updateUrl(slotProps.data.text)"
              />
            </template>
          </Column>
          <Column header="Head" style="max-width: 300px" :pt="{
            bodyCell: () => ({
              class: 'py-0',
            })
          }">
            <template #body="slotProps">
              <div :class="`level${slotProps.data.level}`">
                {{ slotProps.data.text }}
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
      <Skeleton v-else class="w-full" height="4rem"></Skeleton>
    </template>
  </Card>
</template>

<style scoped lang="scss">
.head-list {
  td div {
    &.level1 {
      margin-left: 0;
    }
    &.level2 {
      margin-left: 1em;
    }
    &.level3 {
      margin-left: 2em;
    }
    &.level4 {
      margin-left: 3em;
    }
    &.level5 {
      margin-left: 4em;
    }
    &.level6 {
      margin-left: 5em;
    }
  }
}
</style>
