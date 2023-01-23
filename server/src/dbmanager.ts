import { createRoomWithId, Message, Room, rooms } from "./rooms";

const sqlite3 = require("sqlite3");

let db: any;

export function initDB() {

    db = new sqlite3.Database('chat.db', sqlite3.OPEN_READWRITE, (err: any) => {
        if (err && err.code == "SQLITE_CANTOPEN") {
            createDatabase();
            return;
        } else if (err) {
            console.log("Getting error " + err);
        }
        console.log("Finished loading db file")
        createTables(db);
        runQueries(db);
    });

}

export function addMessage(message: Message) {
    if (db != null) {
        const stmt = db.prepare("insert into messages (room, username, message, time) values (?, ?, ?, ?)");
        stmt.bind(message.room, message.username, message.message, message.time)
        stmt.run();
    }
}

export function addRoom(id: string, name: string) {
    const stmt = db.prepare("insert into rooms (id, name) values (?, ?)");
    stmt.bind(id, name);
    stmt.run();
}

export function removeRoom(id: string) {
    db.exec("remove from rooms where id='" + id + "'");
}

function createDatabase() {
    console.log("Creating new database..")
    db = new sqlite3.Database('chat.db', (err: any) => {
        if (err) {
            console.log("Getting error " + err);
        } else {
            createTables(db);
            runQueries(db);
        }
    });
}

function createTables(db:any) {
    db.exec("create table if not exists messages (room varchar, username varchar, message varchar, time INTEGER)");
    db.exec("create table if not exists rooms (id varchar, name varchar)");
    try {
        db.exec("alter table messages add column room varcher default '0'", (err: any) => {});
    } catch (exception) { }
}

function runQueries(db:any) {
    db.all("select * from rooms", (err: any, rows: any) => {
        if (rows !== undefined) {
            rows.forEach((row: any) => {
                console.log("Loading room: " + row.name);
                rooms.set(row.id, new Room(row.id, row.name, new Array<Message>()))
            });

        }

        if (!rooms.has("0")) {
            createRoomWithId("Global", "0");
            console.log("Created default room")
        }

        db.all("select * from messages", (err: any, rows: any) => {
            if (rows === undefined) return;
            rows.forEach((row: any) => {
                const room = rooms.get(row.room.toString());
                if (room != null) {
                    room.history.push(new Message(row.room, row.username, row.message, row.time))
                }
            });
        });

    });

    console.log("Finished loading database");
}
