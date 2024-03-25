import { paginationFunction } from "./pagination.js"

let populationPath = ["Category", "SubCategory", "Brand",
                        "Product", "Review"]


function population(current, end)
{
    if (populationPath[current] == end)
        return [{ path: end }]
    
    return  [{
        path: populationPath[current],
        populate: population(current + 1, end)
    }]
}



/**
 * @class APIFeatures
 * @constructor query, mongooseQuery
 * @description this class will be used to filter, sort, paginate and search the data
 * @method pagination  
 * @description this method will be used to divide the data into chunks or patches
 * @param {page, size}
 * @method sort
 * @description this method will be used to sort the data depending on the given field
 * @check if the field is not given then it will sort the data by createdAt field in descending order
 * @param {sortBy}
 * @method filters
 * @description this method will be used to filter the data depending on the given fields but more dynamically than the @mtethod search
 * @param {filters} => object contains the fields that we want to filter by 
 * @example 
 * @params will be in this formate
 * appliedPrice[gte]=100 
 * stock[lte]=200
 * discount[ne]=0
 * title[regex]=iphone
 * @object will be like this after the replace method
 * { appliedPrice: { $gte: 100 }, stock: { $lte: 200 }, discount: { $ne: 0 }, title: { $regex: 'iphone' }
 * @method populate
 * @description this method will be used to populate the data depending on the given fields
 * @param {begin, end}
 */

export class APIFeatures {
    constructor(mongooseQuery)
    {
        this.mongooseQuery = mongooseQuery
    }

    pagination({ page, size })
    {
        const { limit, skip } = paginationFunction({ page, size })

        this.mongooseQuery = this.mongooseQuery.limit(limit).skip(skip) 
        return this
    }

    sort(sortBy)
    {
        if (!sortBy)
        {
            this.mongooseQuery = this.mongooseQuery.sort({ createdAt: -1 })
            return this
        }
        const formula = sortBy.replace(/desc/g, -1).replace(/asc/g, 1).replace(/ /g, ':') 
        const [key, value] = formula.split(':')

        this.mongooseQuery = this.mongooseQuery.sort({ [key]: +value })
        return this
    }


    filters(filters) {

        /**
         * the filters will contian data like this
         * @params will be in this formate
            appliedPrice[gte]=100 
            stock[lte]=200
            discount[ne]=0
            title[regex]=iphone
        */
        if (!filters)
            return this
        const queryFilter = JSON.parse(
            JSON.stringify(filters).replace(
                /gt|gte|lt|lte|in|nin|eq|ne|regex/g,
                (operator) => `$${operator}`,
            ),
        )

        /**
         * @object will be like this after the replace method
         * { appliedPrice: { $gte: 100 }, stock: { $lte: 200 }, discount: { $ne: 0 }, title: { $regex: 'iphone' } 
         */
        this.mongooseQuery.find(queryFilter)
        return this
    }

    

    populate(begin, end)
    {
        let ind = 0, ind2 = 0
        while (ind < populationPath.length && populationPath[ind] != begin)
            ind++
        while (ind2 < populationPath.length && populationPath[ind2] != end)
            ind2++
        if (ind >= ind2)
            throw({ message: "invalid population path", cause: 400 })
            
        this.mongooseQuery = this.mongooseQuery.populate(population(ind + 1, end))
        return this
    }
}