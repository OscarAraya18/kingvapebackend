/* SETUP PARAMETERS */ 
var url = require('url');
var JSONDatabase = require('fs');
var express = require('express');
var backend = express();
var bodyParser = require('body-parser');
var cors = require('cors');

var connectionPort = process.env.PORT || 3030;
var userDatabaseLocation = 'userDatabase.json';
var productDatabaseLocation = 'productDatabase.json';
var cartDatabaseLocation = 'cartDatabase.json';
var orderDatabaseLocation = 'orderDatabase.json';
var categoryDatabaseLocation = 'categoryDatabase.json';
var informationDatabaseLocation = 'informationDatabase.json';

backend.use(bodyParser.json());
backend.use(cors());
backend.use(express.urlencoded({ extended: true }));

backend.use('/', (request, response, next) => {
    processQuery(url.parse(request.url, true).query, response);
});

/* DATABASE FUNCTIONS */
function readDatabase(databaseLocation){
    return JSON.parse(JSONDatabase.readFileSync(databaseLocation));
};
function saveDatabase(databaseLocation, JSONToSave){
    JSONDatabase.writeFile(databaseLocation, JSON.stringify(JSONToSave), () => {})
};

/* TRIGGER FUNCTIONS */
function triggerDeleteProduct(deletedProductCode){
    var cartDatabase = readDatabase(cartDatabaseLocation);
    var cartCodes = Object.keys(cartDatabase);
    for (cartCode of cartCodes){
        currentCartProductCodes = Object.keys(cartDatabase[cartCode]['products']);
        productExistsInCurrentCart = false;
        for (currentCartProductCode of currentCartProductCodes){
            if (currentCartProductCode == deletedProductCode){
                productExistsInCurrentCart = true;
                break;
            }
        }
        if (productExistsInCurrentCart){
            cartDatabase[cartCode]['deletedProducts'][deletedProductCode] = {productName: cartDatabase[cartCode]['products'][deletedProductCode]['productName'],
                                                                             productCategories: cartDatabase[cartCode]['products'][deletedProductCode]['productCategories'],
                                                                             productDescription: cartDatabase[cartCode]['products'][deletedProductCode]['productDescription'],
                                                                             productPrice: cartDatabase[cartCode]['products'][deletedProductCode]['productPrice'],
                                                                             productImages: cartDatabase[cartCode]['products'][deletedProductCode]['productImages']};
            delete cartDatabase[cartCode]['products'][deletedProductCode];
        }
    }
    saveDatabase(cartDatabaseLocation, cartDatabase);
};
function triggerUpdateProduct(updatedProductCode){
    var cartDatabase = readDatabase(cartDatabaseLocation);
    var productDatabase = readDatabase(productDatabaseLocation);
    var cartCodes = Object.keys(cartDatabase);
    for (cartCode of cartCodes){
        currentCartProductCodes = Object.keys(cartDatabase[cartCode]['products']);
        productExistsInCurrentCart = false;
        for (currentCartProductCode of currentCartProductCodes){
            if (currentCartProductCode == updatedProductCode){
                productExistsInCurrentCart = true;
                break;
            }
        }
        if (productExistsInCurrentCart){
            cartDatabase[cartCode]['products'][updatedProductCode] = {productName: productDatabase[updatedProductCode]['productName'],
                                                                      productCategories: productDatabase[updatedProductCode]['productCategories'],
                                                                      productDescription: productDatabase[updatedProductCode]['productDescription'],
                                                                      productPrice: productDatabase[updatedProductCode]['productPrice'],
                                                                      productImages: productDatabase[updatedProductCode]['productImages'],
                                                                      hasImage: productDatabase[updatedProductCode]['hasImage'],
                                                                      byMeters: productDatabase[updatedProductCode]['byMeters'],
                                                                      productColor: productDatabase[updatedProductCode]['productColor'],
                                                                      productAmount: cartDatabase[cartCode]['products'][updatedProductCode]['productAmount'],
                                                                      totalProductPrice: cartDatabase[cartCode]['products'][updatedProductCode]['productAmount'] * productDatabase[updatedProductCode]['productPrice']};
        }
    }
    saveDatabase(cartDatabaseLocation, cartDatabase);
};
function triggerDeleteAllProduct(){
    saveDatabase(cartDatabaseLocation, {});
};
function triggerDeleteCategory(deletedCategoryName){
    var productDatabase = readDatabase(productDatabaseLocation);
    var productCodes = Object.keys(productDatabase);
    for (productCode of productCodes){
        currentCategoryProductNames = Object.keys(productDatabase[productCode]['productCategories']);
        categoryExistsInCurrentProduct = false;
        for (currentCategoryProductName of currentCategoryProductNames){
            if (currentCategoryProductName == deletedCategoryName){
                categoryExistsInCurrentProduct = true;
                break;
            }
        }
        if (categoryExistsInCurrentProduct){
            productDatabase[productCode]['productCategories'].splice(productDatabase[productCode]['productCategories'].indexOf(deletedCategoryName), 1);
        }
    }
    saveDatabase(productDatabaseLocation, productDatabase);
    var cartDatabase = readDatabase(cartDatabaseLocation);
    var cartCodes = Object.keys(cartDatabase);
    for (cartCode of cartCodes){
        currentProductCartCodes = Object.keys(cartDatabase[cartCode]['products']);
        for (currentProductCartCode of currentProductCartCodes){
            currentCategoryProductCartNames = Object.keys(cartDatabase[cartCode]['products'][currentProductCartCode]['productCategories']);
            categoryExistsInCurrentProductInCurrentCart = false;
            for (currentCategoryProductCartName of currentCategoryProductCartNames){
                if (currentCategoryProductCartName == deletedCategoryName){
                    categoryExistsInCurrentProductInCurrentCart = true;
                    break;
                }
            }
            if (categoryExistsInCurrentProductInCurrentCart) {
                cartDatabase[cartCode]['products'][currentCartProductCode]['productCategories'].splice(cartDatabase[cartCode]['products'][currentProductCartCode]['productCategories'].indexOf(deletedCategoryName), 1);
            }
        }
    }
    saveDatabase(cartDatabaseLocation, cartDatabase);
};
function triggerDeleteAllCategory(){
    var productDatabase = readDatabase(productDatabaseLocation);
    var productCodes = Object.keys(productDatabase);
    for (productCode of productCodes){
        productDatabase[productCode]['productCategories'] = [];
    }
    saveDatabase(productDatabaseLocation, productDatabase);
    var cartDatabase = readDatabase(cartDatabaseLocation);
    var cartCodes = Object.keys(cartDatabase);
    for (cartCode of cartCodes){
        currentProductCartCodes = Object.keys(cartDatabase[cartCode]['products']);
        for (currentProductCartCode of currentCartProductCodes){
            cartDatabase[cartCode]['products'][currentProductCartCode]['productCategories'] = [];
        }
    }
    saveDatabase(cartDatabaseLocation, cartDatabase);
};

