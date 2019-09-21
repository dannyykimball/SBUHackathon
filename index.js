var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const room = "skyline";
const port = 3000;

var users = [];

var comp_id = "5d12a8eaf4294a3b9c6fecc5";

/*
---------------------------------------------------------------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------------------------------------------------------------

Socket.io (Index.js)

---------------------------------------------------------------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------------------------------------------------------------
*/

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});
//-------------------------------------------------Connected Users
io.on('connection', function(socket){
    socket.join(room);
    users.push(socket.id);
    console.log("Joined Room!");
    console.log('Connected! People online: ' + users.length + " ||| with id:" + socket.id);
    

    io.emit('users_online', users.length);
    io.emit('room_name', room);

    //init_loadMessages(socket.id);
});
//--------------------------------------------------Disconnected Users
io.on('connection', function(socket){
    socket.on('disconnect', function(){

        for(var i = 0; i<users.length; i++) //removes user from us
        {
            if(socket.id == users[i])
            {
                users.splice(i, 1); 
            }
        }
        io.emit('users_online', users.length);
        console.log('Disconnected! People online: ' + users.length  + " ||| with id:" + socket.id);
    });
});
//---------------------------------------------------Messaging
io.on('connection', function(socket){
    socket.on('sent_message', function(msg){

        saveMessage(comp_id,socket.id,msg); //saves message

        for(var i = 0; i<users.length; i++)
        {
            if(users[i] != socket.id)
            {
                io.emit('recieved_message', msg); //displays message to recipients
            }
        }
        io.sockets.connected[socket.id].emit('sent_message', msg); //displays message to sender
    });
});
//---------------------------------------------------Create User
io.on('connection', function(socket){
    socket.on('user created', function(user_tuple){
        createNewUser(user_tuple[0], user_tuple[1]);
    });
});
//---------------------------------------------------
http.listen(port, function(){
    console.log('listening on *:3000');
});

/*
---------------------------------------------------------------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------------------------------------------------------------

Messaging

---------------------------------------------------------------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------------------------------------------------------------
*/
async function init_loadMessages(socketid)
{
    var msgs = await getChatHistory(comp_id);

    for(var i = 0; i< msgs.length; i++)
    {
        if(msgs[i].senderID === socketid)
            io.sockets.connected[socketid].emit('load_message_right', msgs[i].message); //loads messages only for the person who just joins the chat
        else{
            io.sockets.connected[socketid].emit('load_message_left', msgs[i].message); //loads messages only for the person who just joins the chat
        }
    }
}

async function saveMessage(comp_id,userId, msg)
{
    var msgObj = new group_Message(userId, msg);
    var msgs = await addMessage(comp_id, msgObj);
    console.log("Saved Message");
}

/*
---------------------------------------------------------------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------------------------------------------------------------

Database (Account.js)

---------------------------------------------------------------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------------------------------------------------------------
*/
var async = require("async");
var MongoClient = require('mongodb').MongoClient;
var mongo_url = "mongodb+srv://kyritzb:Bryanmathew122@data-9xala.mongodb.net/test?retryWrites=true&w=majority"

const user_dbName = "User_data";
const user_collection_name = "user";


class User {

    /*
    username;
    password;
    email;
    userID;
    firstName;
    lastName;
    chat history; array of message objects
    */

    constructor(email, password)
    {
        this.username = "";
        this.password = password;
        this.email = email;
        this.userID = ""; 
        this.firstName = "";
        this.lastName = "";
        this.chatHistory = []; //will have both dm_message object and group_message ojects
    }

    getusername(){
        return this.username;
    }
    getpassword(){
        return this.password;
    }
    getEmail(){
        return this.email;
    }
    getUserID(){
        return this.userID;
    }
    getChatHistory(){
        return this.chatHistory;
    }

}

class dm_message
{
    /*
    sender_ID
    reciever_ID
    message
    time
    */
   constructor(senderID, recieverID, message, time)
   {
       this.senderID = senderID;
       this.recieverID = recieverID;
       this.message = message;
       this.time = time;
   }
   getSenderID(){
       return this.senderID;
   }
   getRecieverID(){
       return this.recieverID;
   }
   getMessage(){
       return this.message;
   }
   getTime(){
       return this.time;
   }
}

