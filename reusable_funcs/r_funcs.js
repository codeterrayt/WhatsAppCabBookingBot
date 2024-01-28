const extract_integer = (string) => {
  var matches = string.match(/(\d+)/);
  if (matches) return matches[0];
  return 0;
};

const validate_date = (dateString) => {
  let dateformat = /^(0?[1-9]|1[0-2])[\/](0?[1-9]|[1-2][0-9]|3[01])[\/]\d{4}$/;

  // Match the date format through regular expression
  if (dateString.match(dateformat)) {
    let operator = dateString.split('/');

    // Extract the string into month, date and year
    let datepart = [];
    if (operator.length > 1) {
      pdatepart = dateString.split('/');
    }
    let month = parseInt(datepart[0]);
    let day = parseInt(datepart[1]);
    let year = parseInt(datepart[2]);

    // Create list of days of a month
    let ListofDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (month == 1 || month > 2) {
      if (day > ListofDays[month - 1]) {
        ///This check is for Confirming that the date is not out of its range
        return false;
      }
    } else if (month == 2) {
      let leapYear = false;
      if ((!(year % 4) && year % 100) || !(year % 400)) {
        leapYear = true;
      }
      if (leapYear == false && day >= 29) {
        return false;
      } else if (leapYear == true && day > 29) {
        return false;
      }
    }
  } else {
    return false;
  }
  return true;
};

function titleCase(str) {
  str = str.toLowerCase().split(' ');
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1); 
  }
  return str.join(' ');
}

function isToday(date) {
  const today = new Date();

  if (today.toDateString() === date.toDateString()) {
    return true;
  }
  return false;
}

function isFuture(future_date){
  const today = new Date();
  if (future_date > today) {
    return true;
  }
  return false;
}


module.exports = {
  extract_integer,
  validate_date,
  titleCase,
  isToday,
  isFuture
};
