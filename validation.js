const Joi = require('@hapi/joi');


//Register Validation
const registerValidation = data => {
    const schema = {
        fullname: Joi.string().required(),
        email: Joi.string().required().email(),
        password: Joi.string().required(),
    };
    return Joi.validate(data, schema);
}

//Login Validation
const loginValidation = data => {
    const schema = {
        email: Joi.string().required().email(),
        password: Joi.string().required(),
    };
    return Joi.validate(data, schema);
}

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
