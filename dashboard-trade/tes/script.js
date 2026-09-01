const authContainer =
    document.getElementById(
        "authContainer"
    );

const loginPanel =
    document.getElementById(
        "loginPanel"
    );

const signupPanel =
    document.getElementById(
        "signupPanel"
    );

const loginScale =
    document.getElementById(
        "loginScale"
    );

const signupScale =
    document.getElementById(
        "signupScale"
    );

const overlay =
    document.getElementById(
        "overlay"
    );

const overlayScale =
    document.getElementById(
        "overlayScale"
    );

const arrowBtn =
    document.getElementById(
        "arrowBtn"
    );

const overlayTitle =
    document.getElementById(
        "overlayTitle"
    );

const overlayDescription =
    document.getElementById(
        "overlayDescription"
    );

const loginForm =
    document.getElementById(
        "loginForm"
    );

const signupForm =
    document.getElementById(
        "signupForm"
    );

const borderStars =
    document.querySelectorAll(
        ".border-star"
    );

let signupOpen =
    false;

let dragging =
    false;

let didDrag =
    false;

let pointerStartX =
    0;

let pointerStartY =
    0;

let overlayStartX =
    0;

let overlayStartY =
    0;

let resizeTimer =
    null;

let borderAnimationFrame =
    null;

const SWIPE_THRESHOLD =
    75;

const BORDER_SPEED =
    0.006;

function isMobile() {

    return window.matchMedia(
        "(max-width: 700px)"
    ).matches;

}

function updateOverlayContent() {

    const mobile =
        isMobile();

    if (!signupOpen) {

        overlayTitle.textContent =
            "Welcome Back";

        overlayDescription.textContent =
            "Sudah punya akun? Masuk dan lanjutkan perjalananmu.";

        arrowBtn.textContent =
            mobile
                ? "↑"
                : "←";

        arrowBtn.setAttribute(
            "aria-label",
            "Open sign up"
        );

        return;

    }

    overlayTitle.textContent =
        "Create Account";

    overlayDescription.textContent =
        "Belum punya akun? Daftar sekarang dan mulai perjalananmu.";

    arrowBtn.textContent =
        mobile
            ? "↓"
            : "→";

    arrowBtn.setAttribute(
        "aria-label",
        "Back to login"
    );

}

function applyState(
    animate = true
) {

    if (!animate) {

        const oldTransition =
            overlay.style.transition;

        overlay.style.transition =
            "none";

        authContainer.classList.toggle(
            "signup-open",
            signupOpen
        );

        requestAnimationFrame(
            function() {

                requestAnimationFrame(
                    function() {

                        overlay.style.transition =
                            oldTransition;

                    }
                );

            }
        );

    } else {

        authContainer.classList.toggle(
            "signup-open",
            signupOpen
        );

    }

    updateOverlayContent();

}

function scaleContentToPanel(
    panel,
    scaleElement
) {

    if (
        !panel ||
        !scaleElement
    ) {

        return;

    }

    scaleElement.style.transform =
        "scale(1)";

    void scaleElement.offsetWidth;

    const availableWidth =
        panel.clientWidth;

    const availableHeight =
        panel.clientHeight;

    const contentWidth =
        scaleElement.scrollWidth;

    const contentHeight =
        scaleElement.scrollHeight;

    if (
        availableWidth <= 0 ||
        availableHeight <= 0 ||
        contentWidth <= 0 ||
        contentHeight <= 0
    ) {

        return;

    }

    const safeWidth =
        availableWidth * .88;

    const safeHeight =
        availableHeight * .88;

    const widthScale =
        safeWidth /
        contentWidth;

    const heightScale =
        safeHeight /
        contentHeight;

    const scale =
        Math.min(
            1,
            widthScale,
            heightScale
        );

    const finalScale =
        Math.max(
            .62,
            scale
        );

    scaleElement.style.transform =
        `scale(${finalScale})`;

}

function resizeInnerContent() {

    requestAnimationFrame(
        function() {

            scaleContentToPanel(
                loginPanel,
                loginScale
            );

            scaleContentToPanel(
                signupPanel,
                signupScale
            );

            scaleContentToPanel(
                overlay,
                overlayScale
            );

        }
    );

}

function toggleAuth() {

    signupOpen =
        !signupOpen;

    applyState(
        true
    );

    resizeInnerContent();

}

arrowBtn.addEventListener(
    "click",
    function(event) {

        event.stopPropagation();

        if (didDrag) {

            didDrag =
                false;

            return;
        }

        toggleAuth();

    }
);

overlay.addEventListener(
    "pointerdown",
    function(event) {

        if (
            event.target.closest(
                ".arrow-btn"
            )
        ) {

            return;
        }

        dragging =
            true;

        didDrag =
            false;

        pointerStartX =
            event.clientX;

        pointerStartY =
            event.clientY;

        if (isMobile()) {

            overlayStartY =
                signupOpen
                    ? -overlay.offsetHeight
                    : 0;

        } else {

            overlayStartX =
                signupOpen
                    ? -overlay.offsetWidth
                    : 0;

        }

        overlay.classList.add(
            "dragging"
        );

        authContainer.classList.add(
            "is-dragging"
        );

        try {

            overlay.setPointerCapture(
                event.pointerId
            );

        } catch (error) {

        }

    }
);