class group_Message 
{
    /*
    chat_ID
    sender_ID
    message
    time
    */
    constructor(senderID, message)
    {
        this.senderID = senderID;
        this.message = message;
    }
    getChatID(){
        return this.chatID;
    }
    getSenderID(){
        return this.senderID;
    }
    getMessage(){
        return this.message;
    }
    getTime(){
        return this.time;
    }

}
//----------------------------------------------------------------------------------------
//checks if user is in the database, if not then creates new user
async function createNewUser(user_email, user_name)
{
    var account_exists = await checkEmailExists(user_email);

    if(account_exists) //does not create user
    {
        console.log("User Exists");
    }
    else //creates user
    {
        var temp = new User(user_email, user_name);
        createUserAsync(temp);
    }
}
//----------------------------------------------------------------------------------------
//Updates a users username
//Takes in two parameters, a user object and a string thats the new Username 
function updateUsername(myUser, newUsername)
{
    var updated_User = new User(newUsername, myUser.password, myUser.email, myUser.userID);

    MongoClient.connect(mongo_url, function(err, client) 
    {
        if(!err) {
            const db = client.db(user_dbName);
            const collection = db.collection(user_collection_name);

            var myquery = myUser;
            var newvalues = { $set: {username: newUsername}};

            collection.updateOne(myquery, newvalues, function(err, res) {
                if (err) throw err;
                console.log("Updated username");
            });
            client.close();
            return false;
        }
        else{
          console.log(err);
        }
    });
}
//----------------------------------------------------------------------------------------
//Updates a users password
//Takes in two parameters, a user object and a string thats the new Password
function updatePassword(myUser, newPassword)
{
    var updated_User = new User(myUser.username, newPassword, myUser.email, myUser.userID);

    MongoClient.connect(mongo_url, function(err, client) 
    {
        if(!err) {
            const db = client.db(user_dbName);
            const collection = db.collection(user_collection_name);

            var myquery = myUser;
            var newvalues = { $set: {password: newPassword}};

            collection.updateOne(myquery, newvalues, function(err, res) {
                if (err) throw err;
                console.log("Updated password");
            });
            client.close();
            return false;
        }
        else{
          console.log(err);
        }
    });
}
//----------------------------------------------------------------------------------------
//Updates a users email
//Takes in two parameters, a user object and a string thats the new email
function updateEmail(myUser, newEmail)
{
    var updated_User = new User(myUser.username, myUser.password, newEmail, myUser.userID);

    MongoClient.connect(mongo_url, function(err, client) 
    {
        if(!err) {
            const db = client.db(user_dbName);
            const collection = db.collection(user_collection_name);

            var myquery = myUser;
            var newvalues = { $set: {email: newEmail}};

            collection.updateOne(myquery, newvalues, function(err, res) {
                if (err) throw err;
                console.log("Updated email");
            });
            client.close();
            return false;
        }
        else{
          console.log(err);
        }
    });
}
//----------------------------------------------------------------------------------------
//Checks if a username exists 
//returns a promise of [true] if username exists
//returns a promise of [false] if username doesnt exist
function checkUsernameExists(username_key)
{
    return new Promise(resolve => 
    {
        MongoClient.connect(mongo_url, function(err, client) 
        {
            if(!err) {
                const db = client.db(user_dbName);
                const collection = db.collection(user_collection_name);

                collection.find({}).toArray(function(err, result) {
                    if (err) throw err;
                    for(var i = 0; i< result.length; i++)
                    {
                        if(result[i].username == username_key)
                        {
                            console.log("found user");
                            resolve(true);
                        }
                    }
                });
                client.close();
                resolve(false);
            }
            else{
            console.log(err);
            }
        });
    });
}
//----------------------------------------------------------------------------------------
//Checks if a email exists 
//returns a promise of [true] if email exists
//returns a promise of [false] if email doesnt exist
function checkEmailExists(email_key)
{
    return new Promise(resolve => 
    {
        MongoClient.connect(mongo_url, function(err, client) 
        {
            if(!err) {
                const db = client.db(user_dbName);
                const collection = db.collection(user_collection_name);
    
                collection.find({}).toArray(function(err, result) {
                    if (err) throw err;
                    for(var i = 0; i< result.length; i++)
                    {
                        if(result[i].email == email_key)
                        {
                            resolve(true);
                        }
                    }
                });
                client.close();
                resolve(false);
            }
            else{
                console.log(err);
            }
        });
    });
}
//----------------------------------------------------------------------------------------
//returns a promise [object of user] if successful login
//returns a promise [false] if unsuccessful login
function loginUsername(username_key, user_password)
{
    return new Promise(resolve => 
    {
        MongoClient.connect(mongo_url, function(err, client) 
        {
            if(!err) {
                const db = client.db(user_dbName);
                const collection = db.collection(user_collection_name);

                collection.find({}).toArray(function(err, result) {
                    if (err) throw err;
                    for(var i = 0; i< result.length; i++)
                    {
                        if(result[i].username == username_key)
                        {
                            console.log("found user");
                            if(result[i].password == user_password){
                                console.log("successful login");
                                resolve(result[i]);
                            }
                            else{
                                console.log("wrong password");
                                resolve(false);
                            }
                        }
                    }
                });
                client.close();
                resolve(false);
            }
            else{
            console.log(err);
            }
        });
    });
}
//----------------------------------------------------------------------------------------
//returns a promise of [object of user] if successful login
//returns a promise of [false] if unsuccessful login
function loginEmail(email_key, user_password)
{
    return new Promise(resolve => 
    {
        MongoClient.connect(mongo_url, function(err, client) 
        {
            if(!err) {
                const db = client.db(user_dbName);
                const collection = db.collection(user_collection_name);

                collection.find({}).toArray(function(err, result) {
                    if (err) throw err;
                    for(var i = 0; i< result.length; i++)
                    {
                        if(result[i].email == email_key)
                        {
                            console.log("found user");
                            if(result[i].password == user_password){
                                console.log("successful login");
                                resolve(result[i]);
                            }
                            else{
                                console.log("wrong password");
                                resolve(false);
                            }
                        }
                    }
                });
                client.close();
                resolve(false);
            }
            else{
            console.log(err);
            }
        });
    });
}

