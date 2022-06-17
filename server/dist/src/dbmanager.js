"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeRoom = exports.addRoom = exports.addMessage = exports.initDB = void 0;
const rooms_1 = require("./rooms");
const sqlite3 = require("sqlite3");
let db;
function initDB() {
    db = new sqlite3.Database('./chat.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err && err.code == "SQLITE_CANTOPEN") {
            createDatabase();
            return;
        }
        else if (err) {
            console.log("Getting error " + err);
        }
        createTables(db);
        runQueries(db);
    });
}
exports.initDB = initDB;
function addMessage(message) {
    if (db != null) {
        const stmt = db.prepare("insert into messages (room, username, message, time) values (?, ?, ?, ?)");
        stmt.bind(message.room, message.username, message.message, message.time);
        stmt.run();
    }
}
exports.addMessage = addMessage;
function addRoom(id, name) {
    const stmt = db.prepare("insert into rooms (id, name) values (?, ?)");
    stmt.bind(id, name);
    stmt.run();
}
exports.addRoom = addRoom;
function removeRoom(id) {
    db.exec("remove from rooms where id='" + id + "'");
}
exports.removeRoom = removeRoom;
function createDatabase() {
    console.log("Creating new database..");
    db = new sqlite3.Database('chat.db', (err) => {
        if (err) {
            console.log("Getting error " + err);
        }
    });
}
function createTables(db) {
    db.exec("create table if not exists messages (room varchar, username varchar, message varchar, time INTEGER)");
    db.exec("create table if not exists rooms (id varchar, name varchar)");
    try {
        db.exec("alter table messages add column room varcher default 0", (err) => {
        });
    }
    catch (exception) { }
}
function runQueries(db) {
    db.all("select * from rooms", (err, rows) => {
        if (rows === undefined)
            return;
        rows.forEach((row) => {
            rooms_1.rooms.set(row.id, new rooms_1.Room(row.id, row.name, new Array()));
        });
    });
    db.all("select * from messages", (err, rows) => {
        if (rows === undefined)
            return;
        rows.forEach((row) => {
            const room = rooms_1.rooms.get(row.room.toString());
            if (room != null) {
                room.history.push(new rooms_1.Message(row.room, row.username, row.message, row.time));
            }
        });
    });
}
