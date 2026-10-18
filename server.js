
const express = require("express");
const path = require("path");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Convert database rows to API-friendly objects.
function getCatProfile() {
    const cat = db.prepare(
        "SELECT * FROM cat_profile WHERE id = 1"
    ).get();

    if (!cat) return null;

    return {
        id: cat.id,
        name: cat.name,
        age: cat.age,
        weightKg: cat.weight_kg,
        favoriteFood: cat.favorite_food,
        activity: cat.activity
    };
}

function formatFeeding(row) {
    return {
        id: row.id,
        foodName: row.food_name,
        quantityGrams: row.quantity_grams,
        mealTime: row.meal_time,
        notes: row.notes,
        createdAt: row.created_at
    };
}

function formatWater(row) {
    return {
        id: row.id,
        offeredMl: row.offered_ml,
        consumedMl: row.consumed_ml,
        measured: Boolean(row.measured),
        notes: row.notes,
        createdAt: row.created_at
    };
}

// Health check
app.get("/api/health", (req, res) => {
    res.json({ success: true, message: "CatCare API is running!" });
});

// Get cat profile
app.get("/api/cat", (req, res) => {
    const cat = getCatProfile();

    if (!cat) {
        return res.status(404).json({
            success: false,
            message: "Cat profile not found."
        });
    }

    res.json({
        success: true,
        message: "Here is Mini's wellness profile! 🐾",
        cat
    });
});

// Edit cat profile
app.patch("/api/cat", (req, res) => {
    const current = getCatProfile();

    if (!current) {
        return res.status(404).json({
            success: false,
            message: "Cat profile not found."
        });
    }

    const name = req.body.name ?? current.name;
    const age = Number(req.body.age ?? current.age);
    const weightKg = Number(req.body.weightKg ?? current.weightKg);
    const favoriteFood = req.body.favoriteFood ?? current.favoriteFood;
    const activity = req.body.activity ?? current.activity;

    if (
        typeof name !== "string" || !name.trim() ||
        !Number.isFinite(age) || age < 0 ||
        !Number.isFinite(weightKg) || weightKg <= 0 ||
        typeof favoriteFood !== "string" || !favoriteFood.trim() ||
        typeof activity !== "string"
    ) {
        return res.status(400).json({
            success: false,
            message: "Please enter valid cat profile details."
        });
    }

    db.prepare(`
        UPDATE cat_profile
        SET name = ?, age = ?, weight_kg = ?,
            favorite_food = ?, activity = ?
        WHERE id = 1
    `).run(name.trim(), age, weightKg, favoriteFood.trim(), activity.trim());

    res.json({
        success: true,
        message: "Cat profile updated!",
        cat: getCatProfile()
    });
});

// Add feeding record
app.post("/api/feeding", (req, res) => {
    const { foodName, quantityGrams, mealTime, notes = "" } = req.body;

    if (
        typeof foodName !== "string" || !foodName.trim() ||
        !Number.isFinite(Number(quantityGrams)) ||
        Number(quantityGrams) <= 0 ||
        typeof mealTime !== "string" || !mealTime.trim() ||
        typeof notes !== "string"
    ) {
        return res.status(400).json({
            success: false,
            message: "Please enter valid feeding details."
        });
    }

    const result = db.prepare(`
        INSERT INTO feeding_records
            (food_name, quantity_grams, meal_time, notes, created_at)
        VALUES (?, ?, ?, ?, ?)
    `).run(
        foodName.trim(),
        Number(quantityGrams),
        mealTime,
        notes,
        new Date().toISOString()
    );

    const record = db.prepare(
        "SELECT * FROM feeding_records WHERE id = ?"
    ).get(result.lastInsertRowid);

    res.status(201).json({
        success: true,
        message: "Feeding record saved!",
        record: formatFeeding(record)
    });
});