/* LOGIN FUNCTIONS */
function login(requestQuery, response){
    var userDatabase = readDatabase(userDatabaseLocation);
    var usernames = Object.keys(userDatabase);
    var userExists = false;
    for (username of usernames){
        if (requestQuery.username == username){
            userExists = true;
            break;
        }
    }
    if (userExists){
        if (userDatabase[requestQuery.username]['password'] == requestQuery.password){
            if (userDatabase[requestQuery.username]['profileType'] == 'admin'){
                var responseMessage = {error: false, responseID: 0};
            } else {
                var responseMessage = {error: false, responseID: 0.1};
            }
        } else {
            var responseMessage = {error: true, responseID: 0.1};
        }
    } else {
        var responseMessage = {error: true, responseID: 0};
    }
    response.end(JSON.stringify(responseMessage));
};

/* PRODUCT FUNCTIONS */
function readProduct(requestQuery, response){
    var productDatabase = readDatabase(productDatabaseLocation);
    var productCodes = Object.keys(productDatabase);
    var productExists = false;
    for (productCode of productCodes){
        if (requestQuery.productCode == productCode){
            productExists = true;
            break;
        }
    }
    if (productExists){
        var responseMessage = productDatabase[requestQuery.productCode];
        responseMessage['error'] = false;
        responseMessage['responseID'] = 1;
    } else {
        var responseMessage = {error: true, responseID: 1};
    }
    response.end(JSON.stringify(responseMessage));
};
function createProduct(requestQuery, response){
    var productDatabase = readDatabase(productDatabaseLocation);
    var productCodes = Object.keys(productDatabase);
    var productExists = false;
    for (productCode of productCodes){
        if (requestQuery.productCode == productCode){
            productExists = true;
            break;
        }
    }
    if (productExists){
        var responseMessage = {error: true, responseID: 2};
    } else {
        var productCategories = requestQuery.productCategories;
        if (typeof requestQuery.productCategories == 'string'){
            productCategories = [requestQuery.productCategories];
        }
        if (requestQuery.productName!=undefined && requestQuery.productCategories!=undefined && requestQuery.productDescription!=undefined && requestQuery.productPrice!=undefined){
            if (requestQuery.productImages!=undefined){
                if (requestQuery.productByMeters == "false"){
                    productDatabase[requestQuery.productCode] = { productName: requestQuery.productName,
                                                                productCategories: productCategories,
                                                                productDescription: requestQuery.productDescription,
                                                                productPrice: parseInt(requestQuery.productPrice),
                                                                byMeters: false,
                                                                productImages: requestQuery.productImages,
                                                                productColor: null,
                                                                hasImage: true};
                } else {
                    productDatabase[requestQuery.productCode] = { productName: requestQuery.productName,
                                                                productCategories: productCategories,
                                                                productDescription: requestQuery.productDescription,
                                                                productPrice: parseInt(requestQuery.productPrice),
                                                                byMeters: true,
                                                                productImages: requestQuery.productImages,
                                                                productColor: null,
                                                                hasImage: true};
                    }
            } else {
                if (requestQuery.productByMeters == "false"){
                    productDatabase[requestQuery.productCode] = { productName: requestQuery.productName,
                                                                productCategories: productCategories,
                                                                productDescription: requestQuery.productDescription,
                                                                productPrice: parseInt(requestQuery.productPrice),
                                                                byMeters: false,
                                                                productImages: null,
                                                                productColor: requestQuery.productColor,
                                                                hasImage: false};
                } else {
                    productDatabase[requestQuery.productCode] = { productName: requestQuery.productName,
                                                                productCategories: productCategories,
                                                                productDescription: requestQuery.productDescription,
                                                                productPrice: parseInt(requestQuery.productPrice),
                                                                byMeters: true,
                                                                productImages: null,
                                                                productColor: requestQuery.productColor,
                                                                hasImage: false};
                }
            }
            saveDatabase(productDatabaseLocation, productDatabase);
            var responseMessage = {error: false, responseID: 2};
        } else {
            var responseMessage = {error: true, responseID: 2.1};
        }
    }
    response.end(JSON.stringify(responseMessage));
};
function deleteProduct(requestQuery, response){
    var productDatabase = readDatabase(productDatabaseLocation);
    var productCodes = Object.keys(productDatabase);
    var productExists = false;
    for (productCode of productCodes){
        if (requestQuery.productCode == productCode){
            productExists = true;
            break;
        }
    }
    if (productExists){
        delete productDatabase[requestQuery.productCode];
        saveDatabase(productDatabaseLocation, productDatabase);
        triggerDeleteProduct(requestQuery.productCode);
        var responseMessage = {error: false, responseID: 3};
    } else {
        var responseMessage = {error: true, responseID: 3};
    }
    response.end(JSON.stringify(responseMessage));
};
function updateProduct(requestQuery, response){
    var productDatabase = readDatabase(productDatabaseLocation);
    var productCodes = Object.keys(productDatabase);
    var productExists = false;
    for (productCode of productCodes){
        if (requestQuery.productCode == productCode){
            productExists = true;
            break;
        }
    }
    if (productExists){
        if (typeof requestQuery.productCategories == 'string'){
            productCategories = [requestQuery.productCategories];
        } else {
            productCategories = requestQuery.productCategories;
        }
        if (requestQuery.productName!=undefined && requestQuery.productCategories!=undefined && requestQuery.productDescription!=undefined && requestQuery.productPrice!=undefined){
            if (requestQuery.productImages!=undefined){
                if (requestQuery.productByMeters == "false"){
                    productDatabase[requestQuery.productCode] = { productName: requestQuery.productName,
                                                                productCategories: productCategories,
                                                                productDescription: requestQuery.productDescription,
                                                                productPrice: parseInt(requestQuery.productPrice),
                                                                byMeters: false,
                                                                productImages: requestQuery.productImages,
                                                                productColor: null,
                                                                hasImage: true};
                } else {
                    productDatabase[requestQuery.productCode] = { productName: requestQuery.productName,
                                                                productCategories: productCategories,
                                                                productDescription: requestQuery.productDescription,
                                                                productPrice: parseInt(requestQuery.productPrice),
                                                                byMeters: true,
                                                                productImages: requestQuery.productImages,
                                                                productColor: null,
                                                                hasImage: true};
                    }
            } else {
                if (requestQuery.productByMeters == "false"){
                    productDatabase[requestQuery.productCode] = { productName: requestQuery.productName,
                                                                productCategories: productCategories,
                                                                productDescription: requestQuery.productDescription,
                                                                productPrice: parseInt(requestQuery.productPrice),
                                                                byMeters: false,
                                                                productImages: null,
                                                                productColor: requestQuery.productColor,
                                                                hasImage: false};
                } else {
                    productDatabase[requestQuery.productCode] = { productName: requestQuery.productName,
                                                                productCategories: productCategories,
                                                                productDescription: requestQuery.productDescription,
                                                                productPrice: parseInt(requestQuery.productPrice),
                                                                byMeters: true,
                                                                productImages: null,
                                                                productColor: requestQuery.productColor,
                                                                hasImage: false};
                }
            }
            saveDatabase(productDatabaseLocation, productDatabase);
            triggerUpdateProduct(requestQuery.productCode);
            var responseMessage = {error: false, responseID: 4};
        } else {
            var responseMessage = {error: true, responseID: 4.1};
        }
    } else {
        var responseMessage = {error: true, responseID: 4};
    }
    response.end(JSON.stringify(responseMessage));
};
function deleteAllProduct(response){
    saveDatabase(productDatabaseLocation, {});
    triggerDeleteAllProduct();
    var responseMessage = {error: false, responseID: 5};
    response.end(JSON.stringify(responseMessage));
};