//---------------------------------------------------------shows all
/*
collection.find({}).toArray(function(err, result) {
if (err) throw err;
console.log(result);
});
*/

//----------------------------------------------------------------------------------------
//Creates a new user given a user object
function createUser(new_User)
{
    MongoClient.connect(mongo_url, function(err, client) 
    {
        if(!err) {
          const db = client.db(user_dbName);
          const collection = db.collection(user_collection_name);
          collection.insertOne(new_User, (err, result) => {
              console.log("Added new User");
          })
      
        }
        else{
          console.log("Failed:");
          console.log(err);
        }
        client.close();
    });
}

//---------------------------------------------------------------------------------
//Creates a new user given a user object async
async function createUserAsync(new_User)
{
    MongoClient.connect(mongo_url, function(err, client) 
    {
        if(!err) {
          const db = client.db(user_dbName);
          const collection = db.collection(user_collection_name);
          collection.insertOne(new_User, (err, result) => {
              console.log("Added new User");
          })
      
        }
        else{
          console.log("Failed:");
          console.log(err);
        }
        client.close();
    });
}

//---------------------------------------------------------------------------------
//returns a user object given the user's ID
async function getUserByID(id_key)
{
    let response = await MongoClient.connect(mongo_url, function(err, client) 
    {
        if(!err) {
            const db = client.db(user_dbName);
            const collection = db.collection(user_collection_name);

            collection.find({}).toArray(function(err, result) {
                if (err) throw err;
                for(var i = 0; i< result.length; i++)
                {
                    if(result[i]._id == id_key)
                    {
                        console.log("Found!");
                        return true;
                    }
                }
            });
            client.close();
            return false;
        }
        else{
            console.log(err);
        }
    });

    if (response.err) 
    { 
        console.log('error');
    }
    else 
    { 
        console.log("Got Response");
    }
}

/*
---------------------------------------------------------------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------------------------------------------------------------

Database (Company.js)

---------------------------------------------------------------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------------------------------------------------------------
*/

class Company {

    /*
    name
    users [array of "strings" ids]
    messages [array of message objects]
    */

