
const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const cron = require('node-cron');
const bodyParser = require('body-parser');

require("dotenv").config();

// Connect to MongoDB
mongoose.connect('mongodb+srv://nituspj032001:F8oAESDd1T9x8hQV@cluster0.7r6chjr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Create a schema for cryptocurrencies
const cryptoSchema = new mongoose.Schema({
    id: String,
    name: String,
});

const Crypto = mongoose.model('Crypto', cryptoSchema);

const app = express();
const PORT = process.env.PORT || 3400;

app.use(express.json());

// Fetch and store cryptocurrencies
const fetchAndStoreCryptos = async () => {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/coins/list');
        const cryptos = response.data;

        // Clear existing data in the database
        await Crypto.deleteMany();

        // Insert new data
        await Crypto.insertMany(cryptos);
        console.log('Cryptocurrencies updated successfully.');
    } catch (error) {
        console.error('Error fetching and storing cryptocurrencies:', error);
    }
};



// Schedule background job to update cryptocurrencies every hour
cron.schedule('0 * * * *', fetchAndStoreCryptos);


// Routes
app.get('/cryptos', async (req, res) => {
    try {
        const cryptos = await Crypto.find();
        res.json(cryptos);
    } catch (error) {
        console.error('Error fetching cryptocurrencies:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Task 2

app.post('/getPrice', async (req, res) => {
    try {
        const { fromCurrency, toCurrency, date } = req.body;


        const fromCurrencyResponse = await axios.get(
            `https://api.coingecko.com/api/v3/coins/${fromCurrency}/history`,
            {
                params: {
                    date: date,
                    localization: false,
                },
            }
        );


        const toCurrencyResponse = await axios.get(
            `https://api.coingecko.com/api/v3/coins/${toCurrency}/history`,
            {
                params: {
                    date: date,
                    localization: false,
                },
            }
        );

        const fromCurrPriceData = fromCurrencyResponse.data.market_data.current_price['inr'];

        const toCurrPriceData = toCurrencyResponse.data.market_data.current_price['inr'];

        console.log("Pricedata", fromCurrPriceData);

        if (!(fromCurrPriceData && toCurrPriceData)) {
            return res.status(404).json({ error: 'Price data not available for the this date' });
        }


        console.log("Printing data")
        const relativePrice = (fromCurrPriceData / toCurrPriceData);


        return res.status(200).json({
            relativePrice,
            [fromCurrency]: relativePrice + " " + toCurrency,
        })



    } catch (error) {
        console.error('Error getting price:', error.message);
        res.status(500).json({ error: 'check your input data' });
    }
});




// Task 3


app.post('/getCompanies', async (req, res) => {
    try {
        const { currency } = req.body;
        const response = await axios.get(`https://api.coingecko.com/api/v3/companies/public_treasury/${currency.toLowerCase()}`);

        const companies = response.data;
        res.json({ companies });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



