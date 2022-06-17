import { history, sendMessage } from "../messaging"
import {Socket} from "socket.io";

describe('Send a message', () => {
    let mockUsername: String;
    let mockMessage: String;

    beforeEach(() => {
        mockMessage = "Ich bin ein Test!";
        mockUsername = "Anonymous";
    });

    test("200 - message", () => {


       expect(history).toContain({
           username: "Anonymous",
           message: "Ich bin ein Test!",
           time: new Date().getTime()
       })

    });
});