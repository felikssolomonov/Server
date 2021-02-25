import { IncomingMessage, ServerResponse } from "http";

const { Router } = require("express");
const router = Router();

router.get("/", (req: any, res: any) => {
  res.status(200).json({ welcome: "Hello world!" });
});

module.exports = router;
