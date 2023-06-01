// AWS CDKのコアモジュールを読み込む
const cdk = require('@aws-cdk/core');
// // AppSyncとAurora Serverlessを構成するCDKスタック
const { AppsyncAuroraServerlessStack } = require('../stack/appsync-aurora-serverless-stack');

// CDKアプリケーションを作成し、作成したスタックをアプリケーションに追加します。
const app = new cdk.App();

// AppSync, Auroraスタック作成
new AppsyncAuroraServerlessStack(app, 'AppsyncAuroraServerlessStack');

// CDKアプリケーションの内容を解析・生成します。
app.synth();