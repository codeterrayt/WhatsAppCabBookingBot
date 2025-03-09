const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const axios = require("axios").default;
const user_db = require("./ORM/user/user_orm");
const user_ride_db = require("./ORM/user/user_ride_orm");
const owner_db = require("./ORM/owner/owner_orm");
const rate_card_db = require("./ORM/rate_card/rate_card");
// const wish_user = require('./wish/wish');
const user_state = require("./user_state/user_state");
const r_funcs = require("./reusable_funcs/r_funcs");
const ed = require("./encoder-decoder/ed");
const moment = require("moment");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");
const cron = require("node-cron");
const { format } = require("mysql2/promise");
const admin_state = require("./admin_state/admin_state");
const fs = require("fs");
const readline = require("readline");
// const { all } = require('bluebird');
dotenv.config();

const chat_init_msg = ["hi", "hello", "hey"];
const owners = [];
const owner_commands = ["show booking", "show bookings", "complete"];

// Read user input from CLI
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const connect_database = async () => {
  try {
    let pool = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      multipleStatements: true, // Allows multiple queries in one execution
    });

    console.log("Database Connected!");
    // Explicitly set session timezone
    await pool.query(`SET time_zone = '${process.env.TIME_ZONE}';`);
    console.log(
      `✅ Database Connected with ${process.env.TIME_ZONE} Timezone!\n`
    );
    await migrateDatabase(pool); // Run migration check and execute if needed

    return pool;
  } catch (e) {
    console.error("Database connection failed:", e);
  }
};

// Function to ask user input
const askQuestion = (query) => {
  return new Promise((resolve) => rl.question(query, resolve));
};

const insertOwnerDetails = async (db) => {
  let owners = [];

  while (true) {
    let owner_whatsapp_no = await askQuestion(
      "📲 Enter Owner WhatsApp Number (or type 'done' to finish): "
    );

    if (owner_whatsapp_no.toLowerCase() === "done") break;

    if (!owner_whatsapp_no.trim()) {
      console.log("⚠️ WhatsApp Number cannot be empty! Please enter a valid number.");
      continue;
    }

    owners.push(owner_whatsapp_no);
  }

  if (owners.length > 0) {
    const values = owners.map((num, index) => [index + 1, num]); // Assign incremental IDs
    await db.query(
      "INSERT INTO owner_details (o_id, owner_whatsapp_no) VALUES ?",
      [values]
    );
    console.log("✅ Owner details inserted successfully!\n");
  } else {
    console.log("⚠️ No valid owner details entered. Skipping insertion.\n");
  }
};

// Insert rate card details
const insertRateCard = async (db) => {
  let rateCards = [];

  let proceed = await askQuestion(
    "📝 Do you want to create a rate card? (yes/done to finish): "
  );

  if (proceed.toLowerCase() === "done") {
    console.log("⏭ Skipping rate card entry...");
    return;
  }

  while (true) {
    console.log("\n📝 Enter Rate Card Details:");

    const getRequiredInput = async (prompt) => {
      let input;
      do {
        input = await askQuestion(`   ➤ ${prompt}: `);
        if (!input.trim()) console.log("⚠️ This field is required!");
      } while (!input.trim());
      return input;
    };

    let booking_type = await getRequiredInput("Booking Type");
    let shift_type = await getRequiredInput("Shift Type");
    let return_journey = await getRequiredInput("Return Journey (1 for Yes, 0 for No)");
    let start_time = await getRequiredInput("Start Time");
    let end_time = await getRequiredInput("End Time");
    let extra_hour_price = await getRequiredInput("Extra Hour Price");
    let notes = await getRequiredInput("Notes");

    rateCards.push([
      booking_type,
      shift_type,
      return_journey,
      start_time,
      end_time,
      extra_hour_price,
      notes,
    ]);

    let addMore = await askQuestion("➕ Add another Rate Card? (yes/done to finish): ");
    if (addMore.toLowerCase() === "done") break;
  }

  if (rateCards.length > 0) {
    await db.query(
      "INSERT INTO rate_card (booking_type, shift_type, return_journey, start_time, end_time, extra_hour_price, notes) VALUES ?",
      [rateCards]
    );
    console.log("✅ Rate card details inserted successfully!\n");
  }
};


