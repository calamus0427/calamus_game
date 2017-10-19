var app = require("http").createServer()
var io = require('socket.io')(app)

var PORT = 3000 ;

var clientCount = 0 ;

app.listen(PORT)

io.on('connection',function(socket){
    clientCount ++ ;
    socket.nickName = 'user' + clientCount ;
    io.emit('enter',socket.nickName + 'comes in') ;

    socket.on('message',function(str){
        io.emit('message',socket.nickName + ' says: ' + str)
    })

    socket.on('disconnect',function(str){
        io.emit('leave',socket.nickName + 'left' )
    })
})

// var server = ws.createServer(function(conn){
//     console.log("New connection");
//     clientCount ++ ;
//     conn.nickName = 'user' + clientCount ;
//     var mes = {};
//     mes.type = "enter" ;
//     mes.data = conn.nickName + 'comes in' ;
//     broadCast(JSON.stringify(mes)) ;
//     conn.on("text",function(str){
//         console.log("Receiver"+str);
//         var mes = {};
//         mes.type = "message" ;
//         mes.data = conn.nickName + ' says: ' + str ;
//         broadCast(JSON.stringify(mes)) ;
//     })
//     conn.on("close",function(code,reason){
//         console.log("Connection closed");
//         var mes = {};
//         mes.type = "leave" ;
//         mes.data = conn.nickName + 'left' ;
//         broadCast(JSON.stringify(mes)) ;
//     })
//     conn.on("error",function(err){
//         console.log("handle err");
//         console.log(err);    
//     })
// }).listen(PORT)

console.log("websocket server listening on port :" + PORT );

// function broadCast(str){
//     server.connections.forEach(function(connection){
//         connection.sendText(str)
//     })
// }