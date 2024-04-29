'use strict';
const request = require('request');
const PDFDocument = require('pdfkit');
const fs = require('fs');

module.exports = class QuickHeal_Message {
    constructor() {}

    async _fetchAssistant(url) {
        return new Promise((resolve, reject) => {
            request.get(url, (error, res, body) => {
                try {
                    if (error) {
                        reject(error);
                    } else {
                        resolve({
                            status: 'success',
                            data: JSON.parse(body),
                        });
                    }
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    async fetchDataFromURL(url) {
        return await this._fetchAssistant(url);
    }

//     async getProductsInCategory(productId) {
//         try {
//             const response = await this._fetchAssistant('http://localhost:9000/products');
//             console.log("selectedCategory;-- " , productId)
//             if (response.status === 'success') {
//                 const data = response.data;
//                 console.log("in getProductsInCategory data console :- ",data);
//                 // const product = data.find((item, index) => {
//                 //     return item => item["[Product]"] === productId ;
//                 // });       
//                 // Iterate over the keys of the data object
//     Object.keys(data).forEach(key => {
//     // Search for the product within the array for the current key
//     const foundProduct = data[key].find(product => product === productId);
//     // If the product is found, assign it to the 'product' variable and break the loop
//     console.log("foundProduct:---",foundProduct)
//     if (foundProduct) {
//        foundProduct;
//         return;
//     }
// });

// console.log("Found product:", foundProduct);         
//                 console.log("product :---", foundProduct)
//                 if (foundProduct) {
//                     return {
//                         status: 'success',
//                         data: foundProduct
//                     };
//                 } else {
//                     return {
//                         status: 'error',
//                         message: 'Product not found'
//                     };
//                 }
//             } else {
//                 return {
//                     status: 'error',
//                     message: 'Failed to fetch data'
//                 };
//             }
//         } catch (error) {
//             return {
//                 status: 'error',
//                 message: 'An error occurred while fetching data'
//             };
//         }
//     }

async getProductsInCategory(productId) {
    try {
        const response = await this._fetchAssistant('http://localhost:9000/products');
        console.log("selectedCategory;-- ", productId)
        if (response.status === 'success') {
            const data = response.data;
            console.log("in getProductsInCategory data console :- ", data);

            // Function to check if the property or its values match
            function hasPropertyOrValue(object, target) {
                // Check if the target is a property of the object
                if (object.hasOwnProperty(target)) {
                    return {
                        status: 'success',
                        data: object[target]
                    };
                }
                // If not, iterate over the object's keys and check if any value matches the target
                for (const key in object) {
                    if (Array.isArray(object[key]) && object[key].includes(target)) {
                        return {
                            status: 'success',
                            data: object[key]
                        };
                    }
                }
                // If neither the property nor any value matches the target, return an error
                return {
                    status: 'error',
                    message: 'Property or value not found'
                };
            }

            // Check if the provided productId exists as a key in the data object
            console.log("data.hasOwnProperty(productId) in getProductsInCategory :-- ", data.hasOwnProperty(productId))
            if (data.hasOwnProperty(productId)) {
                // Return the array of values associated with the productId
                console.log("Returned data in getProductsInCategory :----", data[productId]);
                return {
                    status: 'success',
                    data: data[productId]
                };
            } else {
                // If productId is not found as a key, check if it exists as a value in any property
                console.log("kuch problem h bhai")
                const res = hasPropertyOrValue(data, productId)
                console.log("else if ka res :--- ", res)
                if (res.status === 'success') {
                    return res; // Return the result from hasPropertyOrValue function
                } else {
                    // If neither the property nor any value matches the target, return an error
                    return {
                        status: 'error',
                        message: 'Product not found'
                    };
                }
            }
        } else {
            return {
                status: 'error',
                message: 'Failed to fetch data'
            };
        }
    } catch (error) {
        console.error("Error fetching products:", error);
        return {
            status: 'error',
            message: 'An error occurred while fetching data'
        };
    }
}

    async getAllCategories() {
        try {
            const response = await this._fetchAssistant('http://localhost:9000/masterTable');
            if (response.status === 'success') {
                const data = response.data;
                const categories = data.map(item => item["[Product Type]"]);
                const uniqueCategories = [...new Set(categories)]; // Remove duplicates
                console.log("categories :--", uniqueCategories);
                console.log("uniqueCategories :--",uniqueCategories)
                return {
                    status: 'success',
                    data: uniqueCategories
                };
            } else {
                return {
                    status: 'error',
                    message: 'Failed to fetch data'
                };
            }
        } catch (error) {
            return {
                status: 'error',
                message: 'An error occurred while fetching data'
            };
        }
    }
    
    // async getProductsInCategory(categoryId) {
    //     return await this._fetchAssistant(`/products/category/${categoryId}?limit=10`);
    // }

    generatePDFInvoice({ order_details, file_path }) {
        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(file_path));
        doc.fontSize(25);
        doc.text(order_details, 100, 100);
        doc.end();
        // Ensure the PDF generation is complete before returning
        return new Promise((resolve, reject) => {
            doc.on('end', () => {
                console.log(`PDF generated and saved at ${file_path}`);
                resolve();
            });
            doc.on('error', (error) => {
                console.error('Error generating PDF:', error);
                reject(error);
            });
        });
    }

    generateRandomGeoLocation() {
        let storeLocations = [
            {
                latitude: 44.985613,
                longitude: 20.1568773,
                address: 'New Castle',
            },
            {
                latitude: 36.929749,
                longitude: 98.480195,
                address: 'Glacier Hill',
            },
            {
                latitude: 28.91667,
                longitude: 30.85,
                address: 'Buena Vista',
            },
        ];
        return storeLocations[Math.floor(Math.random() * storeLocations.length)];
    }
};
