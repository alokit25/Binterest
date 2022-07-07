const { ApolloServer, gql } = require("apollo-server");
const uuid = require("uuid");
const bluebird = require("bluebird");
const redis = require("redis");
const client = redis.createClient();
const flat = require("flat");
const { default: Axios } = require("axios");
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const typeDefs = gql`
  type Query {
    unsplashImages(pageNum: Int): [ImagePost]
    binnedImages: [ImagePost]
    userPostedImages: [ImagePost]
    getTopTenBinnedPosts: [ImagePost]
  }

  type ImagePost {
    id: ID!
    url: String!
    posterName: String!
    description: String
    userPosted: Boolean!
    binned: Boolean!
    numBinned: Int!
  }

  type Mutation {
    uploadImage(
      url: String!
      description: String
      posterName: String
    ): ImagePost

    updateImage(
      id: ID!
      url: String
      posterName: String
      description: String
      userPosted: Boolean
      binned: Boolean
      numBinned: Int
    ): ImagePost

    deleteImage(id: ID!): ImagePost
  }
`;

const resolvers = {
  Query: {
    userPostedImages: async () => {
      let returnData = [];
      const data = await client.lrangeAsync("userPostedImages", 0, -1);
      if (data.length != 0) {
        for (let err of data) {
          const jsonImageFromRedis = await client.getAsync(err);
          const recomposedImage = JSON.parse(jsonImageFromRedis);
          returnData.push(recomposedImage);
        }
      }
      return returnData;
    },

    binnedImages: async () => {
      let returnData = [];

      const members = await client.zrevrangeAsync("binnedImages", 0, -1); 
      if (members.length != 0) {
        for (let err of members) {
          const jsonImageFromRedis = await client.getAsync(err);
          const recomposedImage = JSON.parse(jsonImageFromRedis);
          returnData.push(recomposedImage);
        }
        return returnData;
      }
      return returnData;
    },
    async unsplashImages(_, args) {
      let returnData = [];
      let imageData = {};

      try {
        const { data } = await Axios.get(
          "https://api.unsplash.com/photos?page=" +
            args.pageNum +
            "&client_id=76cIIC71tcFoeNuIpl3RuhIYoTji4n48EAFreslNslw"
        );

        let existBin;
        for (let arr of data) {
          imageData.id = arr.id;
          imageData.url = arr.urls.thumb;
          imageData.posterName = arr.user.name ? arr.user.name : "No Author";
          imageData.description = arr.description
            ? arr.description
            : arr.alt_description;
          imageData.userPosted = false;
          existBin = await client.getAsync(arr.id);
          if (existBin) imageData.binned = true;
          else imageData.binned = false;
          imageData.numBinned = arr.likes;
          returnData.push(imageData);
          imageData = {};
        }
      } catch (e) {
        return null;
      }

      return returnData;
    },
    async getTopTenBinnedPosts() {
      let returnData = [];

      const members = await client.zrevrangeAsync("binnedImages", 0, 9);
      if (members.length != 0) {
        for (let err of members) {
          const jsonImageFromRedis = await client.getAsync(err);
          const recomposedImage = JSON.parse(jsonImageFromRedis);
          returnData.push(recomposedImage);
        }
        return returnData;
      }
      return returnData;
    },
  },

  Mutation: {
    async uploadImage(_, args) {
      const redisId = uuid.v4();
      const newImage = {
        id: redisId,
        url: args.url,
        posterName: args.posterName,
        description: args.description,
        userPosted: true,
        binned: false,
        numBinned: 0,
      };

      client.rpush("userPostedImages", redisId, (err, _data) => {
        if (err) {
          return null;
        }
      });

      const jsonBio = JSON.stringify(newImage);
      await client.setAsync(redisId, jsonBio);

      const jsonImageFromRedis = await client.getAsync(redisId);
      const recomposedImage = JSON.parse(jsonImageFromRedis);

      return recomposedImage;
    },

    async updateImage(_, args) {
      let redisId = args.id;
      if (args.binned) {
        const newImage = {
          id: redisId,
          url: args.url,
          posterName: args.posterName,
          description: args.description,
          userPosted: args.userPosted,
          binned: args.binned,
          numBinned: args.numBinned,
        };

        client.zadd("binnedImages", args.numBinned, redisId);

        await client.delAsync(redisId);
        const jsonBio = JSON.stringify(newImage);
        await client.setAsync(redisId, jsonBio);
        const jsonImageFromRedis = await client.getAsync(redisId);
        const recomposedImage = JSON.parse(jsonImageFromRedis);

        return recomposedImage;
      } else {
        redisId = args.id;
        if (args.userPosted) {
          const newImage1 = {
            id: redisId,
            url: args.url,
            posterName: args.posterName,
            description: args.description,
            userPosted: args.userPosted,
            binned: args.binned,
            numBinned: args.numBinned,
          };

          client.zrem("binnedImages", args.numBinned, redisId);

          await client.delAsync(redisId);
          const jsonBio = JSON.stringify(newImage1);
          await client.setAsync(redisId, jsonBio);

          const jsonImageFromRedis = await client.getAsync(redisId);
          const recomposedImage = JSON.parse(jsonImageFromRedis);

          return recomposedImage;
        } else {

          client.zrem("binnedImages", redisId);
          const jsonImageFromRedis = await client.getAsync(redisId);
          const recomposedImage = JSON.parse(jsonImageFromRedis);
          await client.delAsync(redisId);
          return recomposedImage;
        }
      }
    },

    async deleteImage(_, args) {
      const jsonImageFromRedis = await client.getAsync(args.id);
      const recomposedImage = JSON.parse(jsonImageFromRedis);

      client.lrem("userPostedImages", 0, args.id, function (err, data) {
        if (err) {
          return null;
        }
      });

      if (recomposedImage.binned) {
        client.zrem("binnedImages", args.id);
      }
      await client.delAsync(args.id);

      return null;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url} 🚀`);
});
