process.env = require('./.env.js')(process.env.NODE_ENV || 'development');
const port = process.env.PORT || 9000;
const express = require('express');
const {google} = require('googleapis')

let indexRoutes = require('./routes/index.js');

const main = async () => {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use('/', indexRoutes);
    app.use('/masterTable', async (req,res)=>{
        try {
            // Creating authentication client
            const auth = new google.auth.GoogleAuth({
                keyFile: "credentials.json",
                scopes: "https://www.googleapis.com/auth/spreadsheets",
            });
    
            // Getting client instance
            const client = await auth.getClient();
    
            // Creating Google Sheets API instance with authenticated client
            const googleSheet = google.sheets({ version: "v4", auth: client });
    
            // Spreadsheet ID
            const spreadsheetID = "1bThE8Zj6j_cS6ZqSttoVwnJ1XFbNhGJVEWSYoYQxU7M";
    
            // Fetching metadata about the spreadsheet
            const metaData = await googleSheet.spreadsheets.get({
                auth,
                spreadsheetId: spreadsheetID  // Use "spreadsheetId" instead of "spreadsheetID"

            });

            //Reading rows from the spreadsheet 
            const getRows = await googleSheet.spreadsheets.values.get({
                auth,
                spreadsheetId: spreadsheetID ,
                range: "Batch_Expiring"
            });
            const rowsData = getRows.data.values;
        

    // Extract field names from the first row (assuming it contains the field names)
        const fields = rowsData[0];
    // Remove the first row (field names) from the rows data
        const values = rowsData.slice(1);
    // Map each row of values to an object with field names as keys
    const jsonData = values.map(row => {
        const obj = {};
        fields.forEach((field, index) => {
            obj[field] = row[index] || ""; // Use empty string if value is undefined
        });
        return obj;
    });
        //Log the resulting JSON object
        // console.log(jsonData)
        // Sending metadata as response
        res.json(jsonData);

        } catch (error) {
            // Handling errors
            console.error("Error fetching spreadsheet metadata:", error);
            res.status(500).send("Error fetching spreadsheet metadata");
        }
    }); 

    // app.use('/products', async (req, res) => {
    //     try {
    //         // Creating authentication client
    //         const auth = new google.auth.GoogleAuth({
    //             keyFile: "credentials.json",
    //             scopes: "https://www.googleapis.com/auth/spreadsheets",
    //         });
    
    //         // Getting client instance
    //         const client = await auth.getClient();
    
    //         // Creating Google Sheets API instance with authenticated client
    //         const googleSheet = google.sheets({ version: "v4", auth: client });
    
    //         // Spreadsheet ID
    //         const spreadsheetID = "1bThE8Zj6j_cS6ZqSttoVwnJ1XFbNhGJVEWSYoYQxU7M";
    
    //         // Fetching metadata about the spreadsheet
    //         // Reading rows from the spreadsheet 
    //         const getRows = await googleSheet.spreadsheets.values.get({
    //             auth,
    //             spreadsheetId: spreadsheetID,
    //             range: "products"
    //         });
    
    //         const rows = getRows.data.values;
    
    //         // Convert the array of arrays into objects
    //         const products = {};
    
    //         // Assuming the first row contains headers
    //         const headers = rows[0];
    
    //         // Iterate over the rest of the rows
    //         for (let i = 1; i < rows.length; i++) {
    //             const row = rows[i];
    //             const productType = row[0];
    //             const product = row[1];
    
    //             // If product type already exists, push the product into its array
    //             if (products.hasOwnProperty(productType)) {
    //                 products[productType].push(product);
    //             } else {
    //                 // If product type doesn't exist, create a new array with the product
    //                 products[productType] = [product];
    //             }
    //         }
    
    //         // Construct the final array of objects
    //         const result = Object.keys(products).map(productType => {
    //             return {
    //                 "Product Type": productType,
    //                 "Products": products[productType]
    //             };
    //         });
    
    //         res.json(result);
    //     } catch (error) {
    //         // Handling errors
    //         console.error("Error fetching spreadsheet data:", error);
    //         res.status(500).send("Error fetching spreadsheet data");
    //     }
    // })

    app.use('/products', async (req, res) => {
        try {
            // Creating authentication client
            const auth = new google.auth.GoogleAuth({
                keyFile: "credentials.json",
                scopes: "https://www.googleapis.com/auth/spreadsheets",
            });
    
            // Getting client instance
            const client = await auth.getClient();
    
            // Creating Google Sheets API instance with authenticated client
            const googleSheet = google.sheets({ version: "v4", auth: client });
    
            // Spreadsheet ID
            const spreadsheetID = "1bThE8Zj6j_cS6ZqSttoVwnJ1XFbNhGJVEWSYoYQxU7M";
    
            // Fetching metadata about the spreadsheet
            // Reading rows from the spreadsheet 
            const getRows = await googleSheet.spreadsheets.values.get({
                auth,
                spreadsheetId: spreadsheetID,
                range: "products"
            });
    
            const rows = getRows.data.values;
    
            // Convert the array of arrays into objects
            const products = {};
    
            // Assuming the first row contains headers
            const headers = rows[0];
    
            // Iterate over the rest of the rows
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                const productType = row[0];
                const product = row[1];
    
                // If product type already exists, push the product into its array
                if (products.hasOwnProperty(productType)) {
                    products[productType].push(product);
                } else {
                    // If product type doesn't exist, create a new array with the product
                    products[productType] = [product];
                }
            }
    
            // Construct the final object
            const result = {};
    
            // Iterate over the products object to restructure the data
            Object.keys(products).forEach(productType => {
                result[productType] = products[productType];
            });
    
            res.json(result);
        } catch (error) {
            // Handling errors
            console.error("Error fetching spreadsheet data:", error);
            res.status(500).send("Error fetching spreadsheet data");
        }
    })
    
    
    
    app.use('*',(req, res) => {
        res.status(404).send('404 Not Found')}); 
    app.listen(port, () =>
        console.log(`App now running and listening on port ${port}`)
    );
};
main();