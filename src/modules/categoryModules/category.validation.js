import Joi from 'joi';


export const categoryValidationSchema={
    body: Joi.object().required().keys({
        categoryName: Joi.string().min(3).max(50).required().messages({
            'string.base': 'Category name must be a string',
            'string.empty': 'Category name cannot be empty',
            'string.min': 'Category name must have at least {3} characters',
            'string.max': 'Category name cannot exceed {50} characters',
            'any.required': 'Category name is required',
        }),
        categoryImage: Joi.string().allow(null, '').optional().messages({
            'string.base': 'Category image must be a string',
            'string.empty': 'Category image cannot be empty',
        }),
        createdBy: Joi.string().hex().messages({
            'string.base': 'Created by must be a string',
            'string.hex': 'Created by must be a hexadecimal string',
            'any.required': 'Created by is required',
        }),

    })

}

export const updateCategorySchema={
    body: Joi.object().required().keys({
        categoryName: Joi.string().min(3).max(50).required().messages({
            'string.base': 'Category name must be a string',
            'string.empty': 'Category name cannot be empty',
            'string.min': 'Category name must have at least {3} characters',
            'string.max': 'Category name cannot exceed {50} characters',
            'any.required': 'Category name is required',
        }),
        categoryImage: Joi.string().allow(null, '').optional().messages({
            'string.base': 'Category image must be a string',
            'string.empty': 'Category image cannot be empty',
        }),
    }),
    params: Joi.object().required().keys({
        categoryId: Joi.string().hex().min(24).max(24).required(),
    })
    

}


export const categoryIdValidation={
    params: Joi.object().required().keys({
    categoryId: Joi.string().hex().min(24).max(24).required(),
    })

}