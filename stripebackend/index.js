const cors = require("cors");
const express = require("express");
const stripe = require("stripe")(
  "sk_test_51IWOAMEb6PUzIM47s5BOSYZgXoVknAg23ytMsqcqfnRgOrtwjgYXSoY3PpMLGuzoLF5xn2LwzAk4FxPjtrDO8SKx00AqGcVykc"
);
const uuid = require("uuid");

const app = express();

//middleware

app.use(express.json());
app.use(cors());

//routes
app.get("/", (req, res) => {
  res.send("it works");
});


//payment code for the checkout without popup

app.post("/payment", cors(), async (req, res) => {
	let { amount, id } = req.body
	try {
		const payment = await stripe.paymentIntents.create({
			amount,
			currency: "CHF",
			description: "Gameboy",
			payment_method: id,
			confirm: true
		})
		console.log("Payment", payment)
		res.json({
			message: "Payment successful",
			success: true
		})
	} catch (error) {
		console.log("Error", error)
		res.json({
			message: "Payment failed",
			success: false
		})
	}
})


//payment code for the stripe popup payment method

app.post("/checkout", (res, req) => {
  const { product, token } = req.body;
  console.log("product", product);
  localStorage("price", product.price);
  const idempontencyKey = uuid();

  return stripe.cutomers
    .create({
      email: token.email,
      source: token.id,
    })
    .then((customer) => {
      stripe.charges.create({
        amount: product.price * 100,
        currency: "CHF",
        customer: customer.id,
        receipt_email: token.email,
        description: `purchase of product.name`,
      }),
        { idempontencyKey };
    })
    .then((result) => res.statusCode(200).json(result))
    .catch((err) => console.log(err));
});

//listener
app.listen(4000, () => console.log("listen port 400"));
