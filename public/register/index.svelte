<script lang="ts">
    let username: string = "";
    let password: string = "";

    const register = async () => {
        await eFetch("/api/register", {
            method: "POST",
            body: {
                username,
                password
            }
        });

        sessionStorage.setItem("username", username);
        sessionStorage.setItem("password", password);

        window.location.href = "/login/"
    }
</script>

<div>
<input bind:value={username} type="text" placeholder="Type your username">
<input bind:value={password} type="password" placeholder="Type your password">
<button on:click={register}>Register</button>
</div>
