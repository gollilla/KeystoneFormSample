import { ActionForm as ActionFormType } from 'keystonemc';
import { ActionForm, Button } from 'keystonemc/form/component';
import { formRouter } from '@/router';
import { Player } from '@minecraft/server';
import { Item } from './types';
import ItemDetail from './ItemDetail';

interface ItemListProps {
  items: Item[];
};

const ItemList = ({ items }: ItemListProps): ActionFormType => {
  const handleClick = (item: Item) => (player: Player) => {
    const router = formRouter.use(player);
    router.push(<ItemDetail item={item} />);
  };

  return (
    <ActionForm
      title="アイテム一覧"
    >
      {items.map(
        (item) =>
          <Button
            onClick={handleClick(item)}
          >
            {item.name} - ￥{item.price}
          </Button>
      )}
    </ActionForm>
  );
};

export default ItemList;
