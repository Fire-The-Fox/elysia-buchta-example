import { Database } from "bun:sqlite";
import { buchta } from "./buchta";
import Elysia, { ws } from "elysia";

const db = new Database(":memory:");
db.run("CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL)");

const insert = db.prepare("INSERT INTO users (username, password) VALUES ($username, $password)");

const app = new Elysia();
app.use(ws());

app.post("/api/register", ({ body }) => {
    const users = db.query("SELECT * FROM users WHERE username = $username;");
    // @ts-ignore drz picu
    const user = users.get({ $username: body.username });
    if (user) return "";
    insert.run({
        // @ts-ignore ssh
        $username: body.username,
        // @ts-ignore ssh
        $password: body.password
    });
    return ""
});

const clients: any[] = [];

app.post("/api/login", ({ body }) => {
    const users = db.query("SELECT * FROM users WHERE username = $username;");
    // @ts-ignore ssh
    return users.get({ $username: body.username })
});

app.ws("/ws", {
    open: (socket) => {
        clients.push(socket);
    },
    message: (_, msg: any) => {
        for (const cl of clients) {
            cl.send(msg)
        }
    }
});

app.listen(3000);

app.use(buchta);

export type App = typeof app;
