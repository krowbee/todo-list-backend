const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    refreshToken: {type: String}
}, { timestamps: true });

userSchema.pre(
    "save",
    async function (next) {
        if (!this.isModified("password")) return next();
        const hash = await bcrypt.hash(this.password, 10);
        this.password = hash;
        next();
    }
)

userSchema.methods.isValidPassword = async function (password) {
    const user = this;
    const compare = await bcrypt.compare(password, user.password);

    return compare;
}

module.exports = mongoose.model("User", userSchema);