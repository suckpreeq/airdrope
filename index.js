const { config } = require("dotenv");
const express = require("express");
const { connect } = require("mongoose");
const cors = require("cors");
const Users = require("./user.model");

const app = async () => {
  config();

  const app = express();
  app.use(
    cors({
      origin: [
        "http://localhost:5173",
        "https://www.airdrop.pepedawg.wtf",
        "https://airdrop.pepedawg.wtf",
        "www.airdrop.pepedawg.wtf",
        "www.airdrop.pepedawg.wtf/",
        "https://www.airdrop.pepedawg.wtf/",
        "https://airdrop.pepedawg.wtf/",
        "http://www.airdrop.pepedawg.wtf",
        "http://airdrop.pepedawg.wtf",
        "http://www.airdrop.pepedawg.wtf/",
        "http://airdrop.pepedawg.wtf/",
      ],
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  function isValidBEP20Address(address) {
    const re = /^0x[a-fA-F0-9]{40}$/;
    return re.test(address);
  }

  function isValidTwitterHandle(handle) {
    const re = /^@?([A-Za-z0-9_]{1,15})$/;
    return re.test(handle);
  }

  function isValidTelegramUsername(username) {
    const re = /^[a-zA-Z0-9_]{5,32}$/;
    return re.test(username);
  }

  app.post("/airdrop/submit", async (req, res) => {
    try {
      const { walletAddress, twitterHandle, telegramHandle } = req.body;

      if (
        !walletAddress?.trim() ||
        !twitterHandle?.trim() ||
        !telegramHandle?.trim()
      ) {
        return res.status(400).json({
          message: "Please provide all required fields",
        });
      }

      if (!isValidBEP20Address(walletAddress)) {
        return res.status(400).json({
          message: "Invalid BEP20 address",
        });
      }

      if (!isValidTelegramUsername(telegramHandle)) {
        return res.status(400).json({
          message: "Invalid Telegram username",
        });
      }

      if (!isValidTwitterHandle(twitterHandle)) {
        return res.status(400).json({
          message: "Invalid Twitter handle",
        });
      }

      const isExists = await Users.findOne({
        $or: [
          { twitterHandle: { $regex: new RegExp(`^${twitterHandle}$`, "i") } },
          {
            telegramHandle: { $regex: new RegExp(`^${telegramHandle}$`, "i") },
          },
          { walletAddress: { $regex: new RegExp(`^${walletAddress}$`, "i") } },
        ],
      });

      if (isExists) {
        if (
          isExists?.walletAddress?.toLowerCase() ===
          walletAddress?.toLowerCase()
        ) {
          return res.status(400).json({
            message: "Wallet address already exists",
          });
        }
        if (
          isExists?.twitterHandle?.toLowerCase() ===
          twitterHandle?.toLowerCase()
        ) {
          return res.status(400).json({
            message: "Twitter handle already exists",
          });
        }
        if (
          isExists?.telegramHandle?.toLowerCase() ===
          telegramHandle?.toLowerCase()
        ) {
          return res.status(400).json({
            message: "Telegram handle already exists",
          });
        }
      }

      const User = new Users({
        walletAddress,
        twitterHandle,
        telegramHandle,
      });

      if (req.body.ref) {
        const referal = await Users.findOne({
          walletAddress: { $regex: new RegExp(`^${walletAddress}$`, "i") },
        });

        if (referal) {
          User.referer = referal._id;
          referal.referals.push(User._id);
          await referal.save();
        }
      }

      await User.save();

      return res.status(201).json({
        message: "User created successfully",
      });
    } catch (error) {
      return res.status(500).json({
        message: "An error occurred while creating user",
        error: error.message,
      });
    }
  });

  const PORT = process.env.PORT || 3030;

  connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Database connected");
    })
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server is running on port http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

app();
