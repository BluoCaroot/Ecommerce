

// Global response middleware
export const globalResponse = (err, req, res, next) => 
{
    if (err)
    {
        console.log(err.stack)
        res.status(err['cause'] || 500).json(
        {
            success: false,
            message: 'Catch error',
            error_msg: err.message,
        })
        next()
    }
}
