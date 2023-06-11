import { Button, makeStyles } from "@material-ui/core";
import React from "react";

const useStyles = makeStyles((theme) => ({
  stakeButton: {
    backgroundColor: "rgba(61 90 254)",
    color: "white",
    width: 130,
    height: 40,
    textTransform: "none",
    fontSize: 16,
    borderRadius: 10,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 5,
    marginBottom: 5,
    "&:hover": {
      background: "rgba(61 90 254)",
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: 12,
      color: "white",
      width: "100%",
      padding: "5px 20px 5px 20px",
    },
  },
  unstakeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "#f6f6f6",
    borderColor: "#f6f6f6",
    width: 130,
    height: 40,
    textTransform: "none",
    fontSize: 16,
    borderRadius: 10,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 5,
    marginBottom: 5,
    "&:hover": {
      background: "rgba(255, 255, 255, 0.3)",
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: 12,
      padding: "5px 20px 5px 20px",
      width: "100%",
    },
  },
}));

const CustomButton = ({
  onClick,
  children,
  variant = "primary",
  disabled = false,
  className,
}) => {
  const ownClasses = useStyles();
  return (
    <Button
      onClick={onClick}
      color="primary"
      disabled={disabled}
      className={[
        variant === "primary"
          ? ownClasses.stakeButton
          : ownClasses.unstakeButton,
        className,
      ].join(" ")}
    >
      {children}
    </Button>
  );
};

export default React.memo(CustomButton);
