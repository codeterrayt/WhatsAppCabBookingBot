const user_state_0 = () => {
    return `Hello, Welcome to BookYourDriver, We ensure our best services to you. \nWhat's your Good Name?`;
}

const user_state_1 = (user_fullname) => {
    return `Hello ${user_fullname}, Nice to Meet You! \nSelect One Option \n1 - For Local  \n2 - For OutStation`;
}

const user_state_2 = ()=>{
    return `When you want to Travel? \n1 - For Day \n2 - For Night`;
}

const user_state_3 = ()=>{
    return `Choose Type of Service \n1 - For One-Way \n2 - For Return`;
}

const user_state_4 = ()=>{
    return `Would you like to know charges or Book if you know the charges \n1 - For Charges \n2 - For Booking`;
}

const user_state_5 = ()=>{
    return `Please Enter *PickUp Address*`;
}

const user_state_6 = ()=>{
    return `Please Enter *Drop Address*`;
}

const user_state_7 = ()=>{
    return `Please Enter Pick Up Date - *DD/MM/YYYY*`;
}

const user_state_8 = ()=>{
    return `Please Enter Pick Up Time - *HH:MM AM/PM*`;
}

const user_state_9 = ()=>{
    return `Please Confirm Your Booking! \n1 - For Yes \n2 - For No`;
}

const user_state_10 = (user_full_name)=>{
    return `Thank you, ${user_full_name} for Booking Will get back to you soon.\nto cancel your ride enter *Cancel*`;
}

const user_state_11 = ()=>{
    return `Please Select Option to Continue
    \n1 - When you want to travel
    \n2 - Type of Service
    \n3 - Stop
    \n4 - Restart
    \n5 - Confirm Booking`;
}

const user_stop = (user_fullname) =>{
    return `Thank you Contacting Us *${user_fullname}*, \nPlease Call us in case if you are not clear with the detail provided`;
}

const user_menu = ()=>{
    return `*Menu* \n11 -  Show Booked Ride \n12 -  Cancel Booked Ride`;
}

const user_state_12 = ()=>{
    return `When you want to Travel? \n1 -  For Day \n2 -  For Night`;
}

const user_state_13 = ()=>{
    return `Choose Type of Service \n1 -  For One-Way \n2 -  For Return`;
}

module.exports = {
    user_state_0,user_state_1,user_state_2,
    user_state_3,user_state_4,user_state_5,
    user_state_6,user_state_7,user_state_8,
    user_state_9,user_state_10,user_state_11,
    user_stop,user_state_12,user_state_13,
    user_menu
}