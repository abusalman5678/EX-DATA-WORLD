/* =====================================================
   EX-DATA WORLD
   Frontend Application
   ===================================================== */


/* ================= CONFIG ================= */

/*
   When a secure backend is ready, change this to
   your real HTTPS API address.

   Example:

   const API_URL = "https://api.yourdomain.com";

   DO NOT put secret API keys here.
*/

const API_URL = "https://ex-data-world-153e.onrender.com";

/* ================= APP STATE ================= */

let currentUser = null;

let selectedNetwork = "";

let selectedPlan = null;

let selectedLanguage = "EN";


/* ================= DATA PLANS ================= */

/*
   These are UI plan options only.

   They are NOT proof of real provider availability.

   Real plans/prices should eventually come from
   the VTU provider through the backend.
*/

const dataPlans = {

    MTN: [
        {
            id: "mtn-500",
            name: "500MB",
            price: 150
        },
        {
            id: "mtn-1gb",
            name: "1GB",
            price: 300
        },
        {
            id: "mtn-2gb",
            name: "2GB",
            price: 600
        },
        {
            id: "mtn-5gb",
            name: "5GB",
            price: 1500
        },
        {
            id: "mtn-10gb",
            name: "10GB",
            price: 3000
        }
    ],

    AIRTEL: [
        {
            id: "airtel-500",
            name: "500MB",
            price: 150
        },
        {
            id: "airtel-1gb",
            name: "1GB",
            price: 300
        },
        {
            id: "airtel-2gb",
            name: "2GB",
            price: 600
        },
        {
            id: "airtel-5gb",
            name: "5GB",
            price: 1500
        },
        {
            id: "airtel-10gb",
            name: "10GB",
            price: 3000
        }
    ],

    GLO: [
        {
            id: "glo-500",
            name: "500MB",
            price: 150
        },
        {
            id: "glo-1gb",
            name: "1GB",
            price: 300
        },
        {
            id: "glo-2gb",
            name: "2GB",
            price: 600
        },
        {
            id: "glo-5gb",
            name: "5GB",
            price: 1500
        },
        {
            id: "glo-10gb",
            name: "10GB",
            price: 3000
        }
    ],

    "9MOBILE": [
        {
            id: "9mobile-500",
            name: "500MB",
            price: 150
        },
        {
            id: "9mobile-1gb",
            name: "1GB",
            price: 300
        },
        {
            id: "9mobile-2gb",
            name: "2GB",
            price: 600
        },
        {
            id: "9mobile-5gb",
            name: "5GB",
            price: 1500
        },
        {
            id: "9mobile-10gb",
            name: "10GB",
            price: 3000
        }
    ]

};


/* ================= PAGE SYSTEM ================= */

function showPage(pageId) {

    const pages =
        document.querySelectorAll(".page");

    pages.forEach(page => {

        page.classList.remove("active");

    });


    const target =
        document.getElementById(pageId);

    if (!target) {

        console.warn(
            "Page not found:",
            pageId
        );

        return;
    }


    target.classList.add("active");


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    if (pageId === "dashboard") {

        renderDashboard();

    }


    if (pageId === "profile") {

        renderProfile();

    }


    if (pageId === "referral") {

        renderReferral();

    }


    if (pageId === "transactions") {

        loadTransactions();

    }

}


/* ================= MESSAGE ================= */

function showMessage(message) {

    const box =
        document.getElementById("messageBox");

    const text =
        document.getElementById("messageText");

    text.textContent = message;

    box.classList.add("show");


    setTimeout(() => {

        box.classList.remove("show");

    }, 3500);

}


/* ================= LANGUAGE ================= */

function toggleLanguage() {

    selectedLanguage =
        selectedLanguage === "EN"
            ? "HA"
            : "EN";

    const button =
        document.querySelector(".language-btn");

    if (button) {

        button.textContent =
            selectedLanguage;

    }

    showMessage(
        selectedLanguage === "HA"
            ? "Hausa language interface will be added."
            : "English language selected."
    );

}


/* ================= PASSWORD ================= */

function togglePassword(
    inputId,
    button
) {

    const input =
        document.getElementById(inputId);

    if (!input) return;


    if (input.type === "password") {

        input.type = "text";

        button.textContent = "HIDE";

    } else {

        input.type = "password";

        button.textContent = "SHOW";

    }

}


/* ================= API HELPER ================= */