/* CART FUNCTIONS */
function readCart(requestQuery, response){
    var cartDatabase = readDatabase(cartDatabaseLocation);
    var cartCodes = Object.keys(cartDatabase);
    var cartExists = false;
    for (cartCode of cartCodes){
        if (requestQuery.cartCode == cartCode){
            cartExists = true;
            break;
        }
    }
    if (cartExists){
        var responseMessage = {};
        responseMessage['cart'] = cartDatabase[requestQuery.cartCode];
        responseMessage['error'] = false;
        responseMessage['responseID'] = 6;
    } else {
        var responseMessage = {error: true, responseID: 6};
    }
    response.end(JSON.stringify(responseMessage));
};
function createCart(response){
    var cartDatabase = readDatabase(cartDatabaseLocation);
    var cartCodes = Object.keys(cartDatabase);
    var currentDate = new Date();
    var createdCartCode = 0;
    for (var cartCode of cartCodes){
        if (parseInt(cartCode) > createdCartCode){
            createdCartCode = parseInt(cartCode);
        }
    }
    createdCartCode = createdCartCode + 1;
    cartDatabase[createdCartCode.toString()] = {products: {},
                                     deletedProducts: {},
                                     cartCreationYear: currentDate.getFullYear(), 
                                     cartCreationMonth: currentDate.getMonth() + 1,
                                     cartCreationDay: currentDate.getDate(),
                                     cartCreationHour: currentDate.getHours(),
                                     cartCreationMinute: currentDate.getMinutes()};
    saveDatabase(cartDatabaseLocation, cartDatabase);
    var responseMessage = {createdCartCode: createdCartCode, error: false, responseID: 7};
    response.end(JSON.stringify(responseMessage));
};
function deleteCart(requestQuery, response){
    var cartDatabase = readDatabase(cartDatabaseLocation);
    var cartCodes = Object.keys(cartDatabase);
    var cartExists = false;
    for (cartCode of cartCodes){
        if (requestQuery.cartCode == cartCode){
            cartExists = true;
            break;
        }
    }
    if (cartExists){
        delete cartDatabase[requestQuery.cartCode];
        saveDatabase(cartDatabaseLocation, cartDatabase);
        var responseMessage = {error: false, responseID: 8};
    } else {
        var responseMessage = {error: true, responseID: 8};
    }
    response.end(JSON.stringify(responseMessage));
};
function addProductToCart(requestQuery, response){
    var cartDatabase = readDatabase(cartDatabaseLocation);
    var cartCodes = Object.keys(cartDatabase);
    var cartExists = false;
    for (cartCode of cartCodes){
        if (requestQuery.cartCode == cartCode){
            cartExists = true;
            break;
        }
    }
    if (cartExists){
        var productDatabase = readDatabase(productDatabaseLocation);
        var productCodes = Object.keys(productDatabase);
        var productExists = false;
        for (productCode of productCodes){
            if (requestQuery.productCode == productCode){
                productExists = true;
                break;
            }
        }
        if (productExists){
            var addedProductCodes = Object.keys(cartDatabase[requestQuery.cartCode]['products']);
            var productAlreadyOnCart = false;
            for (addedProductCode of addedProductCodes){
                if (requestQuery.productCode == addedProductCode){
                    productAlreadyOnCart = true;
                    break;
                }
            }
            if (productAlreadyOnCart){
                cartDatabase[requestQuery.cartCode]['products'][requestQuery.productCode]['productAmount'] = cartDatabase[requestQuery.cartCode]['products'][requestQuery.productCode]['productAmount'] + parseFloat(requestQuery.productAmount);
                cartDatabase[requestQuery.cartCode]['products'][requestQuery.productCode]['totalProductPrice'] = cartDatabase[requestQuery.cartCode]['products'][requestQuery.productCode]['productAmount'] * cartDatabase[requestQuery.cartCode]['products'][requestQuery.productCode]['productPrice'];
                var responseMessage = {error: false, responseID: 9.1};
            } else {
                cartDatabase[requestQuery.cartCode]['products'][requestQuery.productCode] = {productName: productDatabase[requestQuery.productCode]['productName'],
                                                                                             productCategories: productDatabase[requestQuery.productCode]['productCategories'],
                                                                                             productDescription: productDatabase[requestQuery.productCode]['productDescription'],
                                                                                             productPrice: productDatabase[requestQuery.productCode]['productPrice'],
                                                                                             productImages: productDatabase[requestQuery.productCode]['productImages'],
                                                                                             productColor: productDatabase[requestQuery.productCode]['productColor'],
                                                                                             hasImage: productDatabase[requestQuery.productCode]['hasImage'],
                                                                                             productAmount: parseFloat(requestQuery.productAmount),
                                                                                             totalProductPrice: productDatabase[requestQuery.productCode]['productPrice'] * parseFloat(requestQuery.productAmount)};
                var responseMessage = {error: false, responseID: 9};
            }
            saveDatabase(cartDatabaseLocation, cartDatabase);
        } else {
            var responseMessage = {error: true, responseID: 9.1};
        }
    } else {
        var responseMessage = {error: true, responseID: 9};
    }
    response.end(JSON.stringify(responseMessage));
};
function deleteProductFromCart(requestQuery, response){
    var cartDatabase = readDatabase(cartDatabaseLocation);
    var cartCodes = Object.keys(cartDatabase);
    var cartExists = false;
    for (cartCode of cartCodes){
        if (requestQuery.cartCode == cartCode){
            cartExists = true;
            break;
        }
    }
    if (cartExists){
        var productDatabase = readDatabase(productDatabaseLocation);
        var productCodes = Object.keys(productDatabase);
        var productExists = false;
        for (productCode of productCodes){
            if (requestQuery.productCode == productCode){
                productExists = true;
                break;
            }
        }
        if (productExists){
            var addedProductCodes = Object.keys(cartDatabase[requestQuery.cartCode]['products']);
            var productAlreadyOnCart = false;
            for (addedProductCode of addedProductCodes){
                if (requestQuery.productCode == addedProductCode){
                    productAlreadyOnCart = true;
                    break;
                }
            }
            if (productAlreadyOnCart){
                cartDatabase[requestQuery.cartCode]['products'][requestQuery.productCode]['productAmount'] = cartDatabase[requestQuery.cartCode]['products'][requestQuery.productCode]['productAmount'] - parseFloat(requestQuery.productAmount);
                cartDatabase[requestQuery.cartCode]['products'][requestQuery.productCode]['totalProductPrice'] = cartDatabase[requestQuery.cartCode]['products'][requestQuery.productCode]['productAmount'] * cartDatabase[requestQuery.cartCode]['products'][requestQuery.productCode]['productPrice'];
                if (cartDatabase[requestQuery.cartCode]['products'][requestQuery.productCode]['productAmount'] <= 0){
                    delete cartDatabase[requestQuery.cartCode]['products'][requestQuery.productCode];
                } else if (requestQuery.completelyDeleteProduct == '1'){
                    delete cartDatabase[requestQuery.cartCode]['products'][requestQuery.productCode];
                }
                saveDatabase(cartDatabaseLocation, cartDatabase);
                var responseMessage = {error: false, responseID: 10};
            } else {
                var responseMessage = {error: true, responseID: 10.2};
            }
        } else {
            var responseMessage = {error: true, responseID: 10.1};
        }
    } else {
        var responseMessage = {error: true, responseID: 10};
    }
    response.end(JSON.stringify(responseMessage));
};
function deleteAllCart(response){
    saveDatabase(cartDatabaseLocation, {});
    var responseMessage = {error: false, responseID: 11};
    response.end(JSON.stringify(responseMessage));
};