overlay.addEventListener(
    "pointermove",
    function(event) {

        if (!dragging) {

            return;
        }

        const deltaX =
            event.clientX -
            pointerStartX;

        const deltaY =
            event.clientY -
            pointerStartY;

        if (
            Math.abs(deltaX) > 7 ||
            Math.abs(deltaY) > 7
        ) {

            didDrag =
                true;

        }

        if (isMobile()) {

            let nextY =
                overlayStartY +
                deltaY;

            const distance =
                overlay.offsetHeight;

            const minY =
                -distance;

            const maxY =
                0;

            nextY =
                Math.max(
                    minY,
                    Math.min(
                        maxY,
                        nextY
                    )
                );

            overlay.style.transform =
                `translate3d(
                    0,
                    ${nextY}px,
                    0
                )`;

            return;

        }

        let nextX =
            overlayStartX +
            deltaX;

        const distance =
            overlay.offsetWidth;

        const minX =
            -distance;

        const maxX =
            0;

        nextX =
            Math.max(
                minX,
                Math.min(
                    maxX,
                    nextX
                )
            );

        overlay.style.transform =
            `translate3d(
                ${nextX}px,
                0,
                0
            )`;

    }
);

function finishDrag(event) {

    if (!dragging) {

        return;
    }

    dragging =
        false;

    overlay.classList.remove(
        "dragging"
    );

    authContainer.classList.remove(
        "is-dragging"
    );

    const deltaX =
        event.clientX -
        pointerStartX;

    const deltaY =
        event.clientY -
        pointerStartY;

    if (isMobile()) {

        if (
            !signupOpen &&
            deltaY <
                -SWIPE_THRESHOLD
        ) {

            signupOpen =
                true;

        }

        else if (
            signupOpen &&
            deltaY >
                SWIPE_THRESHOLD
        ) {

            signupOpen =
                false;

        }

    }

    else {

        if (
            !signupOpen &&
            deltaX <
                -SWIPE_THRESHOLD
        ) {

            signupOpen =
                true;

        }

        else if (
            signupOpen &&
            deltaX >
                SWIPE_THRESHOLD
        ) {

            signupOpen =
                false;

        }

    }

    overlay.style.transform =
        "";

    applyState(
        true
    );

    resizeInnerContent();

    try {

        overlay.releasePointerCapture(
            event.pointerId
        );

    } catch (error) {

    }

}

overlay.addEventListener(
    "pointerup",
    finishDrag
);

overlay.addEventListener(
    "pointercancel",
    function(event) {

        dragging =
            false;

        overlay.classList.remove(
            "dragging"
        );

        authContainer.classList.remove(
            "is-dragging"
        );

        overlay.style.transform =
            "";

        applyState(
            false
        );

        resizeInnerContent();

        try {

            overlay.releasePointerCapture(
                event.pointerId
            );

        } catch (error) {

        }

    }
);

function getBorderPoint(
    distance,
    width,
    height,
    radius
) {

    const r =
        Math.min(
            radius,
            width / 2,
            height / 2
        );

    const topLength =
        Math.max(
            0,
            width -
            2 * r
        );

    const sideLength =
        Math.max(
            0,
            height -
            2 * r
        );

    const cornerLength =
        Math.PI *
        r /
        2;

    const perimeter =
        (topLength * 2) +
        (sideLength * 2) +
        (cornerLength * 4);

    let d =
        distance %
        perimeter;

    if (
        d < 0
    ) {

        d +=
            perimeter;

    }

    if (
        d <= topLength
    ) {

        return {

            x:
                r + d,

            y:
                0

        };

    }

    d -=
        topLength;

    if (
        d <= cornerLength
    ) {

        const angle =
            -Math.PI / 2 +
            d / r;

        return {

            x:
                width -
                r +
                Math.cos(angle) *
                r,

            y:
                r +
                Math.sin(angle) *
                r

        };

    }

    d -=
        cornerLength;

    if (
        d <= sideLength
    ) {

        return {

            x:
                width,

            y:
                r + d

        };

    }

    d -=
        sideLength;

    if (
        d <= cornerLength
    ) {

        const angle =
            d / r;

        return {

            x:
                width -
                r +
                Math.cos(angle) *
                r,

            y:
                height -
                r +
                Math.sin(angle) *
                r

        };

    }

    d -=
        cornerLength;

    if (
        d <= topLength
    ) {

        return {

            x:
                width -
                r -
                d,

            y:
                height

        };

    }

    d -=
        topLength;

    if (
        d <= cornerLength
    ) {

        const angle =
            Math.PI / 2 +
            d / r;

        return {

            x:
                r +
                Math.cos(angle) *
                r,

            y:
                height -
                r +
                Math.sin(angle) *
                r

        };

    }

    d -=
        cornerLength;

    if (
        d <= sideLength
    ) {

        return {

            x:
                0,

            y:
                height -
                r -
                d

        };

    }

    d -=
        sideLength;

    const angle =
        Math.PI +
        d / r;

    return {

        x:
            r +
            Math.cos(angle) *
            r,

        y:
            r +
            Math.sin(angle) *
            r

    };

}