    constructor(name)
    {
        this.name = name;
        this.users = [];
        this.chatHistory = []; //will have both dm_message object and group_message ojects
    }

    getName(){
        return this.name;
    }
    getUsers(){
        return this.users;
    }
    getChatHistory(){
        return this.chatHistory;
    }
}

//var MongoClient = require('mongodb').MongoClient;
//var mongo_url = "mongodb+srv://kyritzb:Bryanmathew122@data-9xala.mongodb.net/test?retryWrites=true&w=majority";

const comp_dbName = "Company";
const comp_collection_name = "comp";

function who() 
{
    return new Promise(resolve => 
    {
        resolve('🤡');
    });
} 

//--------------------------------------------------------------------------------------------------
//checks if user is in the database, if not then creates new company
async function createNewCompany(name)
{
    var compExists = await checkCompanyExistsAsync(name);
    if(compExists) //does not create user
    {
        console.log("User Exists");
    }
    else //creates user
    {
        var temp = new Company(name);
        console.log("yeet");
        createCompanyAsync(temp);
    }
}

//--------------------------------------------------------------------------------------------------
//returns a promise [true] if account exists
//returns a promise [false] if account doesnt exist
//---------------------------------------------------------------------------------------------------
function checkCompanyExists(name_key)
{
    return new Promise(resolve => 
    {
        MongoClient.connect(mongo_url, function(err, client) 
        {
            if(!err) {
                const db = client.db(comp_dbName);
                const collection = db.collection(comp_collection_name);

                collection.find({}).toArray(function(err, result) {
                    if (err) throw err;
                    if(result.length == 0) //there are no companies
                    {
                        console.log("no companies");
                        return false;
                    }
                    for(var i = 0; i< result.length; i++)
                    {
                        if(result[i].name == name_key)
                        {
                            resolve(true);
                        }
                    }
                });
                client.close();
                resolve(false);
            }
            else{
                console.log(err);
            }
        });
    });
}
//---------------------------------------------------------------------------------
function getCompanyByID(id_key)
{
    return new Promise(resolve => 
    {
        MongoClient.connect(mongo_url, { useNewUrlParser: true }, function(err, client) 
        {
            if(!err) {
                const db = client.db(comp_dbName);
                const collection = db.collection(comp_collection_name);

                collection.find({}).toArray(function(err, result) {
                    if (err) throw err;
                    for(var i = 0; i< result.length; i++)
                    {
                        if(result[i]._id == id_key)
                        {
                            resolve(result[i]);
                        }
                    }
                });
                client.close();
                resolve(false);
            }
            else{
                console.log(err);
            }
        });
    });
}
//----------------------------------------------------------------------------------------
//Updates a company chat history
//Takes in two parameters, a user object and an array of strings of messages
function addMessage(comp_id, newmsg)
{
    var ObjectID = require('mongodb').ObjectID;

    console.log("YEet");
    return new Promise(resolve => 
    {
        MongoClient.connect(mongo_url,{ useNewUrlParser: true }, function(err, client) 
        {
                const db = client.db(comp_dbName);
                const collection = db.collection(comp_collection_name);

                var yeet = collection.updateOne(
                    { _id: new ObjectID(comp_id) },
                    {
                      $push: {
                        chatHistory: newmsg
                        
                      }
                    }
                 )
                resolve(true);
        });
    });
}
//----------------------------------------------------------------------------------------
function getChatHistory(comp_id) 
{
    return new Promise(resolve => 
    {
        MongoClient.connect(mongo_url, { useNewUrlParser: true }, function(err, client) 
        {
            if(!err) 
            {
                const db = client.db(comp_dbName);
                const collection = db.collection(comp_collection_name);
    
                collection.find({}).toArray(function(err, result) {
                    if (err) throw err;
                    for(var i = 0; i< result.length; i++)
                    {
                        if(result[i]._id == comp_id)
                        {
                            resolve(result[i].chatHistory);
                        }
                    }
                });
                client.close();
                return false;
            }
            else{
                console.log(err);
            }
        });
    });
}
//----------------------------------------------------------------------------------------
async function async_GetChatHistory(comp_id)
{
    const a = await getChatHistory(comp_id);
    console.log(a);
}