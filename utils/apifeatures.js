class Apifeatures{
    constructor(query,queryStr){
        this.query=query
        this.queryStr=queryStr
    }

    //search features
    search(){
        const keyword=this.queryStr.keyword ? {
            name:{
                $regex:this.queryStr.keyword,
                $options:"i"
            }
        } : {}

        this.query=this.query.find({...keyword})

        return this
    }

    filter(){
        const queryCopy={...this.queryStr}

        // removing some filds for categoury
        const removeFilds=["keyword","page","limit"];

        removeFilds.forEach((key)=>delete queryCopy[key])

        // filter for price
        let queryStr=JSON.stringify(queryCopy)
        queryStr=queryStr.replace(/\b(gt|gte|lt|lte)\b/g,(key)=>`$${key}`)
        
        this.query=this.query.find(JSON.parse(queryStr))

        return this

    }

    pagination(resultPerPage){
        const currentPage=Number(this.queryStr.page) || 1;  
        const skip=currentPage * (currentPage-1)

        this.query=this.query.limit(resultPerPage).skip(skip)

        return this
    }
}


export {Apifeatures}