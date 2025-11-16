export const staffController = (req, res) => {
    const { email, password } = req.body;

    if (email === "tech@querynest.com" && password === "123") {
        // For simplicity, we generate a dummy token
        const token = "tech-token-123"; // could use JWT if needed
        return res.status(200).json({ message: "Login successful", token });
    } else {
        return res.status(401).json({ error: "Invalid credentials" });
    }
};
