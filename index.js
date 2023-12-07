require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

mongoose.connect(
  process.env.MONGO_CONN_STRING,
).then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

const Product = mongoose.model('Product', {
  name: String,
  inStock: Boolean,
  basePrice: Number,
  brand: String,
});

const SpecialPrice = mongoose.model('SpecialPrice', {
  user_id: String,
  brand: String,
  discount: Number,
});

app.get('/', (req, res) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sneakers Store</title>
    </head>
    <body>
      <h1>Sneakers Store API</h1>
      <p>Dummy data</p>
      <p>{ name: 'Samba', inStock: true, basePrice: 50, brand: 'Adidas' }</p>
      <p>{ name: 'Air Jordan 1', inStock: false, basePrice: 60, brand: 'Nike' }</p>
      <p>{ user_id: '12345', brand: 'Adidas', discount: 10 }</p>
      <p>{ user_id: '67890', brand: 'Nike', discount: 5 }</p>
    </body>
    </html>
  `;
  res.send(htmlContent);
});

app.get('/products', async (req, res) => {
  try {
    const inStockProducts = await Product.find({ inStock: true });
    res.json(inStockProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/price/:user_id/:product', async (req, res) => {
  const { user_id, product } = req.params;

  try {
    const prod = await Product.findOne({ name: product.charAt(0).toUpperCase() + product.slice(1)});

    if (prod) {
      const specialPrice = await SpecialPrice.findOne({ user_id, brand: prod.brand });

      if (specialPrice) {
        const discountedPrice = prod.basePrice - (prod.basePrice * (specialPrice.discount / 100));
        res.json({user_id, discountedPrice});
      } else {
        res.json({user_id, basePrice: prod.basePrice});
      }
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

const server = app.listen(port, () => {
  console.log(`Server is running on port ${server.address().port}`);
});