async function apiRequest(
    endpoint,
    options = {}
) {

    /*
       This function is ready for the backend.

       No secret API credentials are stored here.
    */


    const url =
        API_URL + endpoint;


    const headers = {

        "Content-Type":
            "application/json",

        ...(options.headers || {})

    };


    const response =
        await fetch(url, {

            ...options,

            headers

        });


    let data = null;


    try {

        data =
            await response.json();

    } catch {

        data = {};

    }


    if (!response.ok) {

        throw new Error(
            data.message ||
            data.error ||
            "Request failed."
        );

    }


    return data;

}


/* ================= REGISTER ================= */

const registerForm =
    document.getElementById("registerForm");


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const fullName =
                document
                .getElementById(
                    "registerFullName"
                )
                .value
                .trim();


            const username =
                document
                .getElementById(
                    "registerUsername"
                )
                .value
                .trim();


            const email =
                document
                .getElementById(
                    "registerEmail"
                )
                .value
                .trim();


            const phone =
                document
                .getElementById(
                    "registerPhone"
                )
                .value
                .trim();


            const nin =
                document
                .getElementById(
                    "registerNin"
                )
                .value
                .trim();


            const password =
                document
                .getElementById(
                    "registerPassword"
                )
                .value;


            const referral =
                document
                .getElementById(
                    "registerReferral"
                )
                .value
                .trim();


            const terms =
                document
                .getElementById(
                    "registerTerms"
                )
                .checked;


            /* VALIDATION */

            if (fullName.length < 2) {

                showMessage(
                    "Enter your full name."
                );

                return;

            }


            if (username.length < 3) {

                showMessage(
                    "Username must contain at least 3 characters."
                );

                return;

            }


            if (!email.includes("@")) {

                showMessage(
                    "Enter a valid email address."
                );

                return;

            }


            if (!/^0\d{10}$/.test(phone)) {

                showMessage(
                    "Enter a valid Nigerian phone number."
                );

                return;

            }


            if (!/^\d{11}$/.test(nin)) {

                showMessage(
                    "NIN must contain exactly 11 digits."
                );

                return;

            }


            if (password.length < 8) {

                showMessage(
                    "Password must contain at least 8 characters."
                );

                return;

            }


            if (!terms) {

                showMessage(
                    "You must accept the rules."
                );

                return;

            }


            /*
               BACKEND MODE

               If API_URL is configured, registration
               will be sent to the backend.

               If API_URL is empty, we do not create
               a fake real-money account.
            */


            if (!API_URL) {

                showMessage(
                    "Registration UI is ready. Connect the secure backend before creating real accounts."
                );

                return;

            }


            try {

                showMessage(
                    "Creating your account..."
                );


                const result =
                    await apiRequest(
                        "/api/auth/register",
                        {
                            method: "POST",

                            body: JSON.stringify({

                                fullName,
                                username,
                                email,
                                phone,
                                nin,
                                password,
                                referral

                            })

                        }
                    );


                showMessage(
                    result.message ||
                    "Account created successfully."
                );


                registerForm.reset();


                setTimeout(() => {

                    showPage("login");

                }, 1200);


            } catch (error) {

                showMessage(
                    error.message
                );

            }

        }
    );

}


/* ================= LOGIN ================= */

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const identity =
                document
                .getElementById(
                    "loginIdentity"
                )
                .value
                .trim();


            const password =
                document
                .getElementById(
                    "loginPassword"
                )
                .value;


            if (!identity || !password) {

                showMessage(
                    "Enter your login details."
                );

                return;

            }


            if (!API_URL) {

                showMessage(
                    "Login UI is ready. Connect the secure backend before logging in."
                );

                return;

            }


            try {

                showMessage(
                    "Logging in..."
                );


                const result =
                    await apiRequest(
                        "/api/auth/login",
                        {
                            method: "POST",

                            body: JSON.stringify({

                                identity,
                                password

                            })

                        }
                    );


                if (result.token) {

                    /*
                       NOTE:

                       For production, prefer an HttpOnly
                       secure cookie from the backend.

                       This frontend is structured so that
                       the backend can provide that later.
                    */

                    sessionStorage.setItem(
                        "exdw_session",
                        result.token
                    );

                }


                currentUser =
                    result.user ||
                    null;


                showMessage(
                    "Login successful."
                );


                setTimeout(() => {

                    showPage("dashboard");

                }, 800);


            } catch (error) {

                showMessage(
                    error.message
                );

            }

        }
    );

}


/* ================= DASHBOARD ================= */

