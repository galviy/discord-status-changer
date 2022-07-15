const fetch = require('node-fetch');

let discord_token = "";

const fs = require('fs');

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const {
    exec
} = require('child_process');

let isLoggedin = false;

async function loginToken(token) {
    await fetch("https://discord.com/api/v6/users/@me", {
        headers: {
            "authorization": token
        }
    }).then(resp => resp.json()).then(response => {
        if (response.id != null) {
            console.log("Logged as " + response.username + "#" + response.discriminator + " (" + response.id + ")");
            isLoggedin = true;
            fs.readFile("random.txt", function(err, data) {
                let random = data.toString().split("\n");
                return setInterval(() => {
                    setStatus(random[Math.floor(Math.random() * random.length)], "💀");
                }, 5000);
            })
        }
    })
};

function setStatus(message, emoji) {
    if (message.length >= 128) return console.log("message can not be more than 128 length (discord limit issue)")
    let statusMessage = {
        custom_status: {
            text: message,
            emoji_name: emoji,
        }
    };
    if (isLoggedin) {
        fetch("https://discord.com/api/v9/users/@me/settings", {
            method: "PATCH",
            body: JSON.stringify(statusMessage),
            headers: {
                "Host": "discord.com",
                "user-agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Mobile Safari/537.36",
                "Content-Type": "application/json",
                "authorization": discord_token,
            }

        }).then(resp => resp.json()).then(response => {
            if (response.custom_status != null) {
                exec(`title ${response.custom_status.text}`)
            } else {
                switch (response.code) {
                    case 0: { //authorization issue thing or invalid token
                        console.log("Found error -> " + response.message)
                    }
                    break;

                    case 50035: { //mostly caused by message size is too large.
                        console.log("Found Error -> " + response.message)
                    }
                    break;

                    case 40002: { //due to number verification by discord system 
                        console.log("Found Error -> " + response.message)
                    }
                    break;

                    default: {
                        console.log(response)
                    }
                    break;
                }
            }
        })
    }

};

function showMenu() {
    console.clear();
    let mainMenu = "Please put the discord token correctly\n-> ";
    readline.question(mainMenu, function(input1) {
        discord_token = input1;
        loginToken(discord_token);
    })
};

showMenu();