function initializeBorderStars() {

    if (
        !borderStars.length
    ) {

        return;
    }

    const rect =
        authContainer.getBoundingClientRect();

    const width =
        rect.width;

    const height =
        rect.height;

    const style =
        getComputedStyle(
            authContainer
        );

    let radius =
        parseFloat(
            style.borderTopLeftRadius
        );

    if (
        !Number.isFinite(radius)
    ) {

        radius =
            24;

    }

    const r =
        Math.min(
            radius,
            width / 2,
            height / 2
        );

    const topLength =
        Math.max(
            0,
            width -
            2 * r
        );

    const sideLength =
        Math.max(
            0,
            height -
            2 * r
        );

    const cornerLength =
        Math.PI *
        r /
        2;

    const perimeter =
        (topLength * 2) +
        (sideLength * 2) +
        (cornerLength * 4);

    const positions = [

        .015,
        .135,
        .255,
        .385,
        .515,
        .645,
        .775,
        .905

    ];

    borderStars.forEach(
        function(star,index) {

            const distance =
                perimeter *
                positions[index];

            star.dataset.distance =
                distance.toString();

            const duration =
                2.7 +
                (
                    index % 4
                ) * .45;

            star.style.setProperty(
                "--twinkle-duration",
                `${duration}s`
            );

            star.style.animationDelay =
                `${-(index * .37)}s`;

            star.classList.add(
                "active"
            );

        }
    );

}

function animateBorderStars(
    timestamp
) {

    const rect =
        authContainer.getBoundingClientRect();

    const width =
        rect.width;

    const height =
        rect.height;

    const style =
        getComputedStyle(
            authContainer
        );

    let radius =
        parseFloat(
            style.borderTopLeftRadius
        );

    if (
        !Number.isFinite(radius)
    ) {

        radius =
            24;

    }

    const r =
        Math.min(
            radius,
            width / 2,
            height / 2
        );

    const topLength =
        Math.max(
            0,
            width -
            2 * r
        );

    const sideLength =
        Math.max(
            0,
            height -
            2 * r
        );

    const cornerLength =
        Math.PI *
        r /
        2;

    const perimeter =
        (topLength * 2) +
        (sideLength * 2) +
        (cornerLength * 4);

    borderStars.forEach(
        function(star) {

            let distance =
                parseFloat(
                    star.dataset.distance
                );

            if (
                !Number.isFinite(distance)
            ) {

                distance =
                    0;

            }

            distance +=
                16.67 *
                BORDER_SPEED;

            if (
                distance >= perimeter
            ) {

                distance -=
                    perimeter;

            }

            star.dataset.distance =
                distance.toString();

            const point =
                getBorderPoint(
                    distance,
                    width,
                    height,
                    r
                );

            star.style.left =
                `${point.x}px`;

            star.style.top =
                `${point.y}px`;

        }
    );

    borderAnimationFrame =
        requestAnimationFrame(
            animateBorderStars
        );

}

function startBorderAnimation() {

    if (
        borderAnimationFrame
    ) {

        cancelAnimationFrame(
            borderAnimationFrame
        );

    }

    initializeBorderStars();

    borderAnimationFrame =
        requestAnimationFrame(
            animateBorderStars
        );

}

function handleResize() {

    clearTimeout(
        resizeTimer
    );

    resizeTimer =
        setTimeout(
            function() {

                overlay.style.transform =
                    "";

                updateOverlayContent();

                resizeInnerContent();

                initializeBorderStars();

                applyState(
                    false
                );

            },
            80
        );

}

window.addEventListener(
    "resize",
    handleResize
);

window.addEventListener(
    "orientationchange",
    handleResize
);

if (
    "ResizeObserver"
    in window
) {

    const resizeObserver =
        new ResizeObserver(
            function() {

                if (!dragging) {

                    resizeInnerContent();

                    initializeBorderStars();

                }

            }
        );

    resizeObserver.observe(
        authContainer
    );

    resizeObserver.observe(
        loginPanel
    );

    resizeObserver.observe(
        signupPanel
    );

    resizeObserver.observe(
        overlay
    );

}

loginForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        alert(
            "Login form submitted."
        );

    }
);

signupForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        alert(
            "Sign Up form submitted."
        );

    }
);

function initialize() {

    signupOpen =
        false;

    updateOverlayContent();

    applyState(
        false
    );

    resizeInnerContent();

    startBorderAnimation();

}

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initialize,
        {
            once:
                true
        }
    );

} else {

    initialize();

}

window.addEventListener(
    "load",
    function() {

        resizeInnerContent();

        startBorderAnimation();

    },
    {
        once:
            true
    }
);