// Main function
const main = async () => {
  const db = await connect_database();

  console.log("🚀 Welcome to the Owner & Rate Card Entry CLI!");
  console.log("=================================================");

  await insertOwnerDetails(db);
  await insertRateCard(db);

  console.log("\n🎉 Data Entry Completed! Exiting...");
  // rl.close();
};

const migrateDatabase = async (pool) => {
  try {
    // Check if any tables exist
    const [rows] = await pool.query("SHOW TABLES;");

    if (rows.length === 0) {
      console.log("No tables found. Running migration...");

      // Read the SQL file properly
      const sql = fs.readFileSync("whatsapp_cab_bot.sql", "utf8");

      // Execute the SQL file properly, handling multiple statements
      await pool.query(sql);

      console.log("Migration completed successfully!");
    } else {
      console.log("Database already migrated.");
    }
  } catch (e) {
    console.error("Migration failed:", e);
  }
};

// // Call the function to connect and migrate
// connect_database();

connect_database().then(async (con) => {
  await user_db.set_user_db_connection(con);
  await user_ride_db.set_user_ride_db_connection(con);
  await owner_db.set_owner_db_connection(con);
  await rate_card_db.set_rate_card_db_connection(con);

  // Run the CLI application
  main();
});

const client = new Client({
  puppeteer: {
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
  authStrategy: new LocalAuth(),
});

client.on("loading_screen", (percent, message) => {
  console.log("LOADING SCREEN", percent, message);
});

client.on("authenticated", () => {
  console.log("AUTHENTICATED");
});

client.on("auth_failure", (msg) => {
  // Fired if session restore was unsuccessful
  console.error("AUTHENTICATION FAILURE", msg);
});

client.on(
  "qr",
  async (qr) => {
    // Generate and scan this code with your phone
    console.log("QR RECEIVED", qr);
    await qrcode.generate(qr, { small: true });
  },
  (error) => {
    console.log(error);
  }
);

client.on(
  "ready",
  async () => {
    console.log("Client is ready!");

    owner_db.fetch_owners().then(async (data) => {
      for (owner in data) {
        owners.push(data[owner].owner_whatsapp_no);
      }
 
    });

    cron.schedule("*/1 * * * *", async () => {
     

      let ride_data = await user_ride_db.fetch_not_confirmed_rides();

      for (const r_data of ride_data) {
        // Use for...of to properly handle async operations
        let registeredTime = new Date(r_data.registered_datetime); // Ensure it's a Date object
        let currentTime = new Date();
        let hours = Math.abs(currentTime - registeredTime) / 36e5; // Calculate time difference in hours

        if (hours >= 1) {
          console.log(
            `Status Deleted for ${
              r_data.user_whatsapp_no
            } (Time diff: ${hours.toFixed(2)} hours)`
          );

          try {
            await SendRideConfirmedMessageToOwner(r_data.user_whatsapp_no);
            await user_ride_db.set_ride_completed(r_data.user_whatsapp_no);
            await user_db.updateUserState(r_data.user_whatsapp_no, 1);

            let number_format = `${r_funcs.extract_integer(
              r_data.user_whatsapp_no
            )}@c.us`;
            await client.sendMessage(
              number_format,
              "Your Ride is Completed By BookMyDriver"
            );
          } catch (error) {
            console.error(
              `Error processing ride for ${r_data.user_whatsapp_no}:`,
              error
            );
          }
        }
      }
    });
  },
  (error) => {
    console.log(error);
  }
);

const SendAllConfirmedBookingsToOwner = async (
  owner_whatsapp_no,
  client_number = null
) => {
  let number_format = `${r_funcs.extract_integer(owner_whatsapp_no)}@c.us`;

  let ride_data = undefined;

  if (client_number != null) {
    ride_data = await user_ride_db.fetch_confimed_client_ride(client_number);
  } else {
    ride_data = await user_ride_db.fetch_confimed_rides();
  }

  if (ride_data.length == 0) {
    await client.sendMessage(number_format, "*No Ride Found!*");
  } else {
    await client.sendMessage(number_format, "*--------------------*");
    await client.sendMessage(number_format, "*All Ride Confirmed!*");
    for (confirmed_ride in ride_data) {
      let dn = null;
      if (ride_data[confirmed_ride].day_or_night == null) {
        dn = "NA";
      } else if (ride_data[confirmed_ride].day_or_night == 1) {
        dn = "Day";
      } else {
        dn = "Night";
      }

      let local_or_outstation = null;
      if (ride_data[confirmed_ride].local_or_outstation == 1) {
        local_or_outstation = "Local";
      } else {
        local_or_outstation = "Outstation";
      }

      let oneway_or_return = null;
      if (ride_data[confirmed_ride].oneway_or_return == 1) {
        oneway_or_return = "Oneway";
      } else {
        oneway_or_return = "Return";
      }

      let date_time =
        String(
          moment.utc(ride_data[confirmed_ride].ride_date).format("DD/MM/YYYY")
        ) +
        " " +
        ride_data[confirmed_ride].ride_time;

      ride_data[confirmed_ride].pickup_location = await ed.decode_ed(
        ride_data[confirmed_ride].pickup_location
      );
      ride_data[confirmed_ride].drop_location = await ed.decode_ed(
        ride_data[confirmed_ride].drop_location
      );

      await user_db
        .isUserExists(ride_data[confirmed_ride].user_whatsapp_no)
        .then(async (user_data) => {
          // await client.sendMessage(number_format, user_data[0].user_fullname);
          let confirmed_msg = `Name: ${user_data[0].user_fullname} \nNumber: ${user_data[0].user_whatsapp_no} \nPick Up Address: ${ride_data[confirmed_ride].pickup_location} \nDrop Address: ${ride_data[confirmed_ride].drop_location} \n${dn} ${date_time} \n${local_or_outstation} : ${oneway_or_return} \n*Ride Confirmed!*  `;
          await client.sendMessage(number_format, confirmed_msg);
        });
    }
    await client.sendMessage(number_format, "*End Ride Confirmed!*");
    await client.sendMessage(number_format, "*--------------------*");
  }
};

const SendRideConfirmedMessageToOwner = async (client_whatsapp_no) => {
  await user_db.isUserExists(client_whatsapp_no).then(async (result) => {
    let user_data = result[0];
    await owner_db.fetch_owners().then(async (data) => {
      let ride_data = await user_ride_db.get_user_ride_confirmed(
        client_whatsapp_no
      );

      if (ride_data.length == 0) {
        return;
      }

      let dn = null;
      if (ride_data[0].day_or_night == null) {
        dn = "NA";
      } else if (ride_data[0].day_or_night == 1) {
        dn = "Day";
      } else {
        dn = "Night";
      }

      let local_or_outstation = null;
      if (ride_data[0].local_or_outstation == 1) {
        local_or_outstation = "Local";
      } else {
        local_or_outstation = "Outstation";
      }

      let oneway_or_return = null;
      if (ride_data[0].oneway_or_return == 1) {
        oneway_or_return = "Oneway";
      } else {
        oneway_or_return = "Return";
      }
      let date_time =
        String(moment.utc(ride_data[0].ride_date).format("DD/MM/YYYY")) +
        " " +
        ride_data[0].ride_time;

      for (user in data) {
        let number_format = `${r_funcs.extract_integer(
          data[user].owner_whatsapp_no
        )}@c.us`;

        let pickup_location_decoded = await ed.decode_ed(
          ride_data[0].pickup_location
        );

        let drop_location_decoded = await ed.decode_ed(
          ride_data[0].drop_location
        );

        let confirmed_msg = `Name: ${user_data.user_fullname} \nNumber: ${user_data.user_whatsapp_no} \nPick Up Address: ${pickup_location_decoded} \nDrop Address: ${drop_location_decoded} \n${dn} ${date_time} \n${local_or_outstation} : ${oneway_or_return} \n*Ride Confirmed!*  `;
        await client.sendMessage(number_format, confirmed_msg);
      }
    });
  });
};

const SendRideCancledMessageToOwner = async (client_whatsapp_no) => {
  await user_db.isUserExists(client_whatsapp_no).then(async (result) => {
    let user_data = result[0];
 
    await owner_db.fetch_owners().then(async (data) => {
      let ride_data = await user_ride_db.get_user_ride_confirmed(
        client_whatsapp_no
      );

      if (ride_data.length == 0) {
        return;
      }

      let dn = null;
      if (ride_data[0].day_or_night == null) {
        dn = "NA";
      } else if (ride_data[0].day_or_night == 1) {
        dn = "Day";
      } else {
        dn = "Night";
      }

      let local_or_outstation = null;
      if (ride_data[0].local_or_outstation == 1) {
        local_or_outstation = "Local";
      } else {
        local_or_outstation = "Outstation";
      }

      let oneway_or_return = null;
      if (ride_data[0].oneway_or_return == 1) {
        oneway_or_return = "Oneway";
      } else {
        oneway_or_return = "Return";
      }
      let date_time =
        String(moment.utc(ride_data[0].ride_date).format("DD/MM/YYYY")) +
        " " +
        ride_data[0].ride_time;

      for (user in data) {
        let number_format = `${r_funcs.extract_integer(
          data[user].owner_whatsapp_no
        )}@c.us`;

        let pickup_location_decoded = await ed.decode_ed(
          ride_data[0].pickup_location
        );

        let drop_location_decoded = await ed.decode_ed(
          ride_data[0].drop_location
        );

        let cancelled_msg = `Name: ${user_data.user_fullname} \nNumber: ${user_data.user_whatsapp_no} \nPick Up Address: ${pickup_location_decoded} \nDrop Address: ${drop_location_decoded} \n${dn} ${date_time} \n${local_or_outstation} : ${oneway_or_return} \n*Ride Cancelled!*  `;
        await client.sendMessage(number_format, cancelled_msg);
      }
    });
  });
};

client.on("message", async (msg) => {

  // automation for personal chat
  if (msg.type === "chat") {
    const message = msg.body.toLowerCase();
    let user_whatsapp_no = "+" + r_funcs.extract_integer(msg.from);

    owner_number = owners.indexOf(user_whatsapp_no);


    if (owner_number != -1) {


      let current_owner_number = owners[owner_number];
      let number_format = `${r_funcs.extract_integer(
        current_owner_number
      )}@c.us`;


      let command = message.replace(/ /g, "").split(",");

      if (chat_init_msg.includes(message)) {
        await client.sendMessage(number_format, admin_state.admin_menu());
      } else if (message == "show booking" || message == "show bookings") {
        await SendAllConfirmedBookingsToOwner(number_format);
      } else if (command.length == 2) {
        let customer_number = command[1];

        if (customer_number.length != 12) {
          await client.sendMessage(
            number_format,
            "Please Enter Valid Number with Country Code (91) in Prefix"
          );
        } else if (
          command[0] == "showbooking" ||
          command[0] == "showbookings"
        ) {
          await SendAllConfirmedBookingsToOwner(
            number_format,
            `+${customer_number}`
          );
        } else if (command[0] == "complete") {
          let ride_data = await user_ride_db.fetch_confimed_client_ride(
            `+${customer_number}`
          );
     
          if (ride_data.length > 0) {
            if (ride_data[0].ride_status == 2) {
              await user_ride_db.set_ride_completed(`+${customer_number}`);
              let customer_number_format = `${r_funcs.extract_integer(
                customer_number
              )}@c.us`;

              await client.sendMessage(
                number_format,
                "Customer Ride Status Updated From *Pending* to *Completed* !"
              );
              await client.sendMessage(customer_number_format, "Thank you!");
            } else {
              // not working because in data the ride_status is 2 so if no data is coming No ride found is executing
              await client.sendMessage(
                number_format,
                "Ride Already Completed !"
              );
            }
          } else {
            await client.sendMessage(number_format, "*No Ride Found!*");
          }
        }
      }

      // else if (message == 'show bookings' || message == 'show booking') {

      // }
    } else if (chat_init_msg.includes(message)) {

      await user_db.isUserExists(user_whatsapp_no).then(async (result) => {
        if (result.length < 1) {
          await user_db.registerUser(user_whatsapp_no);
          client.sendMessage(msg.from, user_state.user_state_0());
        } else {
          if (result[0].user_fullname === null) {
            client.sendMessage(msg.from, user_state.user_state_0());
          } else {
            let user_ride_data = await user_ride_db.get_user_ride_confirmed(
              user_whatsapp_no
            );
       
            if (user_ride_data.length > 0) {
              client.sendMessage(msg.from, user_state.user_menu());
            } else {
              // client.sendMessage(msg.from, user_state.user_menu());
              let user_data = result[0];
              if (user_data.user_state == 0) {
                client.sendMessage(msg.from, user_state.user_state_0());
              } else if (user_data.user_state == 1) {
                client.sendMessage(
                  msg.from,
                  user_state.user_state_1(user_data.user_fullname)
                );
              } else if (user_data.user_state == 2) {
                client.sendMessage(msg.from, user_state.user_state_2());
              } else if (user_data.user_state == 3) {
                client.sendMessage(msg.from, user_state.user_state_3());
              } else if (user_data.user_state == 4) {
                client.sendMessage(msg.from, user_state.user_state_4());
              } else if (user_data.user_state == 5) {
                client.sendMessage(msg.from, user_state.user_state_5());
              } else if (user_data.user_state == 6) {
                client.sendMessage(msg.from, user_state.user_state_6());
              } else if (user_data.user_state == 7) {
                client.sendMessage(msg.from, user_state.user_state_7());
              } else if (user_data.user_state == 8) {
                client.sendMessage(msg.from, user_state.user_state_8());
              } else if (user_data.user_state == 9) {
                client.sendMessage(msg.from, user_state.user_state_9());
              } else if (user_data.user_state == 10) {
                client.sendMessage(
                  msg.from,
                  user_state.user_state_10(user_data.user_whatsapp_no)
                );
              } else if (user_data.user_state == 11) {
                client.sendMessage(msg.from, user_state.user_state_11());
              } else if (user_data.user_state == 12) {
                client.sendMessage(msg.from, user_state.user_state_12());
              } else if (user_data.user_state == 13) {
                client.sendMessage(msg.from, user_state.user_state_13());
              }

              client.sendMessage(msg.from, user_state.user_menu());
            }
          }
        }
      });
    } else {
      await user_db.isUserExists(user_whatsapp_no).then(async (result) => {
        if (result.length == 1) {
          let user_data = result[0];

          if (msg.body.toLowerCase() == "cancel") {
            try {
              await SendRideCancledMessageToOwner(user_whatsapp_no);
            } catch {}
            await user_ride_db.cancle_ride_booking(user_whatsapp_no);
            await user_db.updateUserState(user_whatsapp_no, 1);

            let ride_data = await user_ride_db.get_user_ride(user_whatsapp_no);

            if (
              ride_data[0].ride_status == 1 ||
              ride_data[0].ride_status == 2
            ) {
              await client.sendMessage(
                msg.from,
                "Your Ride is Cancelled Successfully!"
              );
            } else {
              await client.sendMessage(msg.from, "No Ride Found!");
            }

            // client.sendMessage(
            //   msg.from,
            //   'Your Ride is Cancelled Successfully!'
            // );
          } else if (msg.body.toLowerCase() == "menu") {
            client.sendMessage(msg.from, user_state.user_menu());
          } else if (msg.body == 11) {
            let ride_data = await user_ride_db.get_user_ride_confirmed(
              user_whatsapp_no
            );
            if (ride_data.length > 0) {
              let dn = null;
              if (ride_data[0].day_or_night == null) {
                dn = "NA";
              } else if (ride_data[0].day_or_night == 1) {
                dn = "Day";
              } else {
                dn = "Night";
              }

              let local_or_outstation = null;
              if (ride_data[0].local_or_outstation == 1) {
                local_or_outstation = "Local";
              } else {
                local_or_outstation = "Outstation";
              }

              let oneway_or_return = null;
              if (ride_data[0].oneway_or_return == 1) {
                oneway_or_return = "Oneway";
              } else {
                oneway_or_return = "Return";
              }

              let date_time =
                String(
                  moment.utc(ride_data[0].ride_date).format("DD/MM/YYYY")
                ) +
                " " +
                ride_data[0].ride_time;

              let booked_ride__data_msg = `${
                user_data.user_fullname
              } \nPick Up Address: ${await ed.decode_ed(
                ride_data[0].pickup_location
              )} \nDrop Address: ${await ed.decode_ed(
                ride_data[0].drop_location
              )} \n${dn} ${date_time} \n${local_or_outstation} : ${oneway_or_return}  `;
              client.sendMessage(msg.from, booked_ride__data_msg);
            } else {
              client.sendMessage(msg.from, "No Ride Found!");
            }
          } else if (msg.body == 12) {
            let ride_data = await user_ride_db.get_user_ride(user_whatsapp_no);

            if (ride_data.length > 0) {
              await SendRideCancledMessageToOwner(user_whatsapp_no);
              await user_ride_db.cancle_ride_booking(user_whatsapp_no);
              await user_db.updateUserState(user_whatsapp_no, 1);

              if (
                ride_data[0].ride_status == 1 ||
                ride_data[0].ride_status == 2
              ) {
                await client.sendMessage(
                  msg.from,
                  "Your Ride is Cancelled Successfully!"
                );
              } else {
                await client.sendMessage(msg.from, "No Ride Found!");
              }
            } else {
              client.sendMessage(msg.from, "No Ride Found!");
            }
          }

          // save user Name
          else if (user_data.user_state == 0) {
            let name = r_funcs.titleCase(msg.body.trim());

            if (/^[A-Za-z\s]+$/.test(name) && name.length > 2) {
              await user_db.updateUserName(user_whatsapp_no, msg.body);
              await user_db.updateUserState(user_whatsapp_no, 1);
              client.sendMessage(msg.from, user_state.user_state_1(msg.body));
            } else {
              client.sendMessage(msg.from, "Please Enter Valid Name");
            }
          }

          // save user travel option local/outstation
          else if (user_data.user_state == 1) {
            if (msg.body == 1 || msg.body == 2) {
              if (msg.body == 1) {
                await user_db.updateUserState(user_whatsapp_no, 2);
                client.sendMessage(msg.from, user_state.user_state_2());
              } else {
                await user_db.updateUserState(user_whatsapp_no, 3);
                client.sendMessage(msg.from, user_state.user_state_3());
              }

              user_ride_db.register_ride(user_whatsapp_no);
              user_ride_db.set_ride_local_or_outstation(
                user_whatsapp_no,
                msg.body
              );
            } else {
              client.sendMessage(msg.from, "Please Choose Valid Option");
            }
          }

          // ask for day or night and save
          else if (user_data.user_state == 2) {
            if (msg.body == 1 || msg.body == 2) {
              await user_ride_db.set_ride_day_or_night(
                user_whatsapp_no,
                msg.body
              );
              await user_db.updateUserState(user_whatsapp_no, 3);
              client.sendMessage(msg.from, user_state.user_state_3());
            } else {
              client.sendMessage(msg.from, "Please Choose Valid Option");
            }
          } else if (user_data.user_state == 3) {
            if (msg.body == 1 || msg.body == 2) {
              await user_ride_db.set_ride_oneway_or_return(
                user_whatsapp_no,
                msg.body
              );
              await user_db.updateUserState(user_whatsapp_no, 4);
              client.sendMessage(msg.from, user_state.user_state_4());
            } else {
              client.sendMessage(msg.from, "Please Choose Valid Option");
            }
          } else if (user_data.user_state == 4) {
            if (msg.body == 1 || msg.body == 2) {
              if (msg.body == 1) {
                await rate_card_db.fetch_rate_card().then((data) => {
                  client.sendMessage(msg.from, "Rate Card :) ");
                  for (d in data) {
                    let journey_type = data[d].shift_type
                      ? "Return "
                      : "One Way";
                    let rate_card_msg = `Booking Type: ${data[d].booking_type} \nShift Type: ${data[d].shift_type} \nJourney Type: ${journey_type} \nStart Time: ${data[d].start_time} \nEnd Time: ${data[d].end_time} \nExtra Hour Price: ${data[d].extra_hour_price} \nNote: ${data[d].notes}`;
                    client.sendMessage(msg.from, rate_card_msg);
                  }
                  client.sendMessage(msg.from, user_state.user_state_4());
                });
              } else {
                await user_db.updateUserState(user_whatsapp_no, 5);
                client.sendMessage(msg.from, user_state.user_state_5());
              }
            } else {
              client.sendMessage(msg.from, "Please Choose Valid Option");
            }
          } else if (user_data.user_state == 5) {
            await user_ride_db.set_ride_pickup_location(
              user_whatsapp_no,
              msg.body
            );
            await user_db.updateUserState(user_whatsapp_no, 6);
            client.sendMessage(msg.from, user_state.user_state_6());
          } else if (user_data.user_state == 6) {
            await user_ride_db.set_ride_drop_location(
              user_whatsapp_no,
              msg.body
            );
            await user_db.updateUserState(user_whatsapp_no, 7);
            client.sendMessage(msg.from, user_state.user_state_7());
          } else if (user_data.user_state == 7) {
            if (moment(msg.body, "DD/MM/YYYY", true).isValid()) {
              let db_format_date = moment(msg.body, "DD/MM/YYYY").format(
                "YYYY/MM/DD"
              );

              if (
                r_funcs.isToday(moment(db_format_date).toDate()) ||
                r_funcs.isFuture(moment(db_format_date).toDate())
              ) {
                await user_ride_db.set_ride_date(
                  user_whatsapp_no,
                  db_format_date
                );
                await user_db.updateUserState(user_whatsapp_no, 8);
                client.sendMessage(msg.from, user_state.user_state_8());
              } else {
                client.sendMessage(msg.from, "Past Date is not Allowed!");
              }
            } else {
              client.sendMessage(
                msg.from,
                "Please Choose Valid Date : DD/MM/YYYY"
              );
            }
          } else if (user_data.user_state == 8) {
            if (moment(msg.body, "LT", true).isValid()) {
              if (
                msg.body.toLowerCase().endsWith("am") ||
                msg.body.toLowerCase().endsWith("pm")
              ) {
                let ride_data = await user_ride_db.get_user_ride(
                  user_whatsapp_no
                );

                if (r_funcs.isToday(ride_data[0].ride_date)) {
                  let convertedTime = parseFloat(
                    moment(msg.body.toUpperCase(), "hh:mm A")
                      .format("HH:mm")
                      .replace(":", ".")
                  );
                  let currentTime = parseFloat(
                    moment().format("HH:mm").toString().replace(":", ".")
                  );

                  if (convertedTime > currentTime) {
                    await user_ride_db.set_ride_time(
                      user_whatsapp_no,
                      msg.body.toUpperCase()
                    );
                    await user_db.updateUserState(user_whatsapp_no, 9);
                    client.sendMessage(msg.from, user_state.user_state_9());
                  } else {
                    client.sendMessage(
                      msg.from,
                      "The time Should be More than Present Time!"
                    );
                  }
                } else if (r_funcs.isFuture(ride_data[0].ride_date)) {
                  await user_ride_db.set_ride_time(
                    user_whatsapp_no,
                    msg.body.toUpperCase()
                  );
                  await user_db.updateUserState(user_whatsapp_no, 9);
                  client.sendMessage(msg.from, user_state.user_state_9());
                }
              } else {
                client.sendMessage(
                  msg.from,
                  "Please Choose Valid Time : HH:MM AM/PM"
                );
              }
            } else {
              client.sendMessage(
                msg.from,
                "Please Choose Valid Time : HH:MM AM/PM"
              );
            }
          } else if (user_data.user_state == 9) {
            if (msg.body == 1 || msg.body == 2) {
              if (msg.body == 1) {
                await user_ride_db.set_ride_confirm_booking(user_whatsapp_no);
                client.sendMessage(
                  msg.from,
                  user_state.user_state_10(user_data.user_fullname)
                );
                await SendRideConfirmedMessageToOwner(
                  user_data.user_whatsapp_no
                );
              } else {
                await user_db.updateUserState(user_whatsapp_no, 10);
                client.sendMessage(msg.from, user_state.user_state_11());
              }
            } else {
              if (msg.body.toLowerCase() != "cancel") {
                client.sendMessage(msg.from, "Please Choose Valid Option");
              }
            }
          } else if (user_data.user_state == 10) {
            if (
              msg.body == 1 ||
              msg.body == 2 ||
              msg.body == 3 ||
              msg.body == 4 ||
              msg.body == 5
            ) {
              if (msg.body == 1) {
                await user_db.updateUserState(user_whatsapp_no, 12);
                client.sendMessage(msg.from, user_state.user_state_12());
              } else if (msg.body == 2) {
                await user_db.updateUserState(user_whatsapp_no, 13);
                client.sendMessage(
                  msg.from,
                  user_state.user_state_13(user_data.user_fullname)
                );
              } else if (msg.body == 3) {
                client.sendMessage(
                  msg.from,
                  user_state.user_stop(user_data.user_fullname)
                );
              } else if (msg.body == 4) {
                await user_ride_db.cancle_ride_booking(user_whatsapp_no);
                await user_db.updateUserState(user_whatsapp_no, 1);
                client.sendMessage(msg.from, "Restarted!");
                client.sendMessage(
                  msg.from,
                  user_state.user_state_1(user_data.user_fullname)
                );
              } else if (msg.body == 5) {
                await user_ride_db.set_ride_confirm_booking(user_whatsapp_no);
                await user_db.updateUserState(user_whatsapp_no, 14);
                client.sendMessage(
                  msg.from,
                  user_state.user_state_10(user_data.user_fullname)
                );
                client.sendMessage(msg.from, user_state.user_menu());
                await SendRideConfirmedMessageToOwner(
                  user_data.user_whatsapp_no
                );
              }
            } else {
              client.sendMessage(msg.from, user_state.user_state_11());
            }
          } else if (user_data.user_state == 12) {
            if (msg.body == 1 || msg.body == 2) {
              await user_ride_db.set_ride_day_or_night(
                user_whatsapp_no,
                msg.body
              );
              await user_db.updateUserState(user_whatsapp_no, 10);
              client.sendMessage(msg.from, "Updated Successfully!");
              client.sendMessage(msg.from, user_state.user_state_11());
            } else {
              client.sendMessage(msg.from, "Please Choose Valid Option");
            }
          } else if (user_data.user_state == 13) {
            if (msg.body == 1 || msg.body == 2) {
              await user_ride_db.set_ride_oneway_or_return(
                user_whatsapp_no,
                msg.body
              );
              await user_db.updateUserState(user_whatsapp_no, 10);
              client.sendMessage(msg.from, "Updated Successfully!");
              client.sendMessage(msg.from, user_state.user_state_11());
            } else {
              client.sendMessage(msg.from, "Please Choose Valid Option");
            }
          }
        } else {
          // send working menu
        }
      });
    }
  }

});

client.initialize();
