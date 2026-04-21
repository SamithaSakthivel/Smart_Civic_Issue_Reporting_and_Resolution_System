const allowedOrigins=require("./allowedOrigins");


const corsOptions={
    origin:(origin,callback)=>{
        if(!origin || allowedOrigins.indexOf(origin)!==-1){
            callback(null,true);
        }
        else{
            callback(new Error('Not Allowed by CORS'))
        }
    },
    credentials:true,
    optionsSuccessStatus:200,
    methods:["GET","POST","PUT","PATCH","OPTIONS","DELETE"],
    allowedHeaders:["Content-Type","Authorization"]
}

module.exports=corsOptions;