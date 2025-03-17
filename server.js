const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const csv = require("csv-parser");

const app = express();
app.use(bodyParser.json());

// Test CICD container 2 test

app.post("/calculate", (req, res) => {
    const { file, product } = req.body;

    if (!file || !product) {
        return res.status(400).json({
            file: file || null,
            error: "Invalid JSON input."
        });
    }

    const filePath = `/jaykumar_PV_dir/${file}`;

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            file: file,
            error: "File not found."
        });
    }

    let sum = 0;
    let hasValidFormat = false;
    let headerChecked = false;

    fs.createReadStream(filePath)
        .pipe(csv({
            mapHeaders: ({ header }) => header.trim().toLowerCase()
        }))
        .on("headers", (headers) => {
            headerChecked = true;
            hasValidFormat = headers.includes("product") && headers.includes("amount");
        })
        .on("data", (row) => {
            if (!hasValidFormat) return;

            if (row.product === product) {
                const amount = parseInt(row.amount, 10);
                if (!isNaN(amount)) {
                    sum += amount;
                }
            }
        })
        .on("end", () => {
            if (!headerChecked || !hasValidFormat) {
                return res.status(400).json({
                    file: file,
                    error: "Input file not in CSV format."
                });
            }
            return res.json({
                file: file,
                sum: sum
            });
        })
        .on("error", () => {
            return res.status(400).json({
                file: file,
                error: "Input file not in CSV format."
            });
        });
});

const PORT = 6001;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Container 2 listening on port ${PORT}`);
});