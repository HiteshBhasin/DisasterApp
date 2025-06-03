
import express from 'express';
const app =  express();
let port = process.env.PORT || 8080;
import fs from 'fs';
import path from 'path';



// app.get("/home" ,(req, res)=>{
//     const file= path.join(__dirname, './content/about.txt')
//     fs.readFile(file , 'utf8', (err,data) =>{
//         if (err) {
//             console.error('error parsing the file');
            
//         } else {
//             res.send(data)
//         }
//     })

// });
// app.use(express.static(path.join(__dirname, "../Client/build")));
// app.get("/*" , function (req, res){

//     res.sendFile(
//         path.join(__dirname, "../Client/build/index.html"),
//         (err)=>{
//             if(err){
//                 res.status(500).send(err)
//             }
//         }
//     );

// });


app.listen(port, ()=>{
    console.log(`server is running on ${port}`)
})