function renderDashboard() {

    if (!currentUser) {

        return;

    }


    const name =
        document.getElementById(
            "dashboardName"
        );

    if (name) {

        name.textContent =
            currentUser.full_name ||
            currentUser.fullName ||
            currentUser.username ||
            "User";

    }


    updateWallet(
        currentUser.balance || 0
    );


    const accountNumber =
        document.getElementById(
            "virtualAccountNumber"
        );


    const accountBank =
        document.getElementById(
            "virtualAccountBank"
        );


    if (accountNumber) {

        accountNumber.textContent =
            currentUser.account_number ||
            "Not connected";

    }


    if (accountBank) {

        accountBank.textContent =
            currentUser.account_bank ||
            "Virtual account provider pending";

    }

}


/* ================= PROFILE ================= */

function renderProfile() {

    if (!currentUser) {

        return;

    }


    const fullName =
        currentUser.full_name ||
        currentUser.fullName ||
        "User";


    const username =
        currentUser.username ||
        "username";


    const email =
        currentUser.email ||
        "—";


    const phone =
        currentUser.phone ||
        "—";


    setText(
        "profileName",
        fullName
    );


    setText(
        "profileUsername",
        "@" + username
    );


    setText(
        "profileFullName",
        fullName
    );


    setText(
        "profileUsername2",
        username
    );


    setText(
        "profileEmail",
        email
    );


    setText(
        "profilePhone",
        phone
    );


    setText(
        "profileKyc",
        currentUser.kyc_status ||
        currentUser.kycStatus ||
        "PENDING"
    );


    setText(
        "profileStatus",
        currentUser.account_status ||
        "ACTIVE"
    );

}


function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );

    if (element) {

        element.textContent =
            value;

    }

}


/* ================= WALLET ================= */

function updateWallet(balance) {

    const amount =
        Number(balance || 0);


    const formatted =
        "₦" +
        amount.toLocaleString(
            "en-NG",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );


    setText(
        "walletBalance",
        formatted
    );


    setText(
        "walletBalancePage",
        formatted
    );

}


/* ================= DATA ================= */

function selectNetwork(
    network,
    button
) {

    selectedNetwork =
        network;


    selectedPlan =
        null;


    document
        .querySelectorAll(
            ".network-grid button"
        )
        .forEach(item => {

            item.classList.remove(
                "selected"
            );

        });


    if (button) {

        button.classList.add(
            "selected"
        );

    }


    renderDataPlans();

}


function renderDataPlans() {

    const container =
        document.getElementById(
            "dataPlans"
        );


    if (!container) return;


    const plans =
        dataPlans[
            selectedNetwork
        ] || [];


    if (!plans.length) {

        container.innerHTML = `
            <div class="empty-plan">
                Select a network first.
            </div>
        `;

        return;

    }


    container.innerHTML =
        plans.map(plan => {

            return `
                <button
                    class="plan"
                    onclick="selectDataPlan('${plan.id}')"
                    data-plan-id="${plan.id}"
                >

                    <strong>
                        ${plan.name}
                    </strong>

                    <span>
                        ₦${plan.price.toLocaleString()}
                    </span>

                </button>
            `;

        }).join("");

}


function selectDataPlan(planId) {

    const plans =
        dataPlans[
            selectedNetwork
        ] || [];


    selectedPlan =
        plans.find(
            plan =>
                plan.id === planId
        );


    document
        .querySelectorAll(".plan")
        .forEach(plan => {

            plan.classList.remove(
                "selected"
            );

        });


    const selected =
        document.querySelector(
            `[data-plan-id="${planId}"]`
        );


    if (selected) {

        selected.classList.add(
            "selected"
        );

    }

}


async function confirmDataPurchase() {

    const phone =
        document
        .getElementById(
            "dataPhone"
        )
        .value
        .trim();


    if (!selectedNetwork) {

        showMessage(
            "Select a network."
        );

        return;

    }


    if (!/^0\d{10}$/.test(phone)) {

        showMessage(
            "Enter a valid Nigerian phone number."
        );

        return;

    }


    if (!selectedPlan) {

        showMessage(
            "Select a data plan."
        );

        return;

    }


    if (!API_URL) {

        showMessage(
            "DATA purchase is ready for backend integration. No fake purchase was made."
        );

        return;

    }


    try {

        const result =
            await apiRequest(
                "/api/services/data",
                {
                    method: "POST",

                    body: JSON.stringify({

                        network:
                            selectedNetwork,

                        phone,

                        planId:
                            selectedPlan.id

                    })

                }
            );


        showMessage(
            result.message ||
            "DATA request submitted."
        );


    } catch (error) {

        showMessage(
            error.message
        );

    }

}


