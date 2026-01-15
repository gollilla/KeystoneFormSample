# Keystone

## イベント

### 単一ファイルの場合のサンプル
```ts
import { EventManager, Priority } from 'keystonemc';

// 例:プレイヤーがスポーンした時
EventManager.registerAfter('playerSpawn', {
  handler(event) {
    if (!event.initialSpawn) return; // 初回参加時以外は無視
    event.player.sendMessage('どうぶつの森');
  }
});

EventManager.registerAfter('playerSpawn', {
  handler(event) {
    if (!event.initialSpawn) return; // 初回参加時以外は無視
    event.player.sendMessage('おいでよ');
  },
  priority: Priority.LOWEST // 優先度
});
```

`registerAfter`及び`registerBefore`の第一引数である`eventName`は、しっかりKeystoneが読み込まれていればクォーテーションを入力したときに利用可能なイベント名の補完が出ます。  
Priorityは優先度が高い順に`LOWEST > LOW > NORMAL > HIGH > HIGHEST > MONITOR`があります。`MONITOR`が一番最後に処理されます。 引数未指定のデフォルトは`NORMAL`です。
<br />
  
### ファイル分けした場合の推奨サンプル
```ts
// --------------------- index.ts ---------------------
import './playerSpawn';
import './buttonPush';

// --------------------- playerSpawn.ts ---------------------
import { EventManager, Priority } from 'keystonemc';

EventManager.registerAfter('playerSpawn', {
  handler(event) {},
  priority: Priority.LOWEST
});

EventManager.registerAfter('playerSpawn', {
  handler(event) {},
  priority: Priority.MONITOR
});

// --------------------- buttonPush.ts ---------------------
import { EventManager } from 'keystonemc';

EventManager.registerAfter('buttonPush', {
  handler(event) {}
});

```
<br />

## タイマー
### 継続処理サンプル
```ts
import { repeating } from 'keystonemc';

const timer20s = repeating({
  every: 1*20, // 間隔
  max: 20*20, // 最大ティック
  runWhileStopped: true, // 停止してても run() を呼び出すか
  run(elapsedTicks: number) { // 毎Nティック処理
    // 退室した可能性 → 強制キャンセル
    if (!player || !player.isValid) {
      return timer20s.cancel(true);
    }

    // 飛行 → キャンセル
    if (player.isFlying) {
      return timer20s.cancel();
    }
    
    // スニークしてる間はタイマーストップ
    if (player.isSneaking && !timer20s.isStopped()) {
      timer20s.stop();
    }

    // スニークしてないときはタイマー再開
    if (!player.isSneaking && timer20s.isStopped()) {
      timer20s.resume();
    }

    // 現在の秒数をアクションバーに送信
    player.onScreenDisplay?.setActionBar(`${Math.floor(elapsedTicks/20)}`);
  },
  cancel() { // タイマーがキャンセルされたときの処理
    player.sendMessage('飛んだのでタイマーが終了しました！');
  },
  final() { // 最大ティックまで到達したときの処理
    player.sendMessage('最大に達しました');
  }
});
```
<br />

### 遅延処理サンプル
```ts
import { delayed } from 'keystonemc';

// 2秒後の処理
delayed(
  2*20, // 遅延するティック
  () => { // 遅延処理
    player.sendMessage('2008年11月20日 発売！');
  }
);

// 1秒後の処理
delayed(1*20, () => player.sendMessage('どうぶつの森'));

// 即座に処理
player.sendMessage('街へいこうよ');
```
<br />

### 条件待機処理サンプル
```ts
import { until } from 'keystonemc';

until({
  when: () => player.isSneaking,
  run: () => player.sendMessage('10秒以内にスニークをしました'),
  onTimeout: () => player.sendMessage('10秒以内にスニークをしてくれませんでした'),
  timeout: 10*20
});
```
`until`を用いることで、任意の動作や状態が完了するまで待機してその後処理をすることができるようになります。  
非同期で用いる場合は`until`ではなく`waitUntil`を使ってください。

<br />

<details>

<summary>フレンド申請の処理 (until使用)</summary>

```ts
import { EventManager, until } from 'keystonemc';

EventManager.registerBefore('chatSend', {
  handler(event) {
    if (event.message !== '#friend accept') return;
    event.cancel = true;
    
    const player = event.sender;
    player.sendMessage('「Bob」のフレンド申請を承諾しました。');
    player.sendMessage('キャンセルする場合は、5秒以内にスニークをしてください。');

    // 待機
    until({
      when: () => player.isSneaking,
      run: () => player.sendMessage('フレンド申請の承諾を取り消しました。'),
      onTimeout: () => player.sendMessage('フレンド申請の承諾が確定しました。'),
      timeout: 5*20
    });
  },
});
```

</details>  

<details>

<summary>参加してから動き出すのを待機 (waitUntil使用)</summary>

