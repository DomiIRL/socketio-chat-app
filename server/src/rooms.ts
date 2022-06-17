import { nanoid } from "nanoid";
import { addRoom, removeRoom } from "./dbmanager";

export const rooms: Map<string, Room> = new Map();

export function createRoom(roomName: string) : string | null {
    if (roomName.trim() == "") return null;
    const id = nanoid();

    rooms.set(id, new Room(id, roomName, new Array<Message>()));

    addRoom(id, roomName);
    return id;
}

export function deleteRoom(id: string) {
    rooms.delete(id);
    removeRoom(id);
}

export class Room {
    id: string;
    name: string;
    history: Array<Message>;

    constructor(id: string, name: string, history: Array<Message>) {
        this.id = id;
        this.name = name;
        this.history = history;
    }

}

export class Message {
    room: string;
    username: string;
    message: string;
    time: Number;

    constructor(room: string, username: string, message: string, time: Number) {
        this.room = room;
        this.username = username;
        this.message = message;
        this.time = time;
    }

}