import Joi from 'joi';


export const productValidationSchema = {
    body: Joi.object().required().keys({
    productName: Joi.string().min(3).max(25).required().messages({
        'string.base': 'Product name must be a string',
        'string.empty': 'Product name cannot be empty',
        'string.min': 'Product name must have at least {3} characters',
        'string.max': 'Product name cannot exceed {25} characters',
        'any.required': 'Product name is required',
    }),
    productPrice: Joi.number().min(0).required().messages({
        'number.base': 'Product price must be a number',
        'number.min': 'Product price must be at least {1000}',
        'any.required': 'Product price is required',
    }),
    discount: Joi.number().min(0).max(100).messages({
        'number.base': 'Discount must be a number',
        'number.min': 'Discount must be at least {10}',
        'number.max': 'Discount cannot exceed {90}',
    }),
    productImage: Joi.string().messages({
        'string.empty': 'Product image cannot be empty',
        'any.required': 'Product image is required',
    }),
    category: Joi.string().hex().required().messages({
        'string.base': 'Category must be a string',
        'string.hex': 'Category must be a hexadecimal string',
        'any.required': 'Category is required',
    }),
    stock: Joi.number().min(0).messages({
        'number.base': 'Stock must be a number',
        'number.min': 'Stock cannot be negative',
    }),
    createdBy: Joi.string().hex().messages({
        'string.base': 'Created by must be a string',
        'string.hex': 'Created by must be a hexadecimal string',
        'any.required': 'Created by is required',
    }),
    })
}

export const updateProductSchema= {
    body: Joi.object().required().keys({
        productName: Joi.string().min(3).max(25).messages({
            'string.base': 'Product name must be a string',
            'string.empty': 'Product name cannot be empty',
            'string.min': 'Product name must have at least {3} characters',
            'string.max': 'Product name cannot exceed {25} characters',
            'any.required': 'Product name is required',
        }),
        productPrice: Joi.number().min(0).messages({
            'number.base': 'Product price must be a number',
            'number.min': 'Product price must be at least {1000}',
            'any.required': 'Product price is required',
        }),
        discount: Joi.number().min(0).max(100).messages({
            'number.base': 'Discount must be a number',
            'number.min': 'Discount must be at least {10}',
            'number.max': 'Discount cannot exceed {90}',
        }),
        productImage: Joi.string().messages({
            'string.empty': 'Product image cannot be empty',
            'any.required': 'Product image is required',
        }),
        category: Joi.string().hex().messages({
            'string.base': 'Category must be a string',
            'string.hex': 'Category must be a hexadecimal string',
            'any.required': 'Category is required',
        }),
        stock: Joi.number().min(0).messages({
            'number.base': 'Stock must be a number',
            'number.min': 'Stock cannot be negative',
        }),
        
        }),
        params: Joi.object().required().keys({
            productId: Joi.string().hex().min(24).max(24).required(),
        })
}

export const ProductsInCategorySchema={
    params: Joi.object().required().keys({
    allProductsInCategory: Joi.string().hex().min(24).max(24),
    categoryId: Joi.string().hex().min(24).max(24),
    })

}

export const productIdSchema={
    params: Joi.object().required().keys({
        productId: Joi.string().hex().min(24).max(24).required(),
    })

}