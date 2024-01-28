// const mysql = require('mysql2/promise');
// const bluebird = require('bluebird');
const ed = require('../../encoder-decoder/ed');

let connection;

const set_user_db_connection = (con)=>{
    connection = con;
}

// const connect_database = async () => {
//     try {
//         connection = await mysql.createPool({
//             host: process.env.DB_HOST,
//             user: process.env.DB_USERNAME,
//             password: process.env.DB_PASSWORD,
//             database: process.env.MYSQL_DATABASE
//         });
//         console.log("Database Connected!");
//     } catch (e) {
//         console.error(e);
//     }
// }

const isUserExists = async (user_whatsapp_no) => {
    const [rows] = await connection.execute("SELECT * FROM users WHERE user_whatsapp_no = ?", [user_whatsapp_no]);
    if(rows.length > 0) {
        if(rows[0].user_fullname !== null){
            rows[0].user_fullname = await ed.decode_ed(rows[0].user_fullname);
        }
    }
    return rows;
}

const registerUser = async (user_whatsapp_no) => {
    await connection.execute("INSERT INTO users (user_whatsapp_no) VALUES (?)", [user_whatsapp_no]);
}

const updateUserName = async(user_whatsapp_no,user_fullname)=>{
    user_fullname = await ed.encode_ed(user_fullname);
    await connection.execute("UPDATE users SET user_fullname = ? WHERE user_whatsapp_no = ?", [user_fullname,user_whatsapp_no]);
}

const updateUserState = async(user_whatsapp_no,user_new_state)=>{
    await connection.execute("UPDATE users SET user_state = ? WHERE user_whatsapp_no = ?", [user_new_state,user_whatsapp_no]);
}


// const makeUserTask = async (user_whatsapp_no,task) => {
//     await connection.execute(`DELETE from user_tasks where user_whatsapp_no = '${user_whatsapp_no}'`);
//     const [rows] = await connection.execute("INSERT INTO user_tasks (user_whatsapp_no,task) VALUES (?,?)", [user_whatsapp_no,task]);
//     return rows;
// }


// console.log(rows);

// connection.execute("INSERT INTO users (user_fullname,user_whatsapp_no) VALUES (?, ?)", ['Morty', 14], (error,results)=>{
//     if (error){
//         console.log(error);
//     }else{
//         console.log(results);
//     }                                                                     
// });

module.exports = {
    isUserExists,
    registerUser,updateUserName,
    updateUserState,set_user_db_connection
}