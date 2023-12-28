const { Server } = require("socket.io")
const SOCKET_PORT = 8015;
const emailToSocketMap = new Map();
const socketIdToEmailMap = new Map();
const io = new Server(SOCKET_PORT, {
    cors : true,
});

io.on("connection", (socket) => {
    socket.on("room:join",(data) => {
        const {room_id, email_id} = data;
        emailToSocketMap.set(email_id, socket.id)
        socketIdToEmailMap.set(socket.id, email_id);  
        io.to(room_id).emit("user:joined", {socket_id : socket.id, email_id});     
        socket.join(room_id);
        io.to(socket.id).emit("room:join", data) //allowed used to join
    })

    socket.on("user:call",(data) => {
        const {to, offer } = data;
        
        io.to(to).emit("incoming:call",{from :socket.id, offer});
    })

    socket.on("call:accepted",(data) => {
        const {to, ans } = data;
        io.to(to).emit("call:accepted",{from :socket.id, ans});
    })

    socket.on("peer:nego:needed", ({ to, offer }) => {
        io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
    });
    
    socket.on("peer:nego:done", ({ to, ans }) => {
        io.to(to).emit("peer:nego:final", { from: socket.id, ans });
    });
})
