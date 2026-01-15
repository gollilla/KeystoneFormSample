import { ActionForm, Button } from 'keystonemc/form/component';
import { Player } from '@minecraft/server';
import { formRouter } from '@/router';
import { Item } from './types';

interface ItemDetailProps {
  item: Item;
}

const ItemDetail = ({ item }: ItemDetailProps) => {
  const handlePurchase = (player: Player) => {
    // TODO: 購入処理を実装
    console.log(`${player.name} purchased ${item.name}`);
  };

  const handleBack = (player: Player) => {
    const router = formRouter.use(player);
    router.back();
  };

  return (
    <ActionForm
      title={item.name}
      body={`価格: ￥${item.price}\n\n${item.description}`}
    >
      <Button onClick={handlePurchase}>
        購入する
      </Button>
      <Button onClick={handleBack}>
        戻る
      </Button>
    </ActionForm>
  );
};

export default ItemDetail;
