var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// var client = {
//     socket: null,
//     nickname: null
// };
var clients = new Set();

io.on('connection', (socket) => {

    console.log(socket.id + ' connected');

    var client = {
        id: socket.id,
        name: socket.id,
    };

    clients.add(client);
    //var msgLog = [];

    //broadcast updated player list
    io.emit('clientList', Array.from(clients));

    //process disconnect
    socket.on('disconnect', () => {
        console.log(socket.id + ' disconnected');

        // remove clients who disconnect
        clients.delete(client);

        //broadcast updated player list
        io.emit('clientList', Array.from(clients));
    });

    // normal message
    // socket.on('chatMsg', msg => {
    //     msgLog.push(msg);
    //     socket.emit('chatLog', msgLog);
    // });

    // nickname
    socket.on('name', n => {
        let msg = '';
        if (n) {
            var oldname = client.name;
            client.name = n;
            io.emit('clientList', Array.from(clients));
            msg = `Your name changed from ${oldname} to ${client.name}`;
        } else {
            msg = `Your name: ${client.name}`;
        }

        socket.emit('server', {
            event: 'serverMsg',
            name: 'Server',
            msg: msg
        });
        socket.emit('name', client.name);
    })

    //global chat
    socket.on('global', msg => {
        // msgLog.push(msg);
        // socket.emit('chatLog', msgLog);
        io.emit('global', {
            name: client.name,
            msg: msg
        });
    });


    //private messaging
    socket.on('client2client', data => {
        io.to(data.id).emit('server', {
            event: 'pm',
            id: socket.id,
            msg: data.msg,
            name: client.name
        });
    });
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});