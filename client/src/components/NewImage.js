import React from "react";
import { Button, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useMutation } from "@apollo/client";
import queries from "../queries";
import validator from "validator";
const NewImage = (props) => {
  const [addPost] = useMutation(queries.uploadImage);

  const useStyles = makeStyles((theme) => ({
    root: {
      "& .MuiTextField-root": {
        margin: theme.spacing(1),
        width: "25ch",
      },
    },
  }));

  const classes = useStyles();

  return (
    <div>
      <form
        className={classes.root}
        noValidate
        autoComplete="off"
        method="POST"
        onSubmit={(e) => {
          e.preventDefault();

          if (!e.target.elements.url.value) {
            alert("Please provide an Image URL");
            e.target.elements.url.focus();
          } else if (!validator.isURL(e.target.elements.url.value)) {
            alert("Please provide valid URL");
            e.target.elements.url.focus();
          } else {
            addPost({
              variables: {
                description: e.target.elements.description.value,
                url: e.target.elements.url.value,
                posterName: e.target.elements.author.value,
              },
            });

            e.target.elements.url.value = "";
            e.target.elements.description.value = "";
            e.target.elements.author.value = "";
            alert("Post Successfully Added");
          }
        }}
      >
        <TextField
          id="description"
          name="description"
          label="Description"
          InputLabelProps={{
            shrink: true,
          }}
          variant="outlined"
        />
        <br></br>
        <br></br>

        <TextField
          required
          id="url"
          name="url"
          label="Image URL"
          InputLabelProps={{
            shrink: true,
          }}
          variant="outlined"
        />
        <br></br>
        <br></br>

        <TextField
          id="author"
          name="author"
          label="Author Name"
          InputLabelProps={{
            shrink: true,
          }}
          variant="outlined"
        />
        <br></br>
        <br></br>

        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>
      </form>
    </div>
  );
};

export default NewImage;
