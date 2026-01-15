## Keystone フォームサンプル

## 導入方法
1. インストール
```bash
npm install https://github.com/gollilla/KeystoneFormSample.git
```
2. インポート
```ts
import 'keystoneformsample';
```

## 使用例
```ts
import { ItemList, formRouter } from 'keystoneformsample';
import { delayed, EventManager } from 'keystonemc';

const items = [
  {
    id: 1,
    name: 'テストアイテム1',
    price: 100,
    description: '',
  },
  {
    id: 2,
    name: 'テストアイテム2',
    price: 1010,
    description: '',
  },
  {
    id: 3,
    name: 'テストアイテム3',
    price: 120,
    description: '',
  },
  {
    id: 4,
    name: 'テストアイテム4',
    price: 150,
    description: '',
  },
];

EventManager.registerAfter('playerSpawn', {
  handler(event) {
    if (!event.initialSpawn) return;

    const { player } = event;
    const router = formRouter.use(player);

    delayed(10*20, () => router.push(ItemList({ items })));
  },
});
```
