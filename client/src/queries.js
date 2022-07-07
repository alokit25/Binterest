import { gql } from '@apollo/client';

const binned = gql`
query binned{
    binnedImages{
    id
    url
    posterName
    description
    userPosted
    binned
    numBinned
    }
  }`;

const posted = gql`
query posted{
    userPostedImages{
    id
    url
    posterName
    description
    userPosted
    binned
    numBinned
    }
  }`;

  const unsplash = gql`
  query unsplash($pageNum: Int){
    unsplashImages(pageNum:$pageNum){
         id
    url
    posterName
    description
    userPosted
    binned
    numBinned
    }
  }`;

  const topbinned = gql`
  query topbinned{
    getTopTenBinnedPosts{
    id
    url
    posterName
    description
    userPosted
    binned
    numBinned 
    }
  }`;

  const uploadImage = gql`
  mutation uploadImage($url: String!, $description: String, $posterName: String){
    uploadImage(url:$url,description:$description,posterName:$posterName){
    id
    url
    posterName
    description
    userPosted
    binned
    numBinned
    }
  }`;

const deleteImage = gql`
mutation deleteImage($id: ID!){
    deleteImage(id:$id){
    id
    url
    posterName
    description
    userPosted
    binned
    numBinned
    }
  }`;

  const updateImage = gql`
  mutation updateImage($id: ID!, $url: String, $posterName: String, $description: String, $userPosted: Boolean, $binned: Boolean, $numBinned:Int){
    updateImage(id:$id,
    url:$url,posterName:$posterName,description:$description,userPosted:$userPosted,binned:$binned,numBinned:$numBinned){
    id
    url
    posterName
    description
    userPosted
    binned
    numBinned
    }
  }`;

  export default {
    binned,
    posted,
    unsplash,
    uploadImage,
    deleteImage,
    updateImage,
    topbinned
  };