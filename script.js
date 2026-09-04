            const {
                gsap,
                gsap: { registerPlugin, set, to, timeline },
                MorphSVGPlugin,
                Draggable,
            } = window;
            registerPlugin(MorphSVGPlugin);

            const AUDIO = {
                CLICK: new Audio("https://assets.codepen.io/605876/click.mp3"),
            };

            const ON = document.querySelector("#on");
            const OFF = document.querySelector("#off");
            const LOGIN_FORM = document.querySelector(".login-form");

            let startX;
            let startY;

            const PROXY = document.createElement("div");

            const CORDS = gsap.utils.toArray(".cords path");
            const CORD_DURATION = 0.1;
            const HIT = document.querySelector(".lamp__hit");
            const DUMMY_CORD = document.querySelector(".cord--dummy");
            const ENDX = DUMMY_CORD.getAttribute("x2");
            const ENDY = DUMMY_CORD.getAttribute("y2");
            const RESET = () => {
                set(PROXY, {
                    x: ENDX,
                    y: ENDY,
                });
            };
            RESET();

            const STATE = {
                ON: false,
            };

            gsap.set([".cords", HIT], {
                x: -10,
            });

            gsap.set(".lamp__eye", {
                rotate: 180,
                transformOrigin: "50% 50%",
                yPercent: 50,
            });

            const CORD_TL = timeline({
                paused: true,
                onStart: () => {
                    STATE.ON = !STATE.ON;
                    set(document.documentElement, { "--on": STATE.ON ? 1 : 0 });
                    const hue = gsap.utils.random(0, 359);
                    set(document.documentElement, { "--shade-hue": hue });

                    const glowColor = `hsl(${hue}, 40%, 45%)`;
                    const glowColorDark = `hsl(${hue}, 40%, 35%)`;
                    set(document.documentElement, {
                        "--glow-color": glowColor,
                    });
                    set(document.documentElement, {
                        "--glow-color-dark": glowColorDark,
                    });

                    set(".lamp__eye", {
                        rotate: STATE.ON ? 0 : 180,
                    });

                    set([DUMMY_CORD, HIT], { display: "none" });
                    set(CORDS[0], { display: "block" });
                    AUDIO.CLICK.play();

                    if (STATE.ON) {
                        ON.setAttribute("checked", true);
                        OFF.removeAttribute("checked");
                        LOGIN_FORM.classList.add("active");
                    } else {
                        ON.removeAttribute("checked");
                        OFF.setAttribute("checked", true);
                        LOGIN_FORM.classList.remove("active");
                    }
                },
                onComplete: () => {
                    set([DUMMY_CORD, HIT], { display: "block" });
                    set(CORDS[0], { display: "none" });
                    RESET();
                },
            });

            for (let i = 1; i < CORDS.length; i++) {
                CORD_TL.add(
                    to(CORDS[0], {
                        morphSVG: CORDS[i],
                        duration: CORD_DURATION,
                        repeat: 1,
                        yoyo: true,
                    })
                );
            }

            Draggable.create(PROXY, {
                trigger: HIT,
                type: "x,y",
                onPress: (e) => {
                    startX = e.x;
                    startY = e.y;
                },
                onDrag: function () {
                    set(DUMMY_CORD, {
                        attr: {
                            x2: this.x,
                            y2: Math.max(400, this.y),
                        },
                    });
                },
                onRelease: function (e) {
                    const DISTX = Math.abs(e.x - startX);
                    const DISTY = Math.abs(e.y - startY);
                    const TRAVELLED = Math.sqrt(DISTX * DISTX + DISTY * DISTY);
                    to(DUMMY_CORD, {
                        attr: { x2: ENDX, y2: ENDY },
                        duration: CORD_DURATION,
                        onComplete: () => {
                            if (TRAVELLED > 50) {
                                CORD_TL.restart();
                            } else {
                                RESET();
                            }
                        },
                    });
                },
            });

             gsap.set(".lamp", { display: "block" });

LOGIN_FORM.addEventListener("submit", function (e) {
    e.preventDefault();

    const usernameInput = LOGIN_FORM.querySelector(
        'input[type="text"], input[name="username"], input[placeholder*="username" i]'
    );

    const passwordInput = LOGIN_FORM.querySelector(
        'input[type="password"], input[name="password"], input[placeholder*="password" i]'
    );

    const username = usernameInput ? usernameInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value.trim() : "";

    if (username === "" || password === "") {
        showLoginMessage(
            "Please enter both username and password.",
            "error"
        );
        return;
    }

    const loginButton = LOGIN_FORM.querySelector(
        'button[type="submit"], input[type="submit"], button'
    );

    if (loginButton) {
        loginButton.disabled = true;
        loginButton.innerHTML = "Logging in...";
    }

    setTimeout(() => {
        showLoginMessage(
            `Login Successful! Welcome, ${username} 🎉`,
            "success"
        );

        if (loginButton) {
            loginButton.disabled = false;
            loginButton.innerHTML = "Login";
        }

        if (passwordInput) {
            passwordInput.value = "";
        }

    }, 1000);
});

function showLoginMessage(message, type) {
    const oldMessage = document.querySelector(".login-message");

    if (oldMessage) {
        oldMessage.remove();
    }

    const messageBox = document.createElement("div");

    messageBox.className = `login-message ${type}`;

    messageBox.innerHTML = `
        <div class="message-icon">
            ${type === "success" ? "✓" : "!"}
        </div>

        <div class="message-content">
            <strong>
                ${type === "success" ? "Login Successful" : "Login Failed"}
            </strong>

            <span>${message}</span>
        </div>

        <button class="message-close">&times;</button>
    `;

    document.body.appendChild(messageBox);

    setTimeout(() => {
        messageBox.classList.add("show");
    }, 50);

    const closeButton = messageBox.querySelector(".message-close");

    closeButton.addEventListener("click", () => {
        messageBox.classList.remove("show");

        setTimeout(() => {
            messageBox.remove();
        }, 400);
    });

    setTimeout(() => {

        if (messageBox && messageBox.parentElement) {

            messageBox.classList.remove("show");

            setTimeout(() => {
                if (messageBox.parentElement) {
                    messageBox.remove();
                }
            }, 400);

        }

    }, 4000);
}