// const mysql = require('mysql2/promise');
// const bluebird = require('bluebird');

const ed = require('../../encoder-decoder/ed');

let connection;

const set_user_ride_db_connection = (con) => {
  connection = con;
};

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

const register_ride = async (user_whatsapp_no) => {
  await connection.execute(
    'INSERT INTO user_ride (user_whatsapp_no) VALUES (?)',
    [user_whatsapp_no]
  );
};

const set_ride_local_or_outstation = async (
  user_whatsapp_no,
  local_or_outstation
) => {
  await connection.execute(
    'UPDATE user_ride SET local_or_outstation = ? WHERE user_whatsapp_no = ? and ride_status = 1 ORDER BY r_id DESC LIMIT 1',
    [local_or_outstation, user_whatsapp_no]
  );
};

const set_ride_day_or_night = async (user_whatsapp_no, day_or_night) => {
  await connection.execute(
    'UPDATE user_ride SET day_or_night = ? WHERE user_whatsapp_no = ? and ride_status = 1 ORDER BY r_id DESC LIMIT 1',
    [day_or_night, user_whatsapp_no]
  );
};

const set_ride_oneway_or_return = async (
  user_whatsapp_no,
  oneway_or_return
) => {
  await connection.execute(
    'UPDATE user_ride SET oneway_or_return = ? WHERE user_whatsapp_no = ? and ride_status = 1 ORDER BY r_id DESC LIMIT 1',
    [oneway_or_return, user_whatsapp_no]
  );
};

const set_ride_pickup_location = async (user_whatsapp_no, pickup_location) => {
  pickup_location = await ed.encode_ed(pickup_location);
  await connection.execute(
    'UPDATE user_ride SET pickup_location = ? WHERE user_whatsapp_no = ? and ride_status = 1 ORDER BY r_id DESC LIMIT 1',
    [pickup_location, user_whatsapp_no]
  );
};

const set_ride_drop_location = async (user_whatsapp_no, drop_location) => {
  drop_location = await ed.encode_ed(drop_location);
  await connection.execute(
    'UPDATE user_ride SET drop_location = ? WHERE user_whatsapp_no = ? and ride_status = 1 ORDER BY r_id DESC LIMIT 1',
    [drop_location, user_whatsapp_no]
  );
};

const set_ride_date = async (user_whatsapp_no, ride_date) => {
  console.log('ride_date', ride_date);
  await connection.execute(
    'UPDATE user_ride SET ride_date = ? WHERE user_whatsapp_no = ? and ride_status = 1 ORDER BY r_id DESC LIMIT 1',
    [ride_date, user_whatsapp_no]
  );
};

const set_ride_time = async (user_whatsapp_no, ride_time) => {
  await connection.execute(
    'UPDATE user_ride SET ride_time = ? WHERE user_whatsapp_no = ? and ride_status = 1 ORDER BY r_id DESC LIMIT 1',
    [ride_time, user_whatsapp_no]
  );
};

const cancle_ride_booking = async (user_whatsapp_no) => {
  await connection.execute('UPDATE user_ride SET ride_status = 3 WHERE user_whatsapp_no = ? ORDER BY r_id DESC LIMIT 1', [
    user_whatsapp_no,
  ]);
};

const get_user_ride_confirmed = async (user_whatsapp_no) => {
  const [rows] = await connection.execute(
    'SELECT * FROM user_ride WHERE user_whatsapp_no = ? and ride_status = 2 ORDER BY r_id DESC LIMIT 1',
    [user_whatsapp_no]
  );
  return rows;
};

const get_user_ride = async (user_whatsapp_no) => {
  const [rows] = await connection.execute(
    'SELECT * FROM user_ride WHERE user_whatsapp_no = ? ORDER BY r_id DESC LIMIT 1',
    [user_whatsapp_no]
  );
  return rows;
};

const set_ride_confirm_booking = async (user_whatsapp_no) => {
  await connection.execute(
    'UPDATE user_ride SET ride_status = 2 WHERE user_whatsapp_no = ? ORDER BY r_id DESC LIMIT 1',
    [user_whatsapp_no]
  );
};

const set_ride_completed = async (user_whatsapp_no) => {
  await connection.execute(
    'UPDATE user_ride SET ride_status = 4 WHERE user_whatsapp_no = ? ORDER BY r_id DESC LIMIT 1',
    [user_whatsapp_no]
  );
};

const fetch_confimed_rides = async () => {
  const [rows] = await connection.execute(
    'SELECT * FROM user_ride WHERE ride_status = 2'
  );
  return rows;
};

const fetch_confimed_client_ride = async (user_whatsapp_no) => {
  const [rows] = await connection.execute(
    'SELECT * FROM user_ride WHERE ride_status = 2 and user_whatsapp_no = ? ORDER BY r_id DESC LIMIT 1',[user_whatsapp_no]
  );
  return rows;
};

const fetch_not_confirmed_rides = async () => {
  const [rows] = await connection.execute(
    'SELECT * FROM user_ride WHERE ride_status = 1 or ride_status = 2'
  );
  return rows;
};

module.exports = {
  register_ride,
  set_ride_local_or_outstation,
  set_ride_day_or_night,
  set_ride_oneway_or_return,
  set_ride_pickup_location,
  set_ride_drop_location,
  set_ride_date,
  set_ride_time,
  cancle_ride_booking,
  get_user_ride_confirmed,
  set_ride_confirm_booking,
  set_user_ride_db_connection,
  fetch_confimed_rides,
  get_user_ride,
  fetch_not_confirmed_rides,
  set_ride_completed,
  fetch_confimed_client_ride
};