/* ================= AIRTIME ================= */

async function buyAirtime() {

    const network =
        document
        .getElementById(
            "airtimeNetwork"
        )
        .value;


    const phone =
        document
        .getElementById(
            "airtimePhone"
        )
        .value
        .trim();


    const amount =
        Number(
            document
            .getElementById(
                "airtimeAmount"
            )
            .value
        );


    if (!network) {

        showMessage(
            "Select a network."
        );

        return;

    }


    if (!/^0\d{10}$/.test(phone)) {

        showMessage(
            "Enter a valid phone number."
        );

        return;

    }


    if (!amount || amount < 50) {

        showMessage(
            "Enter a valid airtime amount."
        );

        return;

    }


    if (!API_URL) {

        showMessage(
            "Airtime purchase is ready for backend integration. No fake purchase was made."
        );

        return;

    }


    try {

        const result =
            await apiRequest(
                "/api/services/airtime",
                {
                    method: "POST",

                    body: JSON.stringify({

                        network,
                        phone,
                        amount

                    })

                }
            );


        showMessage(
            result.message ||
            "Airtime request submitted."
        );


    } catch (error) {

        showMessage(
            error.message
        );

    }

}


/* ================= CABLE ================= */

async function buyCable() {

    const provider =
        document
        .getElementById(
            "cableProvider"
        )
        .value;


    const number =
        document
        .getElementById(
            "cableNumber"
        )
        .value
        .trim();


    const packageName =
        document
        .getElementById(
            "cablePackage"
        )
        .value;


    if (!provider) {

        showMessage(
            "Select a cable provider."
        );

        return;

    }


    if (!number) {

        showMessage(
            "Enter Smartcard / IUC number."
        );

        return;

    }


    if (!packageName) {

        showMessage(
            "Select a package."
        );

        return;

    }


    if (!API_URL) {

        showMessage(
            "Cable TV is ready for backend/provider integration. No fake payment was made."
        );

        return;

    }


    try {

        const result =
            await apiRequest(
                "/api/services/cable",
                {
                    method: "POST",

                    body: JSON.stringify({

                        provider,
                        number,
                        packageName

                    })

                }
            );


        showMessage(
            result.message ||
            "Cable request submitted."
        );


    } catch (error) {

        showMessage(
            error.message
        );

    }

}


/* ================= ELECTRICITY ================= */

async function payElectricity() {

    const disco =
        document
        .getElementById(
            "electricityDisco"
        )
        .value;


    const meterNumber =
        document
        .getElementById(
            "meterNumber"
        )
        .value
        .trim();


    const amount =
        Number(
            document
            .getElementById(
                "electricityAmount"
            )
            .value
        );


    if (!disco) {

        showMessage(
            "Select your Disco."
        );

        return;

    }


    if (!meterNumber) {

        showMessage(
            "Enter meter number."
        );

        return;

    }


    if (!amount || amount <= 0) {

        showMessage(
            "Enter a valid amount."
        );

        return;

    }


    if (!API_URL) {

        showMessage(
            "Electricity payment is ready for backend/provider integration. No fake payment was made."
        );

        return;

    }


    try {

        const result =
            await apiRequest(
                "/api/services/electricity",
                {
                    method: "POST",

                    body: JSON.stringify({

                        disco,
                        meterNumber,
                        amount

                    })

                }
            );


        showMessage(
            result.message ||
            "Electricity request submitted."
        );


    } catch (error) {

        showMessage(
            error.message
        );

    }

}


/* ================= EXAM ================= */

async function buyExam() {

    const examType =
        document
        .getElementById(
            "examType"
        )
        .value;


    const quantity =
        Number(
            document
            .getElementById(
                "examQuantity"
            )
            .value
        );


    if (!examType) {

        showMessage(
            "Select an examination."
        );

        return;

    }


    if (!quantity || quantity < 1) {

        showMessage(
            "Enter a valid quantity."
        );

        return;

    }


    if (!API_URL) {

        showMessage(
            "Exam PIN is ready for backend/provider integration. No fake PIN was generated."
        );

        return;

    }


    try {

        const result =
            await apiRequest(
                "/api/services/exam",
                {
                    method: "POST",

                    body: JSON.stringify({

                        examType,
                        quantity

                    })

                }
            );


        showMessage(
            result.message ||
            "Exam PIN request submitted."
        );


    } catch (error) {

        showMessage(
            error.message
        );

    }

}


/* ================= WALLET FUNDING ================= */

