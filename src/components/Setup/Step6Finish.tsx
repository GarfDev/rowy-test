import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";

import { Typography, Stack, RadioGroup, Radio } from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbUpOffIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbDownIcon from "@mui/icons-material/ThumbDownAlt";
import ThumbDownOffIcon from "@mui/icons-material/ThumbDownOffAlt";

import { name } from "@root/package.json";
import { analytics } from "analytics";
import { db } from "@src/firebase";

export default function Step6Finish() {
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    db.doc("_rowy_/settings").update({ setupCompleted: true });
  }, []);
  const [rating, setRating] = useState<"up" | "down" | undefined>();

  const handleRate = (e) => {
    setRating(e.target.value);
    analytics.logEvent("setup_rating", { rating: e.target.value });
    enqueueSnackbar("Thanks for your feedback!");
  };

  return (
    <>
      <Typography variant="body1" gutterBottom>
        You can now continue to {name} and create a table from your Firestore
        collections.
      </Typography>

      <Stack
        component="fieldset"
        spacing={1}
        direction="row"
        alignItems="center"
        justifyContent="center"
        sx={{ appearance: "none", p: 0, m: 0, border: "none" }}
      >
        <Typography variant="body1" component="legend">
          How was your setup experience?
        </Typography>

        <RadioGroup
          style={{ flexDirection: "row" }}
          value={rating}
          onChange={handleRate}
        >
          <Radio
            checkedIcon={<ThumbUpIcon />}
            icon={<ThumbUpOffIcon />}
            inputProps={{ "aria-label": "Thumbs up" }}
            value="up"
            color="secondary"
            disabled={rating !== undefined}
          />
          <Radio
            checkedIcon={<ThumbDownIcon />}
            icon={<ThumbDownOffIcon />}
            inputProps={{ "aria-label": "Thumbs down" }}
            value="down"
            color="secondary"
            disabled={rating !== undefined}
          />
        </RadioGroup>
      </Stack>
    </>
  );
}