// Get all feeding records
app.get("/api/feeding", (req, res) => {
    const rows = db.prepare(
        "SELECT * FROM feeding_records ORDER BY id ASC"
    ).all();

    res.json({
        success: true,
        count: rows.length,
        records: rows.map(formatFeeding)
    });
});

// Feeding summary
app.get("/api/feeding/summary", (req, res) => {
    const summary = db.prepare(`
        SELECT COUNT(*) AS totalRecords,
               COALESCE(SUM(quantity_grams), 0) AS totalGrams
        FROM feeding_records
    `).get();

    res.json({ success: true, ...summary });
});

// Edit feeding record
app.patch("/api/feeding/:id", (req, res) => {
    const id = Number(req.params.id);
    const { foodName, quantityGrams, mealTime, notes = "" } = req.body;

    if (
        !Number.isInteger(id) || id < 1 ||
        typeof foodName !== "string" || !foodName.trim() ||
        !Number.isFinite(Number(quantityGrams)) ||
        Number(quantityGrams) <= 0 ||
        typeof mealTime !== "string" || !mealTime.trim() ||
        typeof notes !== "string"
    ) {
        return res.status(400).json({
            success: false,
            message: "Please enter valid feeding details."
        });
    }

    const result = db.prepare(`
        UPDATE feeding_records
        SET food_name = ?, quantity_grams = ?, meal_time = ?, notes = ?
        WHERE id = ?
    `).run(foodName.trim(), Number(quantityGrams), mealTime, notes, id);

    if (!result.changes) {
        return res.status(404).json({
            success: false,
            message: "Feeding record not found."
        });
    }

    const record = db.prepare(
        "SELECT * FROM feeding_records WHERE id = ?"
    ).get(id);

    res.json({
        success: true,
        message: "Feeding record updated!",
        record: formatFeeding(record)
    });
});

// Delete feeding record
app.delete("/api/feeding/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
            success: false,
            message: "Invalid feeding record ID."
        });
    }

    const result = db.prepare(
        "DELETE FROM feeding_records WHERE id = ?"
    ).run(id);

    if (!result.changes) {
        return res.status(404).json({
            success: false,
            message: "Feeding record not found."
        });
    }

    res.json({ success: true, message: "Feeding record deleted!" });
});

// Add water record
app.post("/api/water", (req, res) => {
    const { offeredMl, consumedMl, measured = false, notes = "" } = req.body;

    if (
        !Number.isFinite(Number(offeredMl)) || Number(offeredMl) < 0 ||
        typeof measured !== "boolean" ||
        typeof notes !== "string" ||
        (measured && (
            consumedMl === null || consumedMl === undefined ||
            !Number.isFinite(Number(consumedMl)) || Number(consumedMl) < 0
        ))
    ) {
        return res.status(400).json({
            success: false,
            message: "Please enter valid water details."
        });
    }

    const result = db.prepare(`
        INSERT INTO water_records
            (offered_ml, consumed_ml, measured, notes, created_at)
        VALUES (?, ?, ?, ?, ?)
    `).run(
        Number(offeredMl),
        measured ? Number(consumedMl) : null,
        measured ? 1 : 0,
        notes,
        new Date().toISOString()
    );

    const record = db.prepare(
        "SELECT * FROM water_records WHERE id = ?"
    ).get(result.lastInsertRowid);

    res.status(201).json({
        success: true,
        message: "Water record saved!",
        record: formatWater(record)
    });
});

// Get all water records
app.get("/api/water", (req, res) => {
    const rows = db.prepare(
        "SELECT * FROM water_records ORDER BY id ASC"
    ).all();

    res.json({
        success: true,
        count: rows.length,
        records: rows.map(formatWater)
    });
});

// Water summary
app.get("/api/water/summary", (req, res) => {
    const summary = db.prepare(`
        SELECT COUNT(*) AS totalRecords,
               COALESCE(SUM(offered_ml), 0) AS totalOfferedMl,
               COALESCE(SUM(CASE WHEN measured = 1 THEN 1 ELSE 0 END), 0)
                   AS measuredConsumptionRecords,
               COALESCE(SUM(CASE WHEN measured = 1 THEN consumed_ml ELSE 0 END), 0)
                   AS totalMeasuredConsumedMl
        FROM water_records
    `).get();

    res.json({ success: true, ...summary });
});

