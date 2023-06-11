import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  circle: {
    color: "#3d5afe",
    fontSize: 20,
  },
}));
const DotCircle = () => {
  const classes = useStyles();

  return <font className={classes.circle}>.</font>;
};

export default React.memo(DotCircle);