/* ORDER FUNCTIONS */
function readOrder(requestQuery, response){
    var orderDatabase = readDatabase(orderDatabaseLocation);
    var orderCodes = Object.keys(orderDatabase);
    var orderExists = false;
    for (orderCode of orderCodes){
        if (requestQuery.orderCode == orderCode){
            orderExists = true;
            break;
        }
    }
    if (orderExists){
        var responseMessage = orderDatabase[requestQuery.orderCode];
        responseMessage['error'] = false;
        responseMessage['responseID'] = 11;
    } else {
        var responseMessage = {error: true, responseID: 11};
    }
    response.end(JSON.stringify(responseMessage));
};
function createOrder(requestQuery, response){
    var cartDatabase = readDatabase(cartDatabaseLocation);
    var cartCodes = Object.keys(cartDatabase);
    var cartExists = false;
    for (cartCode of cartCodes){
        if (requestQuery.cartCode == cartCode){
            cartExists = true;
            break;
        }
    }
    if (cartExists){
        var orderDatabase = readDatabase(orderDatabaseLocation);
        var orderCodes = Object.keys(orderDatabase);
        var currentDate = new Date();
        var createdOrderCode = 0;
        for (orderCode of orderCodes){
            if (orderCode > createdOrderCode){
                createdOrderCode = orderCode;
            }
        }
        createdOrderCode = createdOrderCode + 1;
        var orderCode = currentDate.getFullYear().toString() + (currentDate.getMonth()+1).toString() + currentDate.getDate().toString() + '-WP-' + createdOrderCode.toString();
        orderDatabase[createdOrderCode] = {   orderFinished: false,
                                           customerName: requestQuery.customerName,
                                           customerSurnames: requestQuery.customerSurnames,
                                           customerPhoneNumber: requestQuery.customerPhoneNumber,
                                           customerEmailAddress: requestQuery.customerEmailAddress,
                                           customerZipCode: requestQuery.customerZipCode,
                                           customerAdditionalComment: requestQuery.customerAdditionalComment,
                                           customerProvince: requestQuery.customerProvince,
                                           customerCity: requestQuery.customerCity,
                                           customerStreet: requestQuery.customerStreet,
                                           orderPaymentMethod: requestQuery.orderPaymentMethod,
                                           orderType: requestQuery.orderType,
                                           orderCartCreationYear: cartDatabase[requestQuery.cartCode]['cartCreationYear'],
                                           orderCartCreationMonth: cartDatabase[requestQuery.cartCode]['cartCreationMonth'],
                                           orderCartCreationDay: cartDatabase[requestQuery.cartCode]['cartCreationDay'],
                                           orderCartCreationHour: cartDatabase[requestQuery.cartCode]['cartCreationHour'],
                                           orderCartCreationMinute: cartDatabase[requestQuery.cartCode]['cartCreationMinute'],
                                           orderCreationYear: currentDate.getFullYear(), 
                                           orderCreationMonth: currentDate.getMonth() + 1,
                                           orderCreationDay: currentDate.getDate(),
                                           orderCreationHour: currentDate.getHours(),
                                           orderCreationMinute: currentDate.getMinutes(),
                                           orderProducts: cartDatabase[requestQuery.cartCode]['products']};
        var responseMessage = {error: false, responseID: 13, orderCode: orderCode};
    } else {
        var responseMessage = {error: true, responseID: 13};
    }
    delete cartDatabase[requestQuery.cartCode];
    saveDatabase(cartDatabaseLocation, cartDatabase);
    saveDatabase(orderDatabaseLocation, orderDatabase);
    response.end(JSON.stringify(responseMessage));
};
function deleteOrder(requestQuery, response){
    var orderDatabase = readDatabase(orderDatabaseLocation);
    var orderCodes = Object.keys(orderDatabase);
    var orderExists = false;
    for (orderCode of orderCodes){
        if (requestQuery.orderCode == orderCode){
            orderExists = true;
            break;
        }
    }
    if (orderExists){
        delete orderDatabase[requestQuery.orderCode];
        saveDatabase(orderDatabaseLocation, orderDatabase);
        var responseMessage = {error: false, responseID: 14};
    } else {
        var responseMessage = {error: true, responseID: 14};
    }
    response.end(JSON.stringify(responseMessage));
};
function deleteAllOrder(response){
    saveDatabase(orderDatabaseLocation, {});
    var responseMessage = {error: false, responseID: 15};
    response.end(JSON.stringify(responseMessage));
};