```ts
import { EventManager, waitUntil } from 'keystonemc';

EventManager.registerAfter('playerSpawn', {
  async handler(event) {
    if (!event.initialSpawn) return;
    const player = event.player;

    // ワールドにスポーンした瞬間のRotationを保管
    const rotation = player.getRotation();

    // 動き出すまで待機
    // 高確率でクライアントの読み込みが終わった瞬間に一瞬首が動く
    await waitUntil(() => (
      Math.abs(rotation.x - player.getRotation().x) > 1 ||
      Math.abs(rotation.y - player.getRotation().y) > 1)
    );

    // メッセージ送信
    player.sendMessage('Welcome!');
  },
});
```

</details>  

<br />

### スリープ処理サンプル
```ts
import { sleep } from 'keystonemc';

(async() => {
  player.sendMessage('街へいこうよ');

  await sleep(1*20); // 1秒待機

  player.sendMessage('どうぶつの森');
  
  await sleep(1*20); // 1秒待機

  player.sendMessage('2008年11月20日 発売！');
})();
```
`sleep`を用いることで、上から下へ流れる処理を実装できます。  
これをイベントで応用する場合は、以下のようにlistenerの処理部分を`handler()`ではなく `async handler()`にします。

非同期で処理を行う場合、メインスレッドの処理を無視する形になるため、`playerSpawn`などのクライアント側の読み込みが関わってくる処理では、冒頭にある程度の遅延を持たせないと、処理が省略されるケースがあります。

基本的にクライアント側の読み込みが関わってくる処理は全て同期的に行うことをおすすめします。  
<br />

<details>

<summary>ロードを意図的に入れた参加時のタイトルアニメーション (sleep使用)</summary>

```ts
import { EventManager, Priority, sleep } from 'keystonemc';

// 参加時のタイトルアニメーション
EventManager.registerAfter('playerSpawn', {
  async handler(event) {
    if (!event.initialSpawn) return;

    const player = event.player;

    // ここから 「Now loading...」を表示させる処理
    const wait = Math.floor(Math.random() * 4) + 3; // 3～6秒のランダムなロードを再現
    let dot = 0;
    for (let i = 0; i < wait; i++) {
      if (++dot == 4) dot = 0;
      player.onScreenDisplay?.setActionBar(`Now loading${'.'.repeat(dot)}`);
      await sleep(1*20);
    }

    // タイトルメッセージ
    let text = '';
    for (const ch of 'Welcome!') {
      text += ch;
      player.onScreenDisplay?.setTitle(text, {
        fadeInDuration: 0,
        stayDuration: 1*20,
        fadeOutDuration: 0
      });

      player.playSound('note.bit');

      await sleep(2);
    }
  },
  priority: Priority.LOWEST
});
```

</details>

<details>

<summary>ボタンを押したときに木材のタイプをカウントダウン後に送信 (sleep使用)</summary>

```ts
import { Player } from '@minecraft/server';
import { EventManager, sleep } from 'keystonemc';

// ボタンを押したときに何のボタンかをカウントダウン後に送信
EventManager.registerAfter('buttonPush', {
  async handler(event) {
    const button = event.block;
    const player = event.source;
    if (!(player instanceof Player)) return;

    const screen = player.onScreenDisplay;

    const wait = 3;
    for (let i = wait; i > 0; i--) {
      if (screen.isValid) {
        screen.setActionBar(`${i}秒後にボタンのタイプを送信します`);
      }
      await sleep(1*20);
    }

    player.sendMessage(`${button.typeId}`);
  }
});
```

</details>

<br />

## フォーム
### ActionForm
```ts
import { createActionForm, button } from 'keystonemc';

createActionForm({
  title: '', // タイトル
  body: '', // 枠内の文字
  previousForm: undefined, // ひとつ前のフォーム (xや[ESC]入力で遷移) (省略可)
  buttons: [　// ここからボタン
    button({
      text: '', // ボタンの文字
      iconPath: '',　// アイコンのパス (例: textures/ui/icon_apple) (省略可)
      handler(player) {
        // ボタンを押したときの処理
      }
    }),
    // ... いっぱい入れれる
  ]
}).send(player); // 送信
```
or
```tsx
import { ActionForm as ActionFormType, debug } from 'keystonemc';
import { ActionForm, Button } from 'keystonemc/form/component';

const Home = (): ActionFormType => {
  return <ActionForm
    title="テスト"
  >
    <Button onClick={(player) => debug(player.name)}>
      test
    </Button>
  </ActionForm>;
};

// Home().send(player);
```
<br />

