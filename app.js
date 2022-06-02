const express = require("express");
const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const User = require("./models/user");
const authMiddleware = require("./middlewares/auth-middleware");

mongoose.connect("mongodb://localhost/homework", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

const app = express();
const router = express.Router();

const postUsersSchema = Joi.object({
    nickname: Joi.string().min(3).alphanum().required(),
    password: Joi.string().min(4).required(),
    confirmPassword: Joi.string().min(4).required(),

});

router.post("/users", async (req, res) =>{
    try{const { nickname, password, confirmPassword } = await postUsersSchema.validateAsync(req.body);

    if (password !== confirmPassword) {
        res.status(400).send({
            errorMessage: "패스워드가 패스워드 확인란과 동일하지 않습니다.",
        });
        return;
    }

    const existUsers = await User.find({
        $or: [{nickname }],
    });
    if (existUsers.length) {
        res.status(400).send({
            errorMessage: "중복된 닉네임입니다.",
        });
        return;
    }

    const user = new User({ nickname, password });
    await user.save();

    res.status(201).send({});

    } catch (err) {
        res.status(400).send({
            errorMessage: "요청한 데이터 형식이 올바르지 않습니다.",
        });
    }
    
});
//jwt 토큰 로그인api
router.post("/auth", async (req, res) => {
    const {email, password } = req.body;

    const user = await User.findOne({ email, password }).exec();

    if (!user) {
        res.status(400).send({
            errorMessage: "닉네임 또는 패스워드를 확인해주세요",
        });
        return;
    }

    const token = jwt.sign({ userId: user.userId }, "my-secret-key");
    res.send({
        token,
    })
})

//로그인 검즘
router.get("/users/me", authMiddleware, async (req, res) =>{
    const { user } = res.locals;
    res.send({
        user,
    });
})






app.use("/api", express.urlencoded({ extended: false }), router);


app.listen(8080, () => {
  console.log("서버가 요청을 받을 준비가 됐어요");
});