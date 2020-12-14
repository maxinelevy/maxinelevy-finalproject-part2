//FINAL PROJECT PART 2
const express = require("express");
const app = express();
const listener = app.listen(process.env.PORT || 3000);

let bodyParser = require("body-parser");
app.use(bodyParser.raw({ type: "*/*" }));

let morgan = require("morgan");
app.use(morgan("combined"));

let cors = require("cors");
app.use(cors());

//SOURCE-CODE
app.get("/sourcecode", (req, res) => {res.send(require("fs").readFileSync(__filename).toString());});

//MAPS
let passwords = new Map();
let messages = new Map();
let listings = new Map();
let userCart = new Map();
let history = new Map();
let reviews = new Map();
let reviewItems = new Map();
let sellItems = new Map();
let shipItems = new Map();
let items = new Map();
let token = new Map();
let counterID = 150;

let tokenID = () => {counterID = counterID + 1;return "token" + counterID;};
let listingID = () => {counterID = counterID + 1;return "id" + counterID;};

//SIGNUP
app.post("/signup", (req, res) => {
  let parsedBody = JSON.parse(req.body);
  
  if (passwords.has(parsedBody.username)) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"Username exists"
      }));
    return;
    
  } else if (parsedBody.password == null) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"password field missing"
      }));
    return;
    
  } else if (parsedBody.username == null) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"username field missing"
      }));
    return;
  }
  
  if(!userCart.has(parsedBody.username)) {userCart.set(parsedBody.username, [])};
  if(!history.has(parsedBody.username)) {history.set(parsedBody.username, [])};
  
  passwords.set(parsedBody.username, parsedBody.password);
  
  res.send(
    JSON.stringify({
      success:true
    }));
});

//LOGIN
app.post("/login", (req, res) => {
  let parsedBody = JSON.parse(req.body);
  let username = parsedBody.username;
  let password = parsedBody.password;
  let expectedPassword = passwords.get(username);
  
  if(username == null) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"username field missing"
      }));
    return;
    
  } else if(!passwords.has(username)) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"User does not exist"
      }));
    return;
    
  } else if(password == null) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"password field missing"
      }));
    return;
  }
  
  if(password === expectedPassword) {
    let tokens = tokenID();
    token.set(tokens, username);
    res.send(
      JSON.stringify({
        success:true,
        token:tokens
      }));
    return;
    
  } else {
    res.send(
      JSON.stringify({
        success:false,
        reason:"Invalid password"
      }));
    return;
  }});

//CHANGE-PASSWORD
app.post("/change-password", (req, res) => {
  let parsedBody = JSON.parse(req.body);
  let tokens = req.headers.token;
  let users = token.get(tokens);
  let oldPassword = parsedBody.oldPassword;
  let newPassword = parsedBody.newPassword;
  let expectedPassword = passwords.get(users);
  
  if(tokens === undefined) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"token field missing"
      }));
    return;
    
  } else if(!token.has(tokens)) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"Invalid token"
      }));
    return;
    
  } else if(oldPassword !== expectedPassword) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"Unable to authenticate"
      }));
    return;
  }
  
  passwords.set(users, newPassword);
  
  res.send(
    JSON.stringify({
      success:true
    }));
});

//CREATE-LISTING
app.post("/create-listing", (req, res) => {
  let parsedBody = JSON.parse(req.body);
  let tokens = req.headers.token;
  let users = token.get(tokens);
  let priceItems = parsedBody.price;
  let descriptionItems = parsedBody.description;
  
  if(tokens === undefined) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"token field missing"
      }));
    return;
    
  } else if(!token.has(tokens)) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"Invalid token"
      }));
    return;
    
  } else if(priceItems === undefined) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"price field missing"
      }));
    return;
    
  } else if(descriptionItems === undefined) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"description field missing"
      }));
    return;
    
  }
  if(!sellItems.has(users)) {sellItems.set(users, []);};
  if(!shipItems.has(users)) {shipItems.set(users, []);};
  if(!reviews.has(users)) {reviews.set(users, []);};
  
  let listItems = sellItems.get(users);
  
  let itemID = listingID();
  
  let item = {price:priceItems, description:descriptionItems, seller:users};
  
  let sellItem = {price:priceItems, description:descriptionItems, sellerUsername:users, itemId:itemID};
  
  listings.set(itemID, item);
  items.set(itemID, item);
  listItems.push(sellItem);
  
  res.send(
    JSON.stringify({
      success:true,
      listingId:itemID
    }));
});

