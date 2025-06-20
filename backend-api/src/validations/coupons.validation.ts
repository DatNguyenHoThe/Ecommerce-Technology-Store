import * as yup from 'yup';


//get all
const getAllSchema = yup
  .object({
    query: yup.object({
      page: yup.number().integer().positive().optional(),
      limit: yup.number().integer().positive().optional(),
      sort_type: yup.string().oneOf(['asc', 'desc']).optional(),
      sort_by: yup.string().oneOf(['createdAt', 'category_name']).optional(),
      keyword: yup.string().min(2).max(50).optional(),
    }),
  })
  .required();

  //get by id
  const getByIdSchema = yup
  .object({
    params: yup.object({
      id: yup.string().matches(/^[0-9a-fA-F]{24}$/, {message: 'ID is non-ObjectID'}).required(),
    }),
  })
  .required();// khi truyền vào object phải tồn tại

  //create
const createSchema = yup
  .object({
    body: yup.object({
        code: yup.string().max(50).required(), 
        type: yup.string().oneOf(["percentage", "fixed"]).max(20).required(),
        value: yup.number().positive().required(),
        minPurchase: yup.number().min(0).optional(),
        startDate: yup.date().required(),
        endDate: yup.date().required(),
        usageLimit: yup.number().min(0).optional(),
        usageCount: yup.number().min(0).required(),
        isActive: yup.boolean().required(),
    }),
  })
  .required();// khi truyền vào object phải tồn tại




//update by id
const updateByIdSchema = yup
  .object({
    params: yup.object({
        id: yup.string().matches(/^[0-9a-fA-F]{24}$/, {message: 'ID is non-ObjectID'}).required(),
    }),
    body: yup.object({
        code: yup.string().max(50).optional(), 
        type: yup.string().oneOf(["percentage", "fixed"]).max(20).optional(),
        value: yup.number().positive().optional(),
        minPurchase: yup.number().min(0).optional(),
        startDate: yup.date().optional(),
        endDate: yup.date().optional(),
        usageLimit: yup.number().min(0).optional(),
        usageCount: yup.number().min(0).optional(),
        isActive: yup.boolean().optional(),
    })
  })
  .required();

  //delete by id
const deleteByIdSchema = yup
.object({
  params: yup.object({
      id: yup.string().matches(/^[0-9a-fA-F]{24}$/, {message: 'ID is non-ObjectID'}).required(),
  }),
  body: yup.object({
    code: yup.string().max(50).optional(), 
        type: yup.string().oneOf(["percentage", "fixed"]).max(20).optional(),
        value: yup.number().positive().optional(),
        minPurchase: yup.number().min(0).optional(),
        startDate: yup.date().optional(),
        endDate: yup.date().optional(),
        usageLimit: yup.number().min(0).optional(),
        usageCount: yup.number().min(0).optional(),
        isActive: yup.boolean().optional(),
  })
})
.required();

// check coupon
const checkSchema = yup.object({
  body: yup.object({
    code: yup.string().required("Mã giảm giá là bắt buộc"),
    items: yup.array().of(
      yup.object({
        productId: yup.string().required(),
        price: yup.number().required(),
        salePrice: yup.number().optional(),
        quantity: yup.number().min(1).required(),
      })
    ).min(1, "Phải có ít nhất một sản phẩm để áp dụng mã giảm giá"),
  }),
}).required();

export default {
    getAllSchema,
    getByIdSchema,
    createSchema,
    updateByIdSchema,
    deleteByIdSchema,
    checkSchema
};