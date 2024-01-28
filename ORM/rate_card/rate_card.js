let connection;

const set_rate_card_db_connection = (con)=>{
    connection = con;
}

const fetch_rate_card = async () => {
    const [rows] = await connection.execute("SELECT * FROM rate_card");
    return rows;
}

module.exports = {
    set_rate_card_db_connection,
    fetch_rate_card
}