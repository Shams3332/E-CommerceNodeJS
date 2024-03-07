import Joi from 'joi';


export const signUpSchema = {
  body: Joi.object().required().keys({
    userName: Joi.string().required().min(3).max(10),
    email: Joi.string().required().email(),
    password: Joi.string().required().pattern(new RegExp(/^[A-Z][a-z0-9]{3,8}$/))
      .messages({
        'string.pattern.base': 'Password must be strong',
      }),
    CPassword: Joi.ref("password"),
    role: Joi.string().valid('user', 'admin'),
    isVerify: Joi.boolean().default(false),
    addresses: Joi.string(), 
    age: Joi.number(),
    phone: Joi.number(),
    resetCode: Joi.string().default(''),
    isActive: Joi.boolean().default(true),
    pendingUpdate: Joi.object().default(null).keys({
      field: Joi.string(),
      value: Joi.string(),
    }),
  }),
};




export const signInSchema = {
    body: Joi.object().required()
        .keys({
            password: Joi.string().required(),
            email: Joi.string().required()
        }),
};

export const resetPasswordSchema ={
    body: Joi.object().required()
    .keys({
        password: Joi.string()
      .pattern(new RegExp(/^[A-Z][a-z0-9]{3,8}$/))
      .required()
      .messages({
        'string.pattern.base':
          'Password must be strong',
      }),
        email: Joi.string().required()
    }),

}

