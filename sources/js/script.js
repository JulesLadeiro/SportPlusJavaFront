const url = "http://localhost:8080";

const getMd5 = async (password) => {
    const response = await fetch(`api.hashify.net/hash/md5/hex?value=${password}`);
    const data = await response.json();
    return data.Digest;
}

const signup = async () => {
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;
    const email = document.getElementById('signupEmail').value;

    document.getElementById('signupButton').disabled = true;

    await fetch(`${url}/user`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
            "Access-Control-Allow-Origin": "*",

        },
        body: JSON.stringify({
            username,
            password,
            email
        })
    });

    window.location.href = "connection.html";
}

const login = async () => {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    document.getElementById('loginButton').disabled = true;

    const response = await fetch(`${url}/user`, {
        method: 'GET'
    });

    const users = await response.json();
    const rightUser = users.find(user => user.email === email && user.password === password);

    if (rightUser === undefined) {
        document.getElementById('loginError').innerHTML = "Wrong email or password";
        document.getElementById('loginButton').disabled = false;
        users = { error: true };
    } else {
        const passwordMd5 = await getMd5(password);
        if (rightUser.password !== passwordMd5) {
            document.getElementById('loginError').innerHTML = "Wrong email or password";
            document.getElementById('loginButton').disabled = false;
            users = { error: true };
        } else {
            window.location.href = "index.html";
        }
    }

    if (users.error) {
        document.getElementById('loginError').innerHTML = data.error;
        document.getElementById('loginButton').disabled = false;
    } else {
        window.location.href = "index.html";
    }
}