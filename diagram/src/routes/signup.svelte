<script lang="ts">
    import { initializeApp } from "@firebase/app";
    import { getAuth, createUserWithEmailAndPassword } from "@firebase/auth";

    // Initialize Firebase for authentication
    const firebaseConfig = {
        apiKey: "AIzaSyA3w93rWAwPFTHpnuGgmnWEFhsiwJkRpGY",
        authDomain: "wiringdiagram3d.firebaseapp.com",
        projectId: "wiringdiagram3d",
        storageBucket: "wiringdiagram3d.appspot.com",
        messagingSenderId: "322663865877",
        appId: "1:322663865877:web:eb33bb9fe16a291137781c",
        measurementId: "G-P1PXBXCXHF",
    };
    const app = initializeApp(firebaseConfig);
    const auth = getAuth();

    // Signup logig
    const signup = (e) => {
        const formdata = new FormData(e.target);
        let username = formdata.get("email");
        let password = formdata.get("password");
        createUserWithEmailAndPassword(auth, username.toString(), password.toString()).then((user) => {
            console.log(user)
            console.log(auth.currentUser)
        }).catch((error) => {
            console.log(error)
            console.log(auth.currentUser)
        })
    };
</script>

<div style="text-align: center; margin: 25px">
    <form on:submit|once|preventDefault={signup}>
        <h1>Signup</h1>
        <input type="email" placeholder="Email*" name="email" required />
        <br />
        <input
            type="password"
            placeholder="Password*"
            name="password"
            required
        />
        <br />
        <button type="submit">Sign Up</button>
    </form>
    <br />
    <button style="margin-top: 5px" href="/signup"
        >Have an account? Log In</button
    >
</div>
