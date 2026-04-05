📰 News Dashboard - 完全独立型ニュースリーダーアプリ
News Dashboard は、サーバーを介さずGoogleニュースのRSSを直接取得し、サクサク快適に記事を閲覧できるAndroid向けニュースアプリです。React Native (Expo) を活用し、ダークモードやローカルでのお気に入り保存など、実用的な機能を備えています。

✨ 主な機能
🔥 トレンド表示: アプリ起動時に、その日の最新トレンドニュースを自動で取得して一覧表示。
🔍 キーワード検索: 任意のキーワードを入力し、関連するニュース記事を瞬時に検索。
🔄 柔軟な並び替え: 取得したニュースを「関連度順」「新着順」「古い順」に動的に並び替え可能。
⭐ お気に入り機能: 各記事の「★」ボタンをタップすると端末内にデータが保存され、専用タブからいつでも読み返しが可能。
🌙 ダークテーマ対応: 画面上部のボタンから、目に優しいダークモードとライトモードを瞬時に切り替え。

🛠 技術スタック
言語: JavaScript
フレームワーク: React Native / Expo
データ取得: Fetch API (Google News RSSのXMLを直接パース)
ローカル保存: AsyncStorage (@react-native-async-storage/async-storage)
UIコンポーネント: React Native Core Components (FlatList, SafeAreaView など)

🚀 セットアップ方法

依存関係のインストール
ターミナルを開き、プロジェクトのルートディレクトリ（mobile フォルダ）に移動後、必要なパッケージをインストールします：

Bash
npm install
Androidアプリのビルド
以下のコマンドを実行して、本番用のビルド（APKの生成）を開始します：

Bash
npx expo run:android --variant release
実機へのインストール
ビルド完了後、android/app/build/outputs/apk/release/ に生成される app-release.apk をAndroid端末に転送し、インストールを実行します。

📝 ライセンス
このプロジェクトは学習および個人利用の目的で作成されました。

💡 補足説明（開発者向け）
このREADME.mdは、プロジェクトの概要から導入までをスムーズに理解できるように構成しています。

フロントエンド完結: Flaskなどのバックエンドを廃止し、React Native側でCORSを気にせず直接XMLを取得・パースするアーキテクチャを採用しています。これにより、通信ラグのない高速な動作を実現しています。
ローカルデータ永続化: AsyncStorageを用いたお気に入り機能により、アプリを閉じても保存した記事のデータを保持できる実用的な設計となっています。
