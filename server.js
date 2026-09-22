const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const jwt = require("jsonwebtoken");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET =
    process.env.JWT_SECRET || "EX_DATA_WORLD_CHANGE_THIS_SECRET";

// ===============================
// DATABASE
// ===============================

const db = new Database("ex-data-world.db");

db.pragma("journal_mode = WAL");

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL UNIQUE,
        nin_hash TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        referral_code TEXT,
        balance REAL DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        amount REAL DEFAULT 0,
        status TEXT DEFAULT 'pending',
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
`);

// ===============================
// HELPERS
// ===============================

function createToken(user) {
    return jwt.sign(
        {
            id: user.id,
            username: user.username
        },
        JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
}

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Authentication required."
        });
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired session."
        });
    }
}

// ===============================
// HEALTH
// ===============================

app.get("/api/health", (req, res) => {
    res.json({
        ok: true,
        app: "EX-DATA WORLD",
        backend: "online"
    });
});

// ===============================
// REGISTER
// ===============================

app.post("/api/auth/register", async (req, res) => {
    try {
        const {
            fullName,
            username,
            email,
            phone,
            nin,
            password,
            referral
        } = req.body;

        if (
            !fullName ||
            !username ||
            !email ||
            !phone ||
            !nin ||
            !password
        ) {
            return res.status(400).json({
                message: "Please fill all required fields."
            });
        }

        if (!/^\d{11}$/.test(String(nin))) {
            return res.status(400).json({
                message: "NIN must contain 11 digits."
            });
        }

        if (String(password).length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters."
            });
        }

        const existingUser = db
            .prepare(`
                SELECT id
                FROM users
                WHERE username = ?
                   OR email = ?
                   OR phone = ?
                LIMIT 1
            `)
            .get(username, email, phone);

        if (existingUser) {
            return res.status(409).json({
                message:
                    "Username, email, or phone number is already registered."
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        // Never store the raw NIN.
        const crypto = require("crypto");

        const ninHash = crypto
            .createHash("sha256")
            .update(String(nin))
            .digest("hex");

        const result = db
            .prepare(`
                INSERT INTO users
                (
                    full_name,
                    username,
                    email,
                    phone,
                    nin_hash,
                    password_hash,
                    referral_code,
                    balance
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, 0)
            `)
            .run(
                fullName.trim(),
                username.trim(),
                email.trim().toLowerCase(),
                phone.trim(),
                ninHash,
                passwordHash,
                referral ? String(referral).trim() : null
            );

        const user = db
            .prepare(`
                SELECT
                    id,
                    full_name,
                    username,
                    email,
                    phone,
                    balance,
                    referral_code,
                    created_at
                FROM users
                WHERE id = ?
            `)
            .get(result.lastInsertRowid);

        const token = createToken(user);

        return res.status(201).json({
            message: "Account created successfully.",
            token,
            user
        });

    } catch (error) {
        console.error("REGISTER ERROR:", error);

        return res.status(500).json({
            message: "Unable to create account."
        });
    }
});

// ===============================
// LOGIN
// ===============================

app.post("/api/auth/login", async (req, res) => {
    try {
        const { identity, password } = req.body;

        if (!identity || !password) {
            return res.status(400).json({
                message: "Enter your username/email/phone and password."
            });
        }

        const user = db
            .prepare(`
                SELECT *
                FROM users
                WHERE username = ?
                   OR email = ?
                   OR phone = ?
                LIMIT 1
            `)
            .get(
                String(identity).trim(),
                String(identity).trim().toLowerCase(),
                String(identity).trim()
            );

        if (!user) {
            return res.status(401).json({
                message: "Invalid login details."
            });
        }

        const passwordCorrect = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordCorrect) {
            return res.status(401).json({
                message: "Invalid login details."
            });
        }

        const safeUser = {
            id: user.id,
            full_name: user.full_name,
            username: user.username,
            email: user.email,
            phone: user.phone,
            balance: user.balance,
            referral_code: user.referral_code,
            created_at: user.created_at
        };

        const token = createToken(safeUser);

        return res.json({
            message: "Login successful.",
            token,
            user: safeUser
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);

        return res.status(500).json({
            message: "Unable to login."
        });
    }
});

// ===============================
// CURRENT USER
// ===============================

app.get("/api/auth/me", authMiddleware, (req, res) => {
    const user = db
        .prepare(`
            SELECT
                id,
                full_name,
                username,
                email,
                phone,
                balance,
                referral_code,
                created_at
            FROM users
            WHERE id = ?
        `)
        .get(req.user.id);

    if (!user) {
        return res.status(404).json({
            message: "User not found."
        });
    }

    res.json({
        user
    });
});

// ===============================
// WALLET
// ===============================

app.get("/api/wallet", authMiddleware, (req, res) => {
    const user = db
        .prepare(`
            SELECT balance
            FROM users
            WHERE id = ?
        `)
        .get(req.user.id);

    if (!user) {
        return res.status(404).json({
            message: "User not found."
        });
    }

    res.json({
        balance: user.balance
    });
});

// ===============================
// TRANSACTIONS
// ===============================

app.get("/api/transactions", authMiddleware, (req, res) => {
    const transactions = db
        .prepare(`
            SELECT
                id,
                type,
                amount,
                status,
                description,
                created_at
            FROM transactions
            WHERE user_id = ?
            ORDER BY id DESC
        `)
        .all(req.user.id);

    res.json({
        transactions
    });
});

// ===============================
// WALLET DEPOSIT
// ===============================

app.post("/api/wallet/deposit", authMiddleware, (req, res) => {
    const amount = Number(req.body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({
            message: "Enter a valid amount."
        });
    }

    // IMPORTANT:
    // This does NOT add money to the user's wallet.
    // Real deposits must be confirmed by a payment provider webhook.

    const transaction = db
        .prepare(`
            INSERT INTO transactions
            (
                user_id,
                type,
                amount,
                status,
                description
            )
            VALUES (?, ?, ?, ?, ?)
        `)
        .run(
            req.user.id,
            "wallet_deposit",
            amount,
            "pending",
            "Wallet funding request"
        );

    res.status(201).json({
        message:
            "Deposit request created. Payment provider confirmation is required.",
        transactionId: transaction.lastInsertRowid,
        status: "pending"
    });
});

// ===============================
// PLACEHOLDER SERVICES
// ===============================

app.post("/api/services/data", authMiddleware, (req, res) => {
    res.status(503).json({
        message:
            "DATA provider is not connected yet. No money was deducted."
    });
});

app.post("/api/services/airtime", authMiddleware, (req, res) => {
    res.status(503).json({
        message:
            "AIRTIME provider is not connected yet. No money was deducted."
    });
});

app.post("/api/services/cable", authMiddleware, (req, res) => {
    res.status(503).json({
        message:
            "CABLE provider is not connected yet. No money was deducted."
    });
});

app.post("/api/services/electricity", authMiddleware, (req, res) => {
    res.status(503).json({
        message:
            "ELECTRICITY provider is not connected yet. No money was deducted."
    });
});

app.post("/api/services/exam", authMiddleware, (req, res) => {
    res.status(503).json({
        message:
            "EXAM PIN provider is not connected yet. No money was deducted."
    });
});

// ===============================
// ROOT
// ===============================

app.get("/", (req, res) => {
    res.send("EX-DATA WORLD Backend is running.");
});

// ===============================
// START SERVER
// ===============================

app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `EX-DATA WORLD Backend running on port ${PORT}`
    );
});