/* CATEGORY FUNCTIONS */
function readCategory(requestQuery, response){
    var categoryDatabase = readDatabase(categoryDatabaseLocation);
    var categoryNames = Object.keys(categoryDatabase);
    var categoryExists = false;
    for (categoryName of categoryNames){
        if (requestQuery.categoryName == categoryName){
            categoryExists = true;
            break;
        }
    }
    if (categoryExists){
        var responseMessage = cartDatabase[requestQuery.categoryName];
        responseMessage['error'] = false;
        responseMessage['responseID'] = 16;
    } else {
        var responseMessage = {error: true, responseID: 16};
    }
    response.end(JSON.stringify(responseMessage));
};
function createCategory(requestQuery, response){
    var categoryDatabase = readDatabase(categoryDatabaseLocation);
    var categoryNames = Object.keys(categoryDatabase);
    var categoryExists = false;
    for (categoryName of categoryNames){
        if (requestQuery.categoryName == categoryName){
            categoryExists = true;
            break;
        }
    }
    if (categoryExists){
        var responseMessage = {error: true, responseID: 17};
    } else {
        categoryDatabase[requestQuery.categoryName] = {categoryDescription: requestQuery.categoryDescription}
        saveDatabase(categoryDatabaseLocation, categoryDatabase);
        var responseMessage = {error: false, responseID: 17};
    }
    response.end(JSON.stringify(responseMessage));
};
function deleteCategory(requestQuery, response){
    var categoryDatabase = readDatabase(categoryDatabaseLocation);
    var categoryNames = Object.keys(categoryDatabase);
    var categoryExists = false;
    for (categoryName of categoryNames){
        if (requestQuery.categoryName == categoryName){
            categoryExists = true;
            break;
        }
    }
    if (categoryExists){
        delete categoryDatabase[requestQuery.categoryName];
        saveDatabase(categoryDatabaseLocation, categoryDatabase);
        triggerDeleteCategory(requestQuery.categoryName);
        var responseMessage = {error: false, responseID: 18};
    } else {
        var responseMessage = {error: true, responseID: 18};
    }
    response.end(JSON.stringify(responseMessage));
};
function updateCategory(requestQuery, response){
    var categoryDatabase = readDatabase(categoryDatabaseLocation);
    var categoryNames = Object.keys(categoryDatabase);
    var categoryExists = false;
    for (categoryName of categoryNames){
        if (requestQuery.categoryName == categoryName){
            categoryExists = true;
            break;
        }
    }
    if (categoryExists){
        categoryDatabase[requestQuery.categoryName] = { categoryDescription: requestQuery.categoryDescription};
        saveDatabase(categoryDatabaseLocation, categoryDatabase);
        var responseMessage = {error: false, responseID: 19};
    } else {
        var responseMessage = {error: true, responseID: 19};
    }
    response.end(JSON.stringify(responseMessage));
};
function deleteAllCategory(response){
    saveDatabase(categoryDatabaseLocation, {});
    triggerDeleteAllCategory();
    var responseMessage = {error: false, responseID: 20};
    response.end(JSON.stringify(responseMessage));  
};