//LISTING
app.get("/listing", (req, res) => {
  let itemID = req.query.listingId;
  
  if(!listings.has(itemID)) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"Invalid listing id"
      }));
    return;
  }

  let item = listings.get(itemID);
  let price = item.price;
  let description = item.description;
  let seller = item.seller;
  
  res.send(
    JSON.stringify({
      success:true,
      listing:{price:price,
               description:description,
               itemId:itemID,
               sellerUsername:seller}
    }));
});

//MODIFY-LISTING
app.post("/modify-listing", (req, res) => {
  let parsedBody = JSON.parse(req.body);
  let tokens = req.headers.token;
  let users = token.get(tokens);
  let itemID = parsedBody.itemid;
  let listItem = sellItems.get(users);
  
  if(tokens === undefined) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"token field missing"
      }));
    return;
    
  } else if(!token.has(tokens)) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"Invalid token"
      }));
    return;
    
  } else if(itemID === undefined) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"itemid field missing"
      }));
    return;
  }
  
  let item = listings.get(itemID);
  let price = item.price;
  let description = item.description;
  
  if(parsedBody.price !== undefined) {
    price = parsedBody.price;
  } else if(parsedBody.description !== undefined) {
    description = parsedBody.description;
  }
  
  let modifiedItems = {price:price, description:description, seller:users};
  
  listings.set(itemID, modifiedItems);
  items.set(itemID, modifiedItems);
  
  let modifiedSellItem = {price:price, description:description, sellerUsername:users, itemId:itemID};
  for(let i = 0; i < listItem.length; i++) {
    if(listItem[i].itemId === itemID) {
      listItem.splice(i, 1, modifiedSellItem);
    }
  }
  
  res.send(
    JSON.stringify({
      success:true
    }));
})

//ADD-TO-CART
app.post("/add-to-cart", (req, res) => {
  let parsedBody = JSON.parse(req.body);
  let tokens = req.headers.token;
  let user = token.get(tokens);
  let cart = userCart.get(user);
  let itemID = parsedBody.itemid;
  
  if(!token.has(tokens)) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"Invalid token"
      }));
    return;
    
  } else if(itemID === undefined) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"itemid field missing"
      }));
    return;
    
  } else if(!listings.has(itemID)) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"Item not found"
      }));
  }
  
  let item = listings.get(itemID);
  let itemPrice = item.price;
  let itemDescription = item.description;
  let itemSeller = item.seller;
  
  cart.push({price:itemPrice, description:itemDescription, itemId:itemID, sellerUsername:itemSeller});
 
  res.send(
    JSON.stringify({
      success:true
    }));
})

//CART
app.get("/cart", (req, res) => {
  let tokens = req.headers.token;
  let users = token.get(tokens);
  let cart = userCart.get(users);
  
  if(!token.has(tokens)) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"Invalid token"
      }));
    return;
  }
  
    res.send(
      JSON.stringify({
        success:true,
        cart:cart
      }));
})

//CHECKOUT
app.post("/checkout", (req, res) => {
  let tokens = req.headers.token;
  let users = token.get(tokens);
  let cart = userCart.get(users);
  let userHistory = history.get(users);

 
 if(!token.has(tokens)) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"Invalid token"
      }));
    return;
   
  } else if(cart.length === 0) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"Empty cart"}));
    return;
  }
  
  for(let i = 0; i < cart.length; i++) {
    if(!listings.has(cart[i].itemId)) {
      res.send(
        JSON.stringify({
          success:false,
          reason:"Item in cart no longer available"
        }));
      return;
    } else {
      listings.delete(cart[i].itemId);
    }
  }
  
  Array.prototype.push.apply(userHistory, cart);
  cart = [];
  
  res.send(
    JSON.stringify({
      success:true
    }));
})


//PURCAHSE-HISTORY
app.get("/purchase-history", (req, res) => {
  let tokens = req.headers.token;
  let user = token.get(tokens);
  let userHistory = history.get(user);
  
  if(!token.has(tokens)) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"Invalid token"
      }));
    return;
  }
  
  res.send(
    JSON.stringify({
      success:true,
      purchased:userHistory
    }));
})

