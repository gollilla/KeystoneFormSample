import { Player, world } from '@minecraft/server';
import { ActionForm, MessageForm, ModalForm } from 'keystonemc';

type Form = ActionForm | ModalForm | MessageForm;

/**
 * プレイヤーごとのルーター操作インターフェース
 */
class PlayerRouter {
  private history: Form[] = [];
  private currentIndex = -1;

  constructor(
    private readonly player: Player,
    private readonly onDispose: () => void
  ) { }

  /**
   * フォームをスタックに追加して表示
   */
  push(form: Form): void {
    // 現在位置より先の履歴を削除
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    this.history.push(form);
    this.currentIndex = this.history.length - 1;
    form.send(this.player);
  }

  /**
   * 前のフォームに戻る
   */
  back(): boolean {
    if (this.currentIndex <= 0) {
      return false;
    }

    this.currentIndex--;
    const form = this.history[this.currentIndex];
    form.send(this.player);
    return true;
  }

  /**
   * 次のフォームに進む
   */
  forward(): boolean {
    if (this.currentIndex >= this.history.length - 1) {
      return false;
    }

    this.currentIndex++;
    const form = this.history[this.currentIndex];
    form.send(this.player);
    return true;
  }

  /**
   * 現在のフォームを取得
   */
  current(): Form | undefined {
    if (this.currentIndex < 0) {
      return undefined;
    }
    return this.history[this.currentIndex];
  }

  /**
   * 履歴をクリア
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * 履歴の深さを取得
   */
  getHistoryLength(): number {
    return this.history.length;
  }

  /**
   * 戻れるかどうか
   */
  canGoBack(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * 進めるかどうか
   */
  canGoForward(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * リソースを解放
   */
  dispose(): void {
    this.clear();
    this.onDispose();
  }
}

class FormRouter {
  private playerRouters = new Map<string, PlayerRouter>();

  constructor() {
    // プレイヤーがオフラインになったら状態をクリア
    world.afterEvents.playerLeave.subscribe((event) => {
      this.playerRouters.delete(event.playerId);
    });
  }

  /**
   * プレイヤー用のルーターを取得する
   */
  use(player: Player): PlayerRouter {
    let router = this.playerRouters.get(player.id);
    if (!router) {
      router = new PlayerRouter(player, () => {
        this.playerRouters.delete(player.id);
      });
      this.playerRouters.set(player.id, router);
    }
    return router;
  }
}

/**
 * 新しいFormRouterインスタンスを作成する
 */
export function createFormRouter(): FormRouter {
  return new FormRouter();
}

const formRouter = createFormRouter();

export { formRouter };
