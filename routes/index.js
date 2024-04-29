'use strict';
const router = require('express').Router();
const QuickHeal_Message = require('../utils/quickHeal_Message')
let Store = new QuickHeal_Message();
const CustomerSession = new Map();

const WhatsappCloudAPI = require('whatsappcloudapi_wrapper');

const Whatsapp = new WhatsappCloudAPI({
    accessToken: process.env.Meta_WA_accessToken,
    senderPhoneNumberId: process.env.Meta_WA_SenderPhoneNumberId,
    WABA_ID: process.env.Meta_WA_wabaId, 
    graphAPIVersion: 'v14.0'
});
router.get('/meta_wa_callbackurl', (req, res) => {
    try {
        console.log('GET: Someone is pinging me!');

        let mode = req.query['hub.mode'];
        let token = req.query['hub.verify_token'];
        let challenge = req.query['hub.challenge'];

        if (
            mode &&
            token &&
            mode === 'subscribe' &&
            process.env.Meta_WA_VerifyToken === token
        ) {
            return res.status(200).send(challenge);
        } else {
            return res.sendStatus(403);
        }
    } catch (error) {
        console.error({error})
        return res.sendStatus(500);
    }
});

router.post('/meta_wa_callbackurl', async (req, res) => {
    try {
        console.log('POST: Someone is pinging me!');
        let data = Whatsapp.parseMessage(req.body);
        if (data?.isMessage) {
            let incomingMessage = data.message;
            let recipientPhone = incomingMessage.from.phone; // extract the phone number of sender
            let recipientName = incomingMessage.from.name;
            let typeOfMsg = incomingMessage.type; // extract the type of message (some are text, others are images, others are responses to buttons etc...)
            let message_id = incomingMessage.message_id; // extract the message id


// Start of cart logic
if (!CustomerSession.get(recipientPhone)) {
    CustomerSession.set(recipientPhone, {
        cart: [],
    });
}

let addToCart = async ({ product_id, recipientPhone }) => {
    console.log("addtoCart function me product_id",product_id);
    let product = await Store.getProductsInCategory(product_id);
    console.log("this is products in addToCart :---",product);
    if (product.status === 'success') {
        CustomerSession.get(recipientPhone).cart.push(product.data);
    }
};

let listOfItemsInCart = ({ recipientPhone }) => {
    let total = 0;
    let products = CustomerSession.get(recipientPhone).cart;
    console.log("this is product in listOfItemsInCart function :---",products)
    // total = products.reduce(
    //     (acc, product) => acc + product.price,
    //     total
    // );
    const increaseAmount = 1;

total = products.reduce(
    (acc) => acc + increaseAmount,
    total
);
    console.log("total products :--- ",total);
    let count = products.length;
    console.log("this Number of count :--",count)
    return { total, products, count };
};

let clearCart = ({ recipientPhone }) => {
    CustomerSession.get(recipientPhone).cart = [];
};
// End of cart logic
            if (typeOfMsg === 'text_message') {
                await Whatsapp.sendSimpleButtons({
                    message: `Hey ${recipientName}, \nThis is an Testing message.\nRenew the token`,
                    recipientPhone: recipientPhone,
                    listOfButtons: [
                        {
                            title: 'View some products',
                            id: 'see_categories',
                        },
                        {
                            title: 'Speak to a human',
                            id: 'speak_to_human',
                        },
                    ],
                });
            }
            if (typeOfMsg === 'simple_button_message') {
                let button_id = incomingMessage.button_reply.id;
            
                if (button_id === 'speak_to_human') {
                    await Whatsapp.sendText({
                        recipientPhone: recipientPhone,
                        message: `Arguably, chatbots are faster than humans.\nCall my human with the below details:`,
                    });
            
                    await Whatsapp.sendContact({
                        recipientPhone: recipientPhone,
                        contact_profile: {
                            addresses: [
                                {
                                    city: 'Mumbai',
                                    country: 'India',
                                },
                            ],
                            name: {
                                first_name: 'Mr. Bharat',
                                last_name: 'Mehta',
                            },
                            org: {
                                company: 'Shivam Corporation',
                            },
                            phones: [
                                {
                                    phone: '+1 (555) 025-3483',
                                },
                                                    {
                                    phone: '+8850820884',
                                },
                            ],
                        },
                    });
                }
                if (button_id === 'see_categories') {
                    let categories = await Store.getAllCategories(); 
                    await Whatsapp.sendSimpleButtons({
                        message: `We have several categories.\nChoose one of them.`,
                        recipientPhone: recipientPhone, 
                        listOfButtons: categories.data
                            .map((category) => ({
                                title: category,
                                id: `category_${category}`,
                            }))
                            .slice(0, 3)
                    });
                }
                
                    if (button_id.startsWith('category_')) {
                        let selectedCategory = button_id.split('category_')[1];
                        console.log("selectedCategory", selectedCategory);
                        
                        try {
                            let listOfProducts = await Store.getProductsInCategory(selectedCategory);
                            console.log('listOfProducts:', listOfProducts);
                            let listOfSections = [];
                            
                            if (listOfProducts.status === 'success') {
                                let rows = [];
                    
                                // Check if the data is an object
                                //if (typeof listOfProducts.data === 'object' && !Array.isArray(listOfProducts.data)) {
                                    listOfProducts.data.forEach((productId, index) => {
                                        // Create a unique ID for each row (you can use index or any other method)
                                        let id = 7863736742656745 + index;
                                        
                                        // Assuming you want to use the product ID itself as the title
                                        let title = productId.substring(0, 21);
                                        
                                        // Create a row for the product
                                        let row = {
                                            id,
                                            title: `${title}`,
                                            description: "this is one of our best products"
                                        };
                                        
                                        // Push the row to the rows array
                                        rows.push(row);
                                    });
                        
                                    // Push the row to the rows array
                                    // rows.push(row);
                                // } else {
                                //     console.error("listOfProducts.data is not an object or is an array");
                                // }
                    
                                // Push the section with rows to the listOfSections array
                                listOfSections.push({
                                    title: `🏆 Top 3: ${selectedCategory}`.substring(0, 24),
                                    rows,
                                });
                            } else {
                                console.error('Error fetching products:', listOfProducts.message);
                                // Handle the error appropriately, such as showing an error message to the user
                                // or retrying the operation.
                                return;
                            }
                    
                            await Whatsapp.sendRadioButtons({
                                recipientPhone: recipientPhone,
                                headerText: `#BlackFriday Offers: ${selectedCategory}`,
                                bodyText: `Our Santa 🎅🏿 has lined up some great products for you based on your previous shopping history.\n\nPlease select one of the products below:`,
                                footerText: 'Powered by: BMI LLC',
                                listOfSections,
                            });
                        } catch (error) {
                            console.error('Error occurred:', error);
                            // Handle the error appropriately, such as showing an error message to the user
                            // or retrying the operation.
                            return;
                        }
                    }
                
                if (button_id.startsWith('add_to_cart_')) {
                    let product_id = button_id.split('add_to_cart_')[1];
                    console.log("this is productID in addCart function:---",product_id);
                    await addToCart({ recipientPhone, product_id });
                    let numberOfItemsInCart = listOfItemsInCart({ recipientPhone }).count;
                    console.log("this is numberOfItemsInCart in add :---",numberOfItemsInCart)
                    await Whatsapp.sendSimpleButtons({
                        message: `Your cart has been updated.\nNumber of items in cart: ${numberOfItemsInCart}.\n\nWhat do you want to do next?`,
                        recipientPhone: recipientPhone, 
                        listOfButtons: [
                            {
                                title: 'Checkout 🛍️',
                                id: `checkout`,
                            },
                            {
                                title: 'See more products',
                                id: 'see_categories',
                            },
                        ],
                    });
                }

                //checkout
                if (button_id === 'checkout') {
                    let finalBill = listOfItemsInCart({ recipientPhone });
                    let invoiceText = `List of items in your cart:\n`;
                  
                    finalBill.products.forEach((item, index) => {
                        let serial = index + 1;
                        invoiceText += `\n#${serial}: ${item.title} @ $${item.price}`;
                    });
                  
                    invoiceText += `\n\nTotal: $${finalBill.total}`;
                  console.log("entering into generate pdf function :----")
                    Store.generatePDFInvoice({
                        order_details: invoiceText,
                        // file_path: `./invoice_${recipientName}.pdf`,
                        file_path: `./invoices/invoice_${recipientName}.pdf`
                    });
                  
                    await Whatsapp.sendText({
                        message: invoiceText,
                        recipientPhone: recipientPhone,
                    });
                  
                    await Whatsapp.sendSimpleButtons({
                        recipientPhone: recipientPhone,
                        message: `Thank you for shopping with us, ${recipientName}.\n\nYour order has been received & will be processed shortly.`,
                        message_id,
                        listOfButtons: [
                            {
                                title: 'See more products',
                                id: 'see_categories',
                            },
                            {
                                title: 'Print my invoice',
                                id: 'print_invoice',
                            },
                        ],
                    });
                  
                    clearCart({ recipientPhone });
                  }

                  if (button_id === 'print_invoice') {
                    // Send the PDF invoice
                  console.log("entering into sending pdf function :----")

                    await Whatsapp.sendDocument({
                        recipientPhone: recipientPhone,
                        caption:`Mom-N-Pop Shop invoice #${recipientName}`,
                        file_path: `./invoices/invoice_${recipientName}.pdf`,
                        mime_type: "application/pdf"
                    });
                  
                    // Send the location of our pickup station to the customer, so they can come and pick up their order
                    let warehouse = Store.generateRandomGeoLocation();
                  
                    await Whatsapp.sendText({
                        recipientPhone: recipientPhone,
                        message: `Your order has been fulfilled. Come and pick it up, as you pay, here:`,
                    });
                  
                    await Whatsapp.sendLocation({
                        recipientPhone, 
                        latitude: warehouse.latitude,
                        longitude: warehouse.longitude,
                        address: warehouse.address,
                        name: 'Mom-N-Pop Shop',
                    });
                  }

            };

            if (typeOfMsg === 'radio_button_message') {
                console.log("entering....")
                let selectionId = incomingMessage.list_reply.title; // the customer clicked and submitted a radio button
                console.log("selectionId :-- ", selectionId);
                console.log("incomingMessage :--",incomingMessage)
                if (selectionId) {
    //     let product_id = selectionId.split('_')[1];
    // console.log("product_ID :--",product_id)
    let product = await Store.getProductsInCategory(selectionId);
    // const { price, title, description, category, image: imageUrl, rating } = product.data;
    // const {title , description} = product.data
    // console.log("product.data :---!",product.data)

    let emojiRating = (rvalue) => {
        rvalue = Math.floor(rvalue || 0); // generate as many star emojis as whole number ratings
        let output = [];
        for (var i = 0; i < rvalue; i++) output.push('⭐');
        return output.length ? output.join('') : 'N/A';
    };
    // let text = `_Title_: *${title.trim()}*\n\n\n`;
    // text += `_Description_: ${description.trim()}\n\n\n`;
    // text += `_Price_: $${price}\n`;
    // text += `_Category_: ${category}\n`;
    // text += `${rating?.count || 0} shoppers liked this product.\n`;
    // text += `_Rated_: ${emojiRating(rating?.rate)}\n`;

    await Whatsapp.sendImage({
        recipientPhone,
        url: "https://newsd.in/wp-content/uploads/2020/10/quick-heal-1.jpg",
        caption: "this is caption",
    });

    
    await Whatsapp.sendSimpleButtons({
        message: `Here is the product, what do you want to do next?`,
        recipientPhone: recipientPhone, 
        listOfButtons: [
            {
                title: 'Add to cart🛒',
                id: `add_to_cart_${selectionId}`,
            },
            {
                title: 'Speak to a human',
                id: 'speak_to_human',
            },
            {
                title: 'See more products',
                id: 'see_categories',
            },
        ],
    });

}

            }
            
        }
        return res.sendStatus(200);
    } catch (error) {
                console.error({error})
        return res.sendStatus(500);
    }
});
module.exports = router;