async function fundWallet() {

    const amount =
        Number(
            document
            .getElementById(
                "depositAmount"
            )
            .value
        );


    if (!amount || amount < 100) {

        showMessage(
            "Enter an amount of at least ₦100."
        );

        return;

    }


    if (!API_URL) {

        showMessage(
            "Wallet funding will use a real payment provider after backend integration. No fake balance was added."
        );

        return;

    }


    try {

        const result =
            await apiRequest(
                "/api/wallet/deposit",
                {
                    method: "POST",

                    body: JSON.stringify({

                        amount

                    })

                }
            );


        if (result.paymentUrl) {

            window.location.href =
                result.paymentUrl;

            return;

        }


        showMessage(
            result.message ||
            "Deposit request created."
        );


    } catch (error) {

        showMessage(
            error.message
        );

    }

}


/* ================= TRANSACTIONS ================= */

async function loadTransactions() {

    const container =
        document.getElementById(
            "transactionList"
        );


    if (!container) return;


    if (!API_URL) {

        container.innerHTML = `
            <div class="empty-state">
                Backend is not connected yet.
                Real transactions will appear here
                after backend integration.
            </div>
        `;

        return;

    }


    try {

        const result =
            await apiRequest(
                "/api/transactions"
            );


        const transactions =
            result.transactions ||
            [];


        if (!transactions.length) {

            container.innerHTML = `
                <div class="empty-state">
                    No transactions available.
                </div>
            `;

            return;

        }


        container.innerHTML =
            transactions.map(tx => {

                return `
                    <div class="transaction-item">

                        <div>

                            <h4>
                                ${escapeHtml(
                                    tx.type ||
                                    "Transaction"
                                )}
                            </h4>

                            <p>
                                ${escapeHtml(
                                    tx.status ||
                                    "PENDING"
                                )}
                            </p>

                        </div>

                        <div class="transaction-amount">
                            ₦${Number(
                                tx.amount || 0
                            ).toLocaleString()}
                        </div>

                    </div>
                `;

            }).join("");


    } catch (error) {

        container.innerHTML = `
            <div class="empty-state">
                Unable to load transactions.
            </div>
        `;

    }

}


/* ================= REFERRAL ================= */

function renderReferral() {

    if (!currentUser) {

        return;

    }


    const code =
        currentUser.referral_code ||
        currentUser.referralCode ||
        "NOT AVAILABLE";


    setText(
        "referralCode",
        code
    );


    const link =
        window.location.origin +
        window.location.pathname +
        "?ref=" +
        encodeURIComponent(code);


    const input =
        document.getElementById(
            "referralLink"
        );


    if (input) {

        input.value =
            code === "NOT AVAILABLE"
                ? "Not available"
                : link;

    }

}


function copyReferral() {

    const element =
        document.getElementById(
            "referralCode"
        );


    const code =
        element
            ? element.textContent
            : "";


    if (
        !code ||
        code === "NOT AVAILABLE"
    ) {

        showMessage(
            "Referral code is not available."
        );

        return;

    }


    copyText(code);

}


function copyReferralLink() {

    const input =
        document.getElementById(
            "referralLink"
        );


    if (!input || !input.value) {

        showMessage(
            "Referral link is not available."
        );

        return;

    }


    copyText(
        input.value
    );

}


async function copyText(text) {

    try {

        await navigator.clipboard.writeText(
            text
        );

        showMessage(
            "Copied successfully."
        );

    } catch {

        showMessage(
            "Copy failed. Please copy it manually."
        );

    }

}


/* ================= LOGOUT ================= */

async function logout() {

    /*
       If backend uses an HttpOnly cookie,
       the backend logout route can invalidate
       the session there.

       Do not store passwords.
    */

    currentUser = null;


    sessionStorage.removeItem(
        "exdw_session"
    );


    showPage("home");


    showMessage(
        "You have been logged out."
    );

}


/* ================= ESCAPE HTML ================= */

function escapeHtml(value) {

    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}


/* ================= PHONE INPUT ================= */

function restrictNumberInput(
    elementId
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) return;


    element.addEventListener(
        "input",
        function() {

            this.value =
                this.value.replace(
                    /\D/g,
                    ""
                );

        }
    );

}


restrictNumberInput(
    "registerPhone"
);

restrictNumberInput(
    "registerNin"
);

restrictNumberInput(
    "dataPhone"
);

restrictNumberInput(
    "airtimePhone"
);


/* ================= STARTUP ================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        showPage("home");

        renderDataPlans();

        console.log(
            "EX-DATA WORLD frontend loaded."
        );

    }
);
