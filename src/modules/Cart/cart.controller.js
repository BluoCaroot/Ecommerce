import Cart from '../../../DB/Models/cart.model.js';
import Product from '../../../DB/Models/product.model.js'

/**
 * @param { productId , quantity }  from req.body
 * @param { userId } from req.authUser
 * @description  Add the specified product to the user's cart.
 * @returns  the updated cart with the new product added to it or the new cart if the user doesn't have a cart.
 * @throws 404 - if the product not found or not available
 * @throws 400 - if the product not added to cart
 * @throws 201 - if the product added to cart successfully
 * @throws 500 - if any error occurs
 */

export const addProductToCart = async (req, res, next) =>
{
    const {productId, quantity} = req.body;
    const {_id} = req.authUser;

    const doesProductExist = await Product.findById(productId);
    if (!doesProductExist || doesProductExist.stock < quantity)
        return (next({cause: 404, message: 'Product not found or not available'}));
    
    const userCart = await Cart.findOne({userId: _id});

    if (!userCart)
    {
        const cartObj = 
        {
            userId: _id,
            products:
            [{
                productId, 
                quantity,
                basePrice: doesProductExist.appliedPrice,
                finalPrice: doesProductExist.appliedPrice * quantity,
                title: doesProductExist.title
            }],
            subTotal: doesProductExist.appliedPrice * quantity
        }
        console.log(cartObj)
        const newCart = await Cart.create(cartObj);
        req.savedDocuments.push({model: Cart, _id: newCart._id, method: 'add'});
        return res.status(201).json({message: "Product added to cart successfully", data: newCart});
    }

    req.savedDocuments.push({model: Cart, _id: userCart._id, method: 'edit', old: userCart.toObject()});
    
    for (const product of userCart.products)
    {
        if (product.productId == productId)
        {
            product.quantity += quantity;
            const updatedCart = await userCart.save();
            return res.status(201).json({message: "Product added to cart successfully", data: updatedCart});
        }
    }
    userCart.products.push(
    {
        productId, 
        quantity,
        basePrice: doesProductExist.appliedPrice,
        title: doesProductExist.title
    })
    const productAdded = await userCart.save()
    if (!productAdded)
        return (next(new Error({cause: 400, message: 'Product not added to cart'})));
    res.status(201).json({message: "Product added to cart successfully", data: userCart});
}

/** 
 * @param { productId } from req.params
 * @param { userId } from req.authUser 
 * @description  Update the cart by removing the specified product from the user's cart. 
*/
export const removeProductFromCart = async (req, res, next) =>
{
    const {productId} = req.params;
    const {_id} = req.authUser;

    const userCart = await Cart.findOne({userId: _id, 'products.productId': productId});

    if (!userCart)
        return (next({cause: 404, message: 'Product not found in cart'}));
    
    req.savedDocuments.push({model: Cart, _id: userCart._id, method: 'edit', old: userCart.toObject()});
    userCart.products = userCart.products.filter(product => product.productId.toString() !== productId)

    const productRemoved = await userCart.save();
    if (!productRemoved)
        return (next({cause: 400, message: 'Product not removed from cart'}));

    if (!userCart.products.length)
    {
        req.savedDocuments.push({model: Cart, _id: userCart._id, method: 'delete', old: userCart.toObject()});
        await Cart.findByIdAndDelete(userCart._id);
    }

    return res.status(200).json({message: 'Product removed from cart successfully'});

}