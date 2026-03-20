const asyncHandler = (requestHandler) =>{
    return(err, req, res, next) =>{
        Promise.resolve(requestHandler(err, req, res, next)).catch((error) => next(error));
    }
}

export default asyncHandler;