//CHAT
app.post("/chat", (req, res) => {
  let tokens = req.headers.token;
  let users = token.get(tokens);
  
  console.log("body: " + JSON.stringify(req.body));
  
  let parsedBody;
  let destination;
  let content;
  
  if(JSON.stringify(req.body) !== JSON.stringify({})) {
    parsedBody = JSON.parse(req.body);
    destination = parsedBody.destination;
    content = parsedBody.contents;
  }

  if(!token.has(tokens)) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"Invalid token"
      }));
    return;
    
  } else if(destination === undefined) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"destination field missing"
      }));
    return;
    
  } else if(content === undefined) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"contents field missing"
      }));
    return;
    
  } else if(!passwords.has(destination)) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"Destination user does not exist"
      }));
    return;
  }
  
  if(!messages.has(users+destination || destination+users)) {
    messages.set(users+destination, []);
    messages.set(destination+users, []);
  }
  let messageArray = messages.get(users+destination);
  let messageArrays = messages.get(destination+users);
  let msgs = {from:users, contents:content}
  
  console.log("array1: " + messageArray + " " + "array2: " + messageArrays + " " + "msg: " + msgs);
  
  messageArray.push(msgs);
  messageArrays.push(msgs);
  
  res.send(
    JSON.stringify({
      success:true
    }));
})

//CHAT-MESSAGES
app.post("/chat-messages", (req, res) => {
  let tokens = req.headers.token;
  let users = token.get(tokens);
  let parsedBody;
  let destination;
  let content;
  
  if(JSON.stringify(req.body) !== JSON.stringify({})) {
    parsedBody = JSON.parse(req.body);
    destination = parsedBody.destination;
    content = parsedBody.contents;
  }
  
  let messageList = messages.get(users+destination);

  if(!token.has(tokens)) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"Invalid token"
      }));
    return;
    
  } else if(destination === undefined) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"destination field missing"
      }));
    return;
    
  } else if(!passwords.has(destination)) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"Destination user not found"
      }));
    return;
  }
  
  res.send(
    JSON.stringify({
      success:true,
      messages:messageList}));
})

//SHIP
app.post("/ship", (req, res) => {
  let tokens = req.headers.token;
  let users = token.get(tokens);
  let parsedBody = JSON.parse(req.body);
  let itemId = parsedBody.itemid;
  let shippedItems = shipItems.get(users);

  if(listings.has(itemId)) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"Item was not sold"
      }));
    return;
    
  } else if(shippedItems.includes(itemId)) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"Item has already shipped"
      }));
    return;
    
  } else if(items.get(itemId).seller !== users) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"User is not selling that item"
      }));
    return;
  }
  
  shippedItems.push(itemId);
  
  res.send(
    JSON.stringify({
      success:true
    }));
})

//STATUS
app.get("/status", (req, res) => {
  let itemId = req.query.itemid;
  let item = items.get(itemId);
  let seller = item.seller;
  let shipped = shipItems.get(seller);

  if(listings.has(itemId)) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"Item not sold"
      }));
    return;
  } 
  
  if(shipped.includes(itemId)) {
    res.send(
      JSON.stringify({
        success:true,
        status:"shipped"
      }));
    
  } else {
    res.send(
      JSON.stringify({
        success:true,
        status:"not-shipped"
      }));
  }})

//REVIEW-SELLER
app.post("/review-seller", (req, res) => {
  let parsedBody = JSON.parse(req.body);
  let tokens = req.headers.token;
  let user = token.get(tokens);
  let stars = parsedBody.numStars;
  let content = parsedBody.contents;
  let itemID = parsedBody.itemid;
  let item = items.get(itemID);
  let seller = item.seller;
  let userHistory = history.get(user);
  let listReview = reviews.get(seller);
  console.log("item: " + JSON.stringify(item));
  console.log("seller: " + seller);


  if(!token.has(tokens)) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"Invalid token"
      }));
    return;
    
  } else if(reviewItems.has(itemID)) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"This transaction was already reviewed"
      }));
    return;
    
  } else if(!items.has(itemID) || !userHistory.some(item => item.itemId === itemID)) {
    res.send(
      JSON.stringify({
        success:false,
        reason:"User has not purchased this item"
      }))
    return;
  }
  
  let sellerReview = {from:user, numStars:stars, contents:content};
  listReview.push(sellerReview);
  reviewItems.set(itemID, sellerReview);
  
  res.send({
    success:true
  })})

//REVIEWS
app.get("/reviews", (req, res) => {
  let sellers = req.query.sellerUsername;
  let reviewList = reviews.get(sellers);
  
  res.send({
    success:true,
    reviews:reviewList
  });
})

//SELLING
app.get("/selling", (req, res) => {
  let sellers = req.query.sellerUsername;
  let listItem = sellItems.get(sellers);
  
  if(sellers === undefined) {
    res.send({
      success:false,
      reason:"sellerUsername field missing"
    });
    return;
  }
  
  res.send({
    success:true,
    selling:listItem
  });
});