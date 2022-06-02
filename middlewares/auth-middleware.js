const jwt = require("jsonwebtoken");
const User = require("../models/user");
//인증을 하고 토큰값을  넘겨줌
module.exports = (req, res, next) => {
    const { authorization } = req.headers;
    const [tokenType, tokenValue] = authorization.split(' ');

    if (tokenType !== 'Bearer') {
        res.status(401).send({
            errorMessage: "로그인 후 사용하세요",
        })
        return;
    }

    try {
        const { userId} = jwt.verify(tokenValue, "my-secret-key");

        User.findById(userId).exec().then((user) => {
            res.locals.user = user;
            next();
        });
        ;
        
    } catch (error) {
        res.status(401).send({
            errorMessage: "로그인 후 사용하세요",
        });
        return;
    }

    


}