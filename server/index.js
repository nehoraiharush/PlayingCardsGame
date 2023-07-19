import express from 'express';
const app = express();
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';

import { cards } from './cards.js';


const corsOptions = {
    origin: 'https://nehoraiharush.github.io',
    methods: ["GET", "POST"],
    credentials: true, // If your frontend and backend use cookies or authentication headers
};


app.use(cors(corsOptions))

import bp from 'body-parser';
import mongoose from "mongoose";

const mongoUrl = "mongodb+srv://nehorai883:jso8seew0@playingcarddb.0r6mcw4.mongodb.net/Scoreboard?retryWrites=true&w=majority";
const PORT = 3001;

app.use(bp.urlencoded({ extended: false }));
app.use(bp.json());

import Scoreboard from './Scoreboard.js'
app.use('/api/scoreboard', Scoreboard);


const server = http.createServer(app);


const io = new Server(server, {
    cors: {
        origin: 'https://nehoraiharush.github.io',
        methods: ["GET", "POST"],
        credentials: true
    }
});

const ShuffleCards = () => {
    const copiedCards = [...cards];

    for (let i = copiedCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copiedCards[i], copiedCards[j]] = [copiedCards[j], copiedCards[i]];
    }

    const length = copiedCards.length / 2;
    const shuffledMyCards = copiedCards.slice(0, length);
    const shuffledOppCards = copiedCards.slice(length);


    return [shuffledMyCards, shuffledOppCards];
};

let players = [];

// Store rooms and their corresponding players
let rooms = {};

io.on("connection", (socket) => {
    socket.on("send_card", (data) => {
        socket.to(data.selectedRoom).emit("recieve_card", data.selectedCard)
    });

    socket.on("gameOver", async (data) => {
        const sum = data.cards.reduce((sum, card) => sum + card.value, 0);
        if (rooms[data.room] && rooms[data.room][0] && rooms[data.room][1]) {
            if (sum > 436) {
                if (socket.id === rooms[data.room][0].id) { await rooms[data.room][0].emit("winner", sum); rooms[data.room][1].emit("loser"); }
                else if (socket.id === rooms[data.room][1].id) { await rooms[data.room][1].emit("winner", sum); rooms[data.room][0].emit("loser"); }
            }
            else if (sum === 436) {
                rooms[data.room][0].emit("TIEONPOINTS", sum);
                rooms[data.room][1].emit("TIEONPOINTS", sum);
            }
        }
    });

    socket.on("join_room", (name) => {
        if (!players.includes(socket.id)) {
            const shuffledCards = ShuffleCards()
            let room;
            // Check if there are available rooms with only one player
            const availableRooms = Object.keys(rooms).filter(
                (room) => rooms[room].length === 1
            );
            if (availableRooms.length > 0) {
                // Join an available room
                room = availableRooms[0];
                if (rooms[room][0].id !== socket.id) {
                    socket.join(room);
                    rooms[room].push(socket);
                }
            } else {
                // Create a new room
                room = `${name}'s room`; // Implement your own function to generate a unique room name
                socket.join(room);
                rooms[room] = [socket];
            }
            rooms[room].forEach(player => {
                player.emit('get_room_name', room);
            });
            // Check if the room has two players now
            if (rooms[room].length === 2) {
                // Divide the deck into two equal parts
                const player1Cards = shuffledCards[0];
                const player2Cards = shuffledCards[1];

                const flag = Math.random() < 0.5;

                rooms[room].forEach(player => {
                    player.emit("connected");
                });

                // Send cards to players in the room
                rooms[room][0].emit('get_my_cards', { cards: player1Cards, flag });
                rooms[room][1].emit('get_my_cards', { cards: player2Cards, flag: !flag });
            }
        }


    });
    socket.on('exit', (data) => {
        const room = data.selectedRoom;
        // Remove the player from the list of connected players
        players = players.filter((player) => player !== socket.id);
        // Remove the player from their room
        if (rooms[room] !== undefined) {
            rooms[room].map((player) => player.emit("disconnected"))
            rooms[room] = rooms[room].filter((player) => player !== socket);
            if (rooms[room].length < 2) {
                delete rooms[room];
            }
        }
    });

})


mongoose.connect(mongoUrl)
    .then(res => {
        server.listen(PORT, () => {
            console.log(`Server is running via port ${PORT}`);
        })
    })
    .catch(error => console.log(error.message))