/* READ DATABASE FUNCTIONS */ 
function readAllProduct(response){
    var productDatabase = readDatabase(productDatabaseLocation);
    var responseMessage = {products: productDatabase, error: false, responseID: 21};
    response.end(JSON.stringify(responseMessage));
};
function readAllCart(response){
    var cartDatabase = readDatabase(cartDatabaseLocation);
    var responseMessage = {carts: cartDatabase, error: false, responseID: 22};
    response.end(JSON.stringify(responseMessage));
};
function readAllOrder(response){
    var orderDatabase = readDatabase(orderDatabaseLocation);
    var responseMessage = {orders: orderDatabase, error: false, responseID: 23}
    response.end(JSON.stringify(responseMessage));
};
function readAllCategory(response){
    var categoryDatabase = readDatabase(categoryDatabaseLocation);
    var responseMessage = {categories: categoryDatabase, error: false, responseID: 24};
    response.end(JSON.stringify(responseMessage));
};

/* FRONTEND INFORMATION FUNCTIONS */
function getFrontendInformation(response){
    var informationDatabase = readDatabase(informationDatabaseLocation);
    var responseMessage = {'error': false, 'responseID': 25, informationRequired: informationDatabase};
    response.end(JSON.stringify(responseMessage));
};
function setFrontendInformation(requestQuery, response){
    var informationDatabase = readDatabase(informationDatabaseLocation);
    informationDatabase[requestQuery.updatedInformation] = requestQuery.updatedInformationData;
    if (requestQuery.isJSON == 'yes'){
        informationDatabase[requestQuery.updatedInformation] = JSON.parse(requestQuery.updatedInformationData);
    }
    saveDatabase(informationDatabaseLocation, informationDatabase);
    var responseMessage = {'error': false, 'responseID': 26};
    response.end(JSON.stringify(responseMessage));
};

