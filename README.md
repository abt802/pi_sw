# pi_sw
RaspberryPiでks0212リレーシールドモジュールを制御

# 必要モジュール
* ks0212.py - リレー制御ライブラリ (https://gist.github.com/voodoojello/e7fd157c17eeced500c0922d6422ea62)

# インストール方法
* Raspberry Pi OS(bullseye)をインストールし、sshログイン可能な状態にする
* ApacheとPHPをインストール (sudo apt install apache2 php7.4 php7.4-mbstring php7.4-sqlite3)
* gpioグループにApacheユーザーを追加 (sudo gpasswd -a www-data gpio)
* プログラムを適当なディレクトリに設置
* libディレクトリにks0212.pyをコピー
* lib/db/pisw.db3ファイルにwrite属性付与 (chmod 666 pisw.db3)
* lib/config.iniを編集してWebUIのIDとPasswordを設定
* htdocsディレクトリをApacheのDocumentRootに設定

# WebUIによる操作
## トップ(ステータス)ページ
* スイッチNo.(1-4)のステータス
  * 黒：OFF
  * 緑：ON
  * 黄：ステータス不明
* ホストステータス
  * ▼メニューをクリックでスイッチ動作プリセットボタン表示

## スイッチ動作プリセット作成
* 右上のハンバーガーメニューから「Setting KS0212」をクリック
* 「Add Button」をクリック
* 対象のスイッチを選択(複数可)
* 動作を選択(PULSE動作の場合は秒数も指定)
* nameを設定し「Save」をクリック

## ホスト作成
* 右上のハンバーガーメニューから「Setting Host」をクリック
* 「Add Host」をクリック
* 一覧へ表示されるLabel名を設定
* Ping監視を行うIPを設定(任意)
* WOL機能を使う場合MACを設定(任意)
* 動作プリセットを選択(複数可)
* 「Save」をクリック

## HTTP GETによるWOL予約 確認/削除
* 右上のハンバーガーメニューから「WOL List」をクリック
* 「削除」をクリックで予約をキャンセル

# HTTP GETによるWOL発行
## WOL発行パラメータ(wol.php)
* mac=MAC_ADDRESS
* wait=初期待ち時間(default:1秒)
* loop=実行回数(default:1)
* interval=実行間隔(default:1秒)
* ip=PING先IP_ADDRESS

※ipを指定した場合は、ping応答がなくなるまで遅延実行します
> 例) wol.php?mac=MAC_ADDRESS&wait=初期待ち時間&loop=実行回数&interval=実行間隔&ip=PING先IP_ADDRESS

### 実行ステータス(HTTPレスポンス)
* 200 設定成功
* 400 設定失敗
* 409 既に設定済み
* 500 その他エラー

## WOLキャンセルパラメータ(wol_cancel.php)
* mac=MAC_ADDRESS
> 例) wol_cancel.php?mac=MAC_ADDRESS
>
> ※mac=ALL_RESETですべてキャンセル

# HTTP GETによるスイッチ操作
## スイッチ操作パラメータ(wol.php)
* sw=スイッチの番号(1-4)
* wait=初期待ち時間(default:1秒)
* interval=PING実行間隔(default:1秒)
* ip=PING先IP_ADDRESS
* duration=スイッチ動作時間(default:1秒)
> 例) wol.php?sw=スイッチ番号&wait=初期待ち時間&interval=実行間隔&ip=PING先IP_ADDRESS&duration=スイッチ動作時間

## スイッチ操作キャンセルパラメータ(wol_cancel.php)
* sw=スイッチの番号(1-4)
> 例) wol_cancel.php?sw=スイッチ番号

# ファイル構成
~~~
htdocs/
 - api.php
 - wol.php
 - wol_cancel.php
 - index.html
 img/
  - power_icon.png
 js/
  - Sortable.min.js
  - action.js
  - base.js
  - host_action.js
  - index.js
  - jquery-sortable.js
  - wol.js
 css/
  - button.css
  - index.css
lib/
 - config.ini
 - core.php
 - ks0212.py
 db/
  - pisw.db3
~~~
