<script lang="ts">
    import { onMount } from "svelte/internal";
    import { marked } from "marked";

    let val = "";
    let comp: HTMLElement; 
    let username: string | null = "";

    const handle = (e: any) => {
        if (e.key == "Enter") {
            if (socket) {
                if (val.trim() == "") return;
                socket.send(JSON.stringify({
                    username,
                    msg: marked.parse(val)
                }));
                comp.innerHTML += "<div class='you'>" + username + ": " + marked.parse(val.trim()) + "</div>";
                val = "";
            }
        }
    }

    let socket: WebSocket;

    onMount(async () => {
        username = sessionStorage.getItem("username");
        const password = sessionStorage.getItem("password");

        if (!username || !password) {
            window.location.href = "/register/";
            return;
        }

        const { data } = await eFetch("/api/login", {
            method: "POST",
            body: {
                username,
                password
            }
        });

        if (!data) {
            window.location.href = "/register/";
            return;
        }

        if (data.password != password) {
            window.location.href = "/register/";
            return;
        }

        socket = new WebSocket(`ws://localhost:3000/${elysiaPort}`);
        socket.onmessage = (ev) => {
            const data = JSON.parse(ev.data);
            if (data.username == username) return;
            comp.innerHTML += "<div class='notyou'>" + data.username + ": " + data.msg + "</div>";
        }
    })
</script>

<div>
    <div bind:this={comp}>
    </div>
    <input bind:value={val} type="text" placeholder="Type your message here" on:keypress={handle}>
</div>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
    }
    :global(.you) {
        text-align: right;
        padding: 5px;
        background-color: dodgerblue;
        font-weight: bold;
    }
    :global(.notyou) {
        background-color: lightgray;
        font-weight: bold;
        padding: 5px;
    }

    input {
        width: 99%;
        margin: auto;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
</style>