### ModalForm
```ts
import { createModalForm, toggle, textField, dropdown, slider } from 'keystonemc';

createModalForm({
  title: '', // タイトル
  previousForm: undefined, // ひとつ前のフォーム (xや[ESC]入力で遷移) (省略可)
  components: [ // ここからコンポーネント
    toggle({ // オンオフのトグル
      label: '', // トグルの右側の文字
      default: false, // デフォルトでオンオフどちらか
      handler(player, value) { 
        // サブミット後の処理
        // valueはboolean
      }
    }),
    textField({
      label: '', // テキストフィールドの上の文字
      placeholder: '', // 空白にした時薄く表示される文字 (省略可)
      default: '', // デフォルトで書かれてる文字 (省略可)
      handler(player, value) {
        // サブミット後の処理
        // valueはstring
      }
    }),
    dropdown({
      label: '', // ドロップダウンの上の文字
      options: [], // string[]。handlerで使うので、あらかじめ配列を宣言しておくべき
      defaultIndex: 0, // デフォルトで選択する配列のインデックス
      handler(player, value) {
        // サブミット後の処理
        // valueはnumber
        // あらかじめ宣言しておいた配列からデータの文字列をとる (例: opts[value])
      }
    }),
    slider({
      label: '', // スライダーの上の文字
      min: 1, // 最小値
      max: 8, // 最大値
      step: 1, // 刻みの数値 (デフォルトで1なので省略可)
      default: 1, // デフォルトの数値
      handler(player, value) {
        // サブミット後の処理
        // valueはnumber
      }
    })
  ]
}).send(player); // 送信
```
or
```tsx
import { ActionForm as ActionFormType, debug } from 'keystonemc';
import { Dropdown, ModalForm, Slider, Textfield, Toggle } from 'keystonemc/form/component';

const Home = (): ActionFormType => {
  return <ModalForm
    title="テスト"
    onSubmit={(player) => debug(debug)}
  >
    <Toggle
      label="テストトグル"
      defaultValue={false}
    />
    <Slider
      label="テストスライダー"
      min={0}
      max={10}
      step={1}
      defaultValue={5}
    />
    <Textfield
      label="テストテキストフィールド"
      placeholder="テキスト"
    />
    <Dropdown
      label="テストどろっぴダウン"
      options={['test1', 'test2']}
      defaultValueIndex={0}
    />
  </ModalForm>;
};

// Home().send(player);
```
<br />

### MessageForm
```ts
import { createMessageForm } from 'keystonemc';

createMessageForm({
  title: '', // タイトル
  previousForm: undefined, // ひとつ前のフォーム (xや[ESC]入力で遷移) (省略可)
  body: '', // 本文
  yes: { // 上のボタン
    text: '', // ボタンの文字
    handler(player) {
      // サブミット後の処理
    }
  },
  no: { // 下のボタン
    text: '', // ボタンの文字
    handler(player) {
      // サブミット後の処理
    }
  }
}).send(player); // 送信
```
<br />

### フォームの利用例

[デモ動画](https://www.youtube.com/watch?v=Ucp8uMzSm8c)

<details>

<summary>コード</summary>

```ts
import { EventManager, createActionForm, createMessageForm, createModalForm, button, dropdown, slider, textField, toggle } from 'keystonemc';

EventManager.registerAfter('itemUse', {
  handler(event) {
    if (event.itemStack.typeId !== 'minecraft:nether_star') return;

    getHome().send(event.source);
  }
});

function getHome() {
  return createActionForm({
    title: 'ActionForm',
    body: 'テキスト',
    buttons: [
      button({
        text: 'リンゴについて',
        iconPath: 'textures/ui/icon_apple',
        handler(player) {
          getApple().send(player);
        }
      }),
      button({
        text: 'ケーキについて',
        iconPath: 'textures/ui/icon_cake',
        handler(player) {
          getCake().send(player);
        }
      }),
      button({
        text: 'クッキーについて',
        iconPath: 'textures/ui/icon_cookie',
        handler(player) {
          getCookie().send(player);
        }
      }),
    ]
  });
}

function getApple() {
  return createModalForm({
    title: 'リンゴについて聞かせてね',
    previousForm: getHome(),
    components: [
      toggle({
        label: 'リンゴは好きかい？',
        default: false,
        handler(player, value) {
          player.sendMessage(`ほう。${value ? '好き' : '嫌い'}なんだね`);
        }
      }),
      textField({
        label: 'なんでかおしえてよ',
        placeholder: '空白は許さないよ',
        default: '消して理由を書いておくれ',
        handler(player, value) {
          player.sendMessage(`「${String(value)}」 ...。へぇ..`);
        }
      })
    ]
  });
}

function getCake() {
  const opts = [ 'チョコレートケーキ', 'ショートケーキ', 'モンブラン', 'チーズケーキ' ];
  return createModalForm({
    title: 'ケーキについて聞かせてね',
    previousForm: getHome(),
    components: [
      dropdown({
        label: '好きなケーキは？',
        options: opts,
        defaultIndex: 0,
        handler(player, value) {
          player.sendMessage(`へぇ、君は${opts[value]}が好きなんだね`);
        }
      }),
      slider({
        label: '一回に何切くらい食べれる？',
        min: 1,
        max: 8,
        default: 1,
        handler(player, value) {
          player.sendMessage(`そんでもって、一度に${String(value)}切食べれるんだね～`);
        }
      })
    ]
  });
}

function getCookie() {
  return createMessageForm({
    title: 'クッキーについて二択で質問するよ',
    previousForm: getHome(),
    body: 'ボクが君に高級なクッキーを買ってあげるよりも、恋人や友人からもらえるごく普通のバタークッキーの方が味も全て好きだって言うのかい？',
    yes: {
      text: '当然さ',
      handler(player) {
        player.sendMessage('ふん！');
      }
    },
    no: {
      text: '君からもらいたい',
      handler(player) {
          player.sendMessage('えへへ...');
      }
    }
  });
}
```

</details>
