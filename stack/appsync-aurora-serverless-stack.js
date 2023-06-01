// AWS CDKのコアモジュールを読み込む
const cdk = require('@aws-cdk/core');
// AWS CDKのAppSyncモジュールを読み込む
const appsync = require('@aws-cdk/aws-appsync');
// AWS CDKのRDSモジュールを読み込む
const rds = require('@aws-cdk/aws-rds');
// AWS CDKのEC2モジュールを読み込む
const ec2 = require('@aws-cdk/aws-ec2');

// AppSyncとAurora Serverlessを構成するCDKスタックを定義する
class AppsyncAuroraServerlessStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // VPCを作成する
    const vpc = new ec2.Vpc(this, 'AuroraVpc');

    // ServerlessのAuroraクラスタを作成する
    const cluster = new rds.ServerlessCluster(this, 'AuroraCluster', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_10_7,
      }),
      vpc,
      defaultDatabaseName: "test_db",
      scaling: { autoPause: cdk.Duration.minutes(10) },
    });

    // GraphQL APIを作成する
    const api = new appsync.GraphqlApi(this, 'Api', {
      name: 'sample-api',
      schema: appsync.Schema.fromAsset('schema/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365)),
          },
        },
      },
      xrayEnabled: true,
    });

    // Aurora Serverlessクラスタのシークレットを取得する
    const dbSecretStore = cluster.secret;
    if (!dbSecretStore) {
      throw new Error('Secret not created for the Aurora Serverless cluster');
    }

    // Auroraクラスタに接続するデータソースをAPIに追加する
    const auroraDs = api.addRdsDataSource('AuroraDataSource', cluster, dbSecretStore);

    // リゾルバを作成する
    // Query: getAllMessages
    // getAllMessagesというクエリのリゾルバを作成します。
    auroraDs.createResolver({
      typeName: 'Query',
      fieldName: 'getAllMessages',
      requestMappingTemplate: appsync.MappingTemplate.fromFile('resolvers/Query.getAllMessages.req.vtl'),
      responseMappingTemplate: appsync.MappingTemplate.fromFile('resolvers/Query.getAllMessages.res.vtl'),
    });

    // Query: getMessageById
    // getMessageByIdというクエリのリゾルバを作成します。
    auroraDs.createResolver({
      typeName: 'Query',
      fieldName: 'getMessageById',
      requestMappingTemplate: appsync.MappingTemplate.fromFile('resolvers/Query.getMessageById.req.vtl'),
      responseMappingTemplate: appsync.MappingTemplate.fromFile('resolvers/Query.getMessageById.res.vtl'),
    });

    // Mutation: createMessage
    // createMessageというミューテーションのリゾルバを作成します。
    auroraDs.createResolver({
      typeName: 'Mutation',
      fieldName: 'createMessage',
      requestMappingTemplate: appsync.MappingTemplate.fromFile('resolvers/Mutation.createMessage.req.vtl'),
      responseMappingTemplate: appsync.MappingTemplate.fromFile('resolvers/Mutation.createMessage.res.vtl'),
    });

    // Mutation: updateMessage
    // updateMessageというミューテーションのリゾルバを作成します。
    auroraDs.createResolver({
      typeName: 'Mutation',
      fieldName: 'updateMessage',
      requestMappingTemplate: appsync.MappingTemplate.fromFile('resolvers/Mutation.updateMessage.req.vtl'),
      responseMappingTemplate: appsync.MappingTemplate.fromFile('resolvers/Mutation.updateMessage.res.vtl'),
    });

    // Mutation: deleteMessage
    // deleteMessageというミューテーションのリゾルバを作成します。
    auroraDs.createResolver({
      typeName: 'Mutation',
      fieldName: 'deleteMessage',
      requestMappingTemplate: appsync.MappingTemplate.fromFile('resolvers/Mutation.deleteMessage.req.vtl'),
      responseMappingTemplate: appsync.MappingTemplate.fromFile('resolvers/Mutation.deleteMessage.res.vtl'),
    });
  }
}

module.exports = { AppsyncAuroraServerlessStack };

