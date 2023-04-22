<script>
    import { onMount } from "svelte/internal";

    onMount(async () => {
        const username = sessionStorage.getItem("username");
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

        window.location.href = "/chat/";
    })
</script>
