let connection;

const set_owner_db_connection = (con)=>{
    connection = con;
}

const fetch_owners = async () => {
    const [rows] = await connection.execute("SELECT * FROM owner_details ");
    return rows;
}

module.exports = {
    fetch_owners,
    set_owner_db_connection
}