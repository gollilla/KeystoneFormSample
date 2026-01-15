import ItemList from './components/shop/ItemList';
import ItemDetail from './components/shop/ItemDetail';
import { delayed, EventManager } from 'keystonemc';
import { formRouter } from './router';
import { Item } from './components/shop/types';

export {
  ItemList,
  ItemDetail,
};

const items: Item[] = [
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
