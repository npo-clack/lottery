# 抽選システム

## setup

1. nodejsをローカルPCにインストールする。Macならnvmおすすめ。もしくはDockerから実行。
2. npm install

### Dockerから実行する場合

1. Docker for Desktopをインストール
2. (初回のみ)レポジトリのルートで`docker-compose build server`を実行。
3. `docker-compose run --rm server sh`を実行してコンテナに入る。
4. コンテナ内で`npm run start`を実行。

## 実行
sample.csvをdata.csvにファイル名を変更

ターミナルからコマンドを実行
```
npm run start
```

## 参考
https://xn--5ckwbr7a.jp/?p=4009

## アルゴリズム
前提: 名前はユニーク

1. 候補ごとに希望順位と作業順位をもとに配列を作成する。
2. 各候補の１つ目の人を当選配列に入れる。
3. 当選した人は以後は無効とする。
4. 各候補の２つ目の人を当選配列に入れる。
5. 以後すべての候補の配列が終わるまでこれを繰り返す。
