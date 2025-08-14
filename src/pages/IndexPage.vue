<template>
  <q-page class="row items-center justify-evenly">
    <div class="col-12 text-center">
      <button @click="transaction()" class="text-center">正常事务</button>
      <button @click="transaction(false)" class="text-center">回滚事务</button>
      <button @click="checkForUpdate()" class="text-center">热更新</button>
      <button @click="print" class="text-center">打印</button>
    </div>
    <div v-for="post in posts" :key="post.id" class="col-12 col-md-6 col-lg-4">
      <q-card class="my-card">
        <q-card-section>
          <div class="text-h6">{{ post.title }}</div>
          <div class="text-subtitle2">{{ post.body }}</div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import { createAdapter } from '../adapter';
import { openDB } from 'idb';

const adapter = createAdapter();
const posts = ref<Array<Post>>([]);
type Post = {
  id: number;
  title: string;
  body: string;
};
onBeforeMount(async () => {
  await adapter.request<{ posts: Array<Post> }>().then(({ posts: data }) => {
    posts.value = data;
  });
});

async function transaction(hasError?: boolean) {
  const db = await openDB('quaser-demo', 1, {
    upgrade(db) {
      db.createObjectStore('posts', { keyPath: 'id', autoIncrement: true });
    },
  });
  const tx = db.transaction('posts', 'readwrite');
  const store = tx.objectStore('posts');

  try {
    await store.add({ id: 1, title: '正常的文章', body: '这篇文章将会正常插入到indexdb' });
    if (hasError) {
      throw new Error('模拟错误');
    }
  } catch (error) {
    console.error('事务失败:', error);
    tx.abort(); // 触发回滚
    throw error;
  }

  await tx.done;

  const allPosts = await db.getAll('posts');
  posts.value = allPosts;
}
async function print() {
  try {
    await adapter.print('Hello, this is a test print!');
    console.log('Print command sent successfully.');
  } catch (error) {
    console.error('Failed to send print command:', error);
  }
}
async function checkForUpdate() {
  try {
    await adapter.checkForUpdate();
    console.log('Checked for updates successfully.');
  } catch (error) {
    console.error('Failed to check for updates:', error);
  }
}
</script>
