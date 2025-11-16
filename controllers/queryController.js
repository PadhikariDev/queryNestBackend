import Query from "../models/Query.js";
import natural from "natural";

const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Define keywords for tags
const tagKeywords = {
    Technical: ["error", "crash", "bug", "issue", "problem"],
    Request: ["request", "feature", "add", "update"],
    Question: ["how", "what", "why", "help", "question"],
    Payment: ["payment", "invoice", "billing", "refund"],
    "UI/UX": ["ui", "ux", "design", "layout", "button", "color"],
};

// Define keywords for priority
const priorityKeywords = {
    High: ["crash", "urgent", "error", "fail", "critical"],
    Normal: [],
    Low: ["suggestion", "request", "idea", "feature"],
};

export const createQuery = async (req, res) => {
    try {
        const { categories, message } = req.body;

        if (!categories || !message)
            return res.status(400).json({ error: "All fields required" });

        // Tokenize and stem the message
        const tokens = tokenizer.tokenize(message.toLowerCase());
        const stemmedTokens = tokens.map(token => stemmer.stem(token));

        // Detect tags
        const tags = [];
        for (let [tag, keywords] of Object.entries(tagKeywords)) {
            for (let kw of keywords) {
                const stemmedKw = stemmer.stem(kw);
                if (stemmedTokens.includes(stemmedKw)) {
                    tags.push(tag);
                    break; // stop after first match
                }
            }
        }

        const uniqueTags = [...new Set(tags)];
        if (uniqueTags.length === 0) uniqueTags.push("General");

        // Detect priority
        let priority = "Normal";

        // Priority check order: High first, then Low, then default Normal
        const priorityOrder = ["High", "Low"];
        for (let p of priorityOrder) {
            for (let kw of priorityKeywords[p]) {
                const stemmedKw = stemmer.stem(kw);
                if (stemmedTokens.includes(stemmedKw)) {
                    priority = p;
                    break;
                }
            }
            if (priority !== "Normal") break;
        }


        // Save query
        const newQuery = await Query.create({
            categories,
            message,
            tags: uniqueTags,
            priority,
        });

        res.status(201).json({
            message: "Query submitted successfully",
            query: newQuery,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

export const myQueries = async (req, res) => {
    try {
        const queries = await Query.find({ userId: req.user }).sort({ submittedAt: -1 });
        res.json({ queries });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
