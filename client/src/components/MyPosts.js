import "../App.css";
import queries from "../queries";
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, Grid, makeStyles } from "@material-ui/core";
import { useQuery, useMutation } from "@apollo/client";

const useStyles = makeStyles({
  card: {
    maxWidth: 250,
    height: "auto",
    marginLeft: "auto",
    marginRight: "auto",
    borderRadius: 5,
    border: "1px solid #1e8678",
    boxShadow: "0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);",
  },
  titleHead: {
    borderBottom: "1px solid #1e8678",
    fontWeight: "bold",
  },
  grid: {
    flexGrow: 1,
    flexDirection: "row",
  },
  media: {
    height: "250px",
    width: "250px",
  },
  button: {
    color: "#1e8678",
    fontWeight: "bold",
    fontSize: 12,
  },
});
const Images = () => {
  const classes = useStyles();
  let card = null;
  const { loading, data, refetch } = useQuery(queries.posted, {
    fetchPolicy: "cache-and-network",
    poll: 500,
  });
  const [removeFromBin] = useMutation(queries.updateImage);

  const [deleteImage] = useMutation(queries.deleteImage);

  const buildCard = (image) => {
    if (image.binned) {
      return (
        <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={image.id}>
          <Card className={classes.card} variant="outlined">
            <button
              className="navlink"
              onClick={() => {
                removeFromBin({
                  variables: {
                    id: image.id,
                    url: image.url,
                    description: image.description,
                    posterName: image.posterName,
                    binned: false,
                    userPosted: true,
                    numBinned: image.numBinned,
                  },
                });
                refetch();
              }}
            >
              Remove From Bin
            </button>

            <button
              className="navlink"
              onClick={() => {
                deleteImage({
                  variables: {
                    id: image.id,
                  },
                });
              }}
            >
              Delete Image
            </button>

            <img
              className={classes.media}
              src={image.url}
              title="image image"
              alt={image.posterName}
            />

            <CardContent>
              <p>{image.description ? image.description : "No Description"}</p>
              <p>{image.posterName ? image.posterName : "No Author"}</p>
            </CardContent>
          </Card>
        </Grid>
      );
    } else {
      return (
        <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={image.id}>
          <Card className={classes.card} variant="outlined">
            <button
              className="navlink"
              onClick={() => {
                removeFromBin({
                  variables: {
                    id: image.id,
                    url: image.url,
                    description: image.description,
                    posterName: image.posterName,
                    binned: true,
                    userPosted: true,
                    numBinned: image.numBinned,
                  },
                });
                refetch();
              }}
            >
              Add to Bin
            </button>

            <button
              className="navlink"
              onClick={() => {
                deleteImage({
                  variables: {
                    id: image.id,
                  },
                });
                refetch();
              }}
            >
              Delete Image
            </button>

            <img
              alt=""
              className={classes.media}
              src={image.url}
              title="image"
            />

            <CardContent>
              <p>{image.description ? image.description : "No Description"}</p>
              <p>{image.posterName ? image.posterName : "No Author"}</p>
            </CardContent>
          </Card>
        </Grid>
      );
    }
  };

  if (!loading && data.userPostedImages) {
    console.log(data.userPostedImages);
    card =
      data.userPostedImages &&
      data.userPostedImages.map((image) => {
        if (image !== null) return buildCard(image);
      });
  }

  if (loading) {
    return (
      <div>
        <h2>Loading....</h2>
      </div>
    );
  } else if (data.userPostedImages.length) {
    return (
      <div>
        <Link className="navlink" to="/new-post">
          Add a Post
        </Link>
        <br></br>
        <br></br>
        <Grid container className={classes.grid} spacing={5}>
          {card}
        </Grid>
      </div>
    );
  } else {
    return (
      <div>
        <h2>No Images Posted By User</h2>

        <Link className="navlink" to="/new-post">
          Add a Post
        </Link>
        <br></br>
      </div>
    );
  }
};
export default Images;
