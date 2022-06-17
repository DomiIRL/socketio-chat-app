import {Socket} from "socket.io";

export const usernames = new Map<Socket, string>();

const userRooms = new Map<Socket, string>();

export function setName(socket: Socket, username: string) {
    if (username.length > 30) return;
    usernames.set(socket, username);
}

export function getName(socket: Socket) : string | null | undefined {
    return usernames.get(socket);
}

export function setRoom(socket: Socket, room: string | null) {
    if (room == null) {
        userRooms.delete(socket);
        return;
    }
    userRooms.set(socket, room);
}

export function getRoom(socket: Socket) : string | null {
    const s = userRooms.get(socket);
    // Could be undefined
    return s == null ? null : s;
}

export function removeUser(socket: Socket) {
    usernames.delete(socket);
    userRooms.delete(socket);
}

// export class User {
//     id: number; // random immutable long value
//     name: String;
//     tag: number; // random number behind name to differenciate between multiple user
//     admin: boolean;
//
//
//     constructor(id: number, name: String, tag: number, admin: boolean) {
//         this.id = id;
//         this.name = name;
//         this.tag = tag;
//         this.admin = admin;
//     }
//
// }