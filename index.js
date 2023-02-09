const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const cors = require("cors");

const token = "6091849404:AAFgYrALtGyfefCYvT3thIPyXh6eZT7IWTo";
const webAppUrl = "https://frolicking-palmier-3c38c3.netlify.app";

const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(express.json());
app.use(cors);

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "/start") {
    await bot.sendMessage(chatId, "Нижче з'явиться кнопка, заповніть форму", {
      reply_markup: {
        keyboard: [
          [{ text: "Заповнити форму", web_app: { url: webAppUrl + "/form" } }],
        ],
      },
    });

    await bot.sendMessage(
      chatId,
      "Заходьте в наш інтернет-магазин по кнопці нижче",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Зробити замовлення", web_app: { url: webAppUrl } }],
          ],
        },
      }
    );
  }

  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data);

      await bot.sendMessage(chatId, "Дякуємо, за зворотній зв'язок!");
      await bot.sendMessage(chatId, "Ваша країна: " + data?.country);
      await bot.sendMessage(chatId, "Ваше місто: " + data?.city);

      setTimeout(async () => {
        await bot.sendMessage(
          chatId,
          "Всю інформацію ви отримаєте в цьому чаті"
        );
      }, 3000);
    } catch (error) {
      console.log(error);
    }
  }
});

app.post("/web-data", async (req, res) => {
  const { querId, products, totalPrice } = req.body;

  try {
    await bot.answerWebAppQuery(querId, {
      type: "article",
      id: querId,
      title: "Вдала покупка",
      input_message_content: {
        message_text: `Вітаємо з покупкою, ви придбали товару на суму ${totalPrice} гривень`,
      },
    });

    return res.status(200).json({});
  } catch (error) {
    await bot.answerWebAppQuery(querId, {
      type: "article",
      id: querId,
      title: "Не вдалося придбати товар",
      input_message_content: {
        message_text: "Не вдалося придбати товар",
      },
    });

    return res.status(500).json({});
  }
});

const PORT = 8000;

app.listen(PORT, () => console.log(`server started on PORT ${PORT}`));