// Edit water record
app.patch("/api/water/:id", (req, res) => {
    const id = Number(req.params.id);
    const { offeredMl, consumedMl, measured, notes = "" } = req.body;

    if (
        !Number.isInteger(id) || id < 1 ||
        !Number.isFinite(Number(offeredMl)) || Number(offeredMl) < 0 ||
        typeof measured !== "boolean" ||
        typeof notes !== "string" ||
        (measured && (
            consumedMl === null || consumedMl === undefined ||
            !Number.isFinite(Number(consumedMl)) || Number(consumedMl) < 0
        ))
    ) {
        return res.status(400).json({
            success: false,
            message: "Please enter valid water details."
        });
    }

    const result = db.prepare(`
        UPDATE water_records
        SET offered_ml = ?, consumed_ml = ?, measured = ?, notes = ?
        WHERE id = ?
    `).run(
        Number(offeredMl),
        measured ? Number(consumedMl) : null,
        measured ? 1 : 0,
        notes,
        id
    );

    if (!result.changes) {
        return res.status(404).json({
            success: false,
            message: "Water record not found."
        });
    }

    const record = db.prepare(
        "SELECT * FROM water_records WHERE id = ?"
    ).get(id);

    res.json({
        success: true,
        message: "Water record updated!",
        record: formatWater(record)
    });
});

// Delete water record
app.delete("/api/water/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
            success: false,
            message: "Invalid water record ID."
        });
    }

    const result = db.prepare(
        "DELETE FROM water_records WHERE id = ?"
    ).run(id);

    if (!result.changes) {
        return res.status(404).json({
            success: false,
            message: "Water record not found."
        });
    }

    res.json({ success: true, message: "Water record deleted!" });
});

// Daily wellness report (uses UTC creation date)
app.get("/api/wellness/daily", (req, res) => {
    const date = req.query.date;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({
            success: false,
            message: "Provide a date in YYYY-MM-DD format."
        });
    }

    const parsedDate = new Date(`${date}T00:00:00.000Z`);

    if (
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !== date
    ) {
        return res.status(400).json({
            success: false,
            message: "Please provide a valid calendar date."
        });
    }

    const cat = getCatProfile();

    const feeding = db.prepare(`
        SELECT COUNT(*) AS totalRecords,
               COALESCE(SUM(quantity_grams), 0) AS totalGrams
        FROM feeding_records
        WHERE substr(created_at, 1, 10) = ?
    `).get(date);

    const water = db.prepare(`
        SELECT COUNT(*) AS totalRecords,
               COALESCE(SUM(offered_ml), 0) AS totalOfferedMl,
               COALESCE(SUM(CASE WHEN measured = 1 THEN 1 ELSE 0 END), 0)
                   AS measuredConsumptionRecords,
               COALESCE(SUM(CASE WHEN measured = 1 THEN consumed_ml ELSE 0 END), 0)
                   AS totalMeasuredConsumedMl
        FROM water_records
        WHERE substr(created_at, 1, 10) = ?
    `).get(date);

    res.json({
        success: true,
        message: "Daily wellness report generated! 🐾",
        date,
        dateBasis: "UTC creation date",
        cat: cat ? {
            id: cat.id,
            name: cat.name,
            age: cat.age,
            weightKg: cat.weightKg
        } : null,
        feeding,
        water
    });
});

// Unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found."
    });
});

// JSON parsing errors and other errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && "body" in err) {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON request body."
        });
    }

    console.error(err);
    res.status(500).json({
        success: false,
        message: "Internal server error."
    });
});

app.listen(PORT, () => {
    console.log(`🐾 CatCare API running at http://localhost:${PORT}`);
});
