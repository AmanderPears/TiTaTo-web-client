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

    //game invite
    socket.on('gameInvite', id => {
        // console.log(`Game invite from ${client.id} to ${id}`);
        io.to(id).emit('inviteReceived', client);
    });

    socket.on('gameInviteResponse', data => {
        io.to(data.id).emit('gameInviteResponse', data.res);
    });

    socket.on('gameData', data => {
        let res = { data: data.data };

        let winner;
        let matchIndex = [
            //horizontal
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            //vertical
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            //diagonal
            [0, 4, 8], [2, 4, 6]
        ];

        matchIndex.some(m => {
            if (data.data[m[0]] == data.data[m[1]] && data.data[m[1]] == data.data[m[2]] && data.data[m[2]] != "") {
                winner = data.data[m[2]];
                return true;
            }
        });

        if (winner) {
            res['winner'] = winner;
            socket.emit('gameData', res);
        }

        io.to(data.id).emit('gameData', res);
    });
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});