function loadCustomerInformation(requestQuery, response){
    var orderDatabase = readDatabase(orderDatabaseLocation);
    var orderCodes = Object.keys(orderDatabase);
    var customerExists = false;
    for (var orderCode of orderCodes){
        if (requestQuery.customerPhoneNumber == orderDatabase[orderCode].customerPhoneNumber){
            var responseMessage = {'error': false, 'responseID': 27, 'customerInformation': orderDatabase[orderCode]};
            customerExists = true;
            break;
        }
    }
    if (customerExists == false){
        var responseMessage = {'error': true, 'responseID': 27};
    }
    response.end(JSON.stringify(responseMessage));
}

function changeOrderState(requestQuery, response){
    var orderDatabase = readDatabase(orderDatabaseLocation);
    var orderCodes = Object.keys(orderDatabase);
    var orderExists = false;
    for (orderCode of orderCodes){
        if (requestQuery.orderCode == orderCode){
            orderExists = true;
            break;
        }
    }
    if (orderExists){
        if (requestQuery.orderFinished == 'yes'){
            orderDatabase[requestQuery.orderCode].orderFinished = true;
        } else {
            orderDatabase[requestQuery.orderCode].orderFinished = false;
        }
        saveDatabase(orderDatabaseLocation, orderDatabase);
        var responseMessage = {error: false, responseID: 28};
    } else {
        var responseMessage = {error: true, responseID: 28};
    }
    response.end(JSON.stringify(responseMessage));
}

function processQuery(requestQuery, response){
    response.set("Content-Security-Policy", "default-src 'self'");
    var queryType = requestQuery.queryType;
    if (queryType != undefined){
        if (queryType == 0){
            login(requestQuery, response);
        } else if (queryType == 1){
            readProduct(requestQuery, response);
        } else if (queryType == 2){
            createProduct(requestQuery, response);
        } else if (queryType == 3){
            deleteProduct(requestQuery, response);
        } else if (queryType == 4){
            updateProduct(requestQuery, response);
        } else if (queryType == 5){
            deleteAllProduct(response);
        } else if (queryType == 6){
            readCart(requestQuery, response);
        } else if (queryType == 7){
            createCart(response);
        } else if (queryType == 8){
            deleteCart(requestQuery, response);
        } else if (queryType == 9){
            addProductToCart(requestQuery, response);
        } else if (queryType == 10){
            deleteProductFromCart(requestQuery, response);
        } else if (queryType == 11){
            deleteAllCart(response);
        } else if (queryType == 12){
            readOrder(requestQuery, response);
        } else if (queryType == 13){
            createOrder(requestQuery, response);
        } else if (queryType == 14){
            deleteOrder(requestQuery, response);
        } else if (queryType == 15){
            deleteAllOrder(response);
        } else if (queryType == 16){
            readCategory(requestQuery, response);
        } else if (queryType == 17){
            createCategory(requestQuery, response);
        } else if (queryType == 18){
            deleteCategory(requestQuery, response);
        } else if (queryType == 19){
            updateCategory(requestQuery, response);
        } else if (queryType == 20){
            deleteAllCategory(response);
        } else if (queryType == 21){
            readAllProduct(response);
        } else if (queryType == 22){
            readAllCart(response);
        } else if (queryType == 23){
            readAllOrder(response);
        } else if (queryType == 24){
            readAllCategory(response);
        } else if (queryType == 25){
            getFrontendInformation(response);
        } else if (queryType == 26){
            setFrontendInformation(requestQuery, response);
        } else if (queryType == 27){
            loadCustomerInformation(requestQuery, response);
        } else if (queryType == 28){
            changeOrderState(requestQuery, response);
        }
    }
};

backend.listen(connectionPort);