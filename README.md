# WhatsApp Cab Booking Bot 🚗✨

WhatsApp Cab Booking Bot is a Node.js project designed for booking cabs from WhatsApp. It includes two sections: one for users who can book cabs via chat on WhatsApp, and another for owners who can use commands to confirm, cancel, or view all bookings.

## User Section

Users can effortlessly book cabs via chat on the WhatsApp bot by selecting available options, making the cab booking process more user-friendly.

## Owner Section

Owners are equipped with specific commands that can be sent as messages to the WhatsApp bot, enabling them to manage bookings efficiently. The available commands include:


#### Owner Commands

- **Show Single Bookings:**
  - Command: `"show booking"` or  `"show bookings"`
  - Description: View a list of all current bookings.

- **Mark Booking as Complete:**
  - Command: `"complete"`
  - Description: Mark a booking as complete, indicating that the service has been provided.
  
  
Additionally, other commands are option-based and can be selected as needed:

- **Option-based Commands:**
  - Owners can choose from a set of options provided by the bot for specific actions.

Owners can use these commands to interact with the WhatsApp bot and stay informed about bookings or mark them as completed.




## User Booking Process Flow

0. **Ask for Name and Save**
   - Gather user information and save the name.

1. **Ask for Local or Outstation**
   - Prompt the user to choose between a local or outstation ride.

2. **Ask for Day or Night**
   - Inquire whether the user prefers a day or night journey.

3. **Ask for One-way or Return:**
    - 1: Proceed to Step 5 for one-way details.
    - 2: Move to Step 4 for return journey details.

4. **Ask for Charges/Booking:**
    - 1: Display the rate card to the user.
    - 2: Continue to Step 5 to finalize the booking.

5. **Ask for Pickup Location**
   - Collect information about the pickup location.

6. **Ask for Drop Location**
   - Obtain details about the drop-off location.

7. **Ask for Date**
   - Prompt the user to specify the date of the ride.

8. **Ask for Time**
   - Inquire about the preferred time for the journey.

9. **Confirm the Booking:**
    - 1: Proceed to Step 10 for confirmation and thank you message.
    - 2: Move to Step 11 to select additional options.

10. **Thank You Message and "Cancel" Option**
    - Express gratitude to the user and provide an option to cancel the booking.

11. **Select Option:**
    - 1: Go back to Step 2 and ask for day or night again.
    - 2: Proceed to Step 3 and ask for the type of service.
    - 3: Reset the state, stop the booking, and send a thank you message.
    - 4: Restart the process, reset the state, and send the initial message from Step 1.


## Booking Confirmation Process

When a user books a cab, the system follows a confirmation process involving the owner. The booking goes through the following stages:

1. **User Books Cab:**
   - User completes the booking process.

2. **Message Sent to Owner:**
   - The system automatically sends a message to the owner informing them about the new booking.

3. **Owner Confirmation:**
   - Owner reviews the booking details.
   - If the owner confirms the booking, the cab is marked as  booked.
   - If the owner does not confirm, the booking remains in a pending phase.
   - if the owner reject the booking, its marked as Cancelled

This confirmation process ensures that the cab is only fully booked when the owner confirms the user's booking request.



### Cab Status

1 - PENDING
2 - CONFIRMED
3 - CANCELLED 
4 - COMPLETED

### Scan the QR Code: 
Scan the displayed QR code with your WhatsApp mobile app.

---


### Technologies and Dependencies

This project utilizes the following technologies and dependencies:

- `whatsapp-web.js`: Library for interacting with WhatsApp Web. [GitHub Repository](https://github.com/pedroslopez/whatsapp-web.js)
- `qrcode`: Library for generating QR codes for authentication.
- `axios`: Promise-based HTTP client for making requests.
- `user_db`: ORM module for managing user data.
- `user_ride_db`: ORM module for handling user ride information.
- `owner_db`: ORM module for managing owner data.
- `rate_card_db`: ORM module for rate card information.
- `user_state`: Module for managing user state in the booking process.
- `r_funcs`: Reusable functions for various functionalities.
- `ed`: Encoder and decoder module for encoding and decoding messages.
- `moment`: Library for parsing, validating, manipulating, and displaying dates.
- `dotenv`: Module for loading environment variables from a `.env` file.
- `mysql2`: Promise-based MySQL library for database interactions.
- `node-cron`: Module for scheduling cron jobs in Node.js.
- `format` (from `mysql2/promise`): Function for SQL query formatting.
- `admin_state`: Module for managing the state of the admin.


## Installation Guide

### Prerequisites

- Node.js installed on your machine.

### Clone the Repository

```bash
git clone https://github.com/codeterrayt/WhatsAppCabBookingBot.git
cd WhatsAppCabBookingBot
```

### Install Dependencies
```bash 
npm install
 ```
### Run Project 
```bash 
node index.js
```
### Scan the QR Code: 
Scan the displayed QR code with your WhatsApp mobile app.

---

**WhatsApp Cab Booking Bot**


Feel free to contribute to the project by submitting issues or pull requests.

Happy cab booking! 🚗✨
