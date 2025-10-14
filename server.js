const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

app.get('/', (req, res) => {
    res.send("Server is running");
});

// خريطة لتخزين المستخدمين المتصلين
let users = [];

io.on('connection', (socket) => {
    console.log('a user connected: ' + socket.id);

    // إضافة المستخدم الجديد
    users.push(socket.id);

    // اختيار شريك عشوائي
    if(users.length >= 2){
        let partnerId = users.find(id => id !== socket.id);
        io.to(socket.id).emit('partnerFound', partnerId);
        io.to(partnerId).emit('partnerFound', socket.id);
    }

    socket.on('disconnect', () => {
        console.log('user disconnected: ' + socket.id);
        users = users.filter(id => id !== socket.id);
    });

    // إعادة إرسال الرسائل
    socket.on('message', (data) => {
        io.to(data.to).emit('message', { from: socket.id, text: data.text });
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log('listening on port 3000');
});
