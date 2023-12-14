const config = require('../config')

module.exports = async (req, res, next) => {
    jwt.verify(req.token, config.JWT_SECRET_KEY, async function (err, data) {
        if (err) {
            console.log(err);
            res.sendStatus(403);
        } else {
            const _data = await jwt.decode(req.token, {
                complete: true,
                json: true
            });
            req.user = _data['payload'];
            req.user_id = req.user.id;
            req.email = req.user.email;
            req.bnb_address = req.user.bnb_address;
            //  console.log(req.user.email);
            // check if user is active or not 
            let userDetails = await UserModel.getUsersDetails(req.user.email);
            next();
            // if (userDetails[0].is_active == 0) {
            //     return res.sendStatus(403);
            // } else {
            //     next();
            // }
        }
    })
}




const jwtToken = (req, res) => {
    const r = jwt.sign({
        email: 'user@example.com',
        id: '1',
        'bnb_address': 'djdjdjdhdghdhdjhdiehg'
    }, config.JWT_SECRET_KEY, {
        expiresIn: config.SESSION_EXPIRES_IN
    });

    res.body.token = r
    return res.send({
        token: r
    })
}
module.exports = jwtToken