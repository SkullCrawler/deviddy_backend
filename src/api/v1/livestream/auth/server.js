const express = require('express');
const app = express();

app.use(express.urlencoded());
app.use(express.json()); // Parse JSON bodies

app.post("/api/v1/live/auth", function (req, res) {
  /* This server is only available to nginx */
  const streamkey = req.body.key;

  /* You can make a database of users instead :) */
  if (streamkey === "supersecret") {
    // Generate a unique streamId
    const streamId = generateStreamId();
    // Construct the URL with the streamId
    const streamUrl = `http://localhost:4444/stream/${streamId}`;
    console.log(streamUrl);
    // Respond with the stream URL
    res.status(200).send();
    return;
  }

  /* Reject the stream */
  res.status(403).send();
});

function generateStreamId() {
  // Generate a random streamId (You can implement your own logic here)
  return Math.random().toString(36).substring(7);
}

app.listen(8000, function () {
  console.log("Listening on port 8000!");
});
