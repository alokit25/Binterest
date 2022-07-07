import React from "react";
import { Card, CardContent, Grid, makeStyles } from "@material-ui/core";
import "../App.css";
import { useQuery, useMutation } from "@apollo/client";
import queries from "../queries";

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
const BinnedImages = () => {
  const classes = useStyles();
  const { loading, data, refetch } = useQuery(queries.binned, {
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    poll: 500,
  });
  const [removeFromBin] = useMutation(queries.updateImage);
  let card = null;

  const buildCard = (image) => {
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
                  userPosted: image.userPosted,
                  numBinned: image.numBinned,
                },
              });
              refetch();
            }}
          >
            Remove From Bin
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
  };

  if (!loading && data.binnedImages) {
    card =
      data.binnedImages &&
      data.binnedImages.map((image) => {
        return buildCard(image);
      });
  }

  if (loading) {
    return (
      <div>
        <h2>Loading....</h2>
      </div>
    );
  } else if (data.binnedImages.length) {
    return (
      <div>
        <Grid container className={classes.grid} spacing={5}>
          {card}
        </Grid>
      </div>
    );
  } else {
    return (
      <div>
        <h2>No Binned Images</h2>
      </div>
    );
  }
};
export default BinnedImages;
