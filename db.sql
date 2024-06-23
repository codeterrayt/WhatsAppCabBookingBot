-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 23, 2024 at 06:25 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `whatsappcabbooking`
--

-- --------------------------------------------------------

--
-- Table structure for table `owner_details`
--

CREATE TABLE `owner_details` (
  `o_id` int(11) NOT NULL,
  `owner_whatsapp_no` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `owner_details`
--

INSERT INTO `owner_details` (`o_id`, `owner_whatsapp_no`) VALUES
(1, '910000000000'),
(2, '910000000000');

-- --------------------------------------------------------

--
-- Table structure for table `rate_card`
--

CREATE TABLE `rate_card` (
  `r_id` int(11) NOT NULL,
  `booking_type` varchar(20) DEFAULT NULL,
  `shift_type` varchar(20) DEFAULT NULL,
  `return_journey` int(11) DEFAULT NULL,
  `start_time` varchar(20) DEFAULT NULL,
  `end_time` varchar(20) DEFAULT NULL,
  `extra_hour_price` float DEFAULT NULL,
  `notes` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rate_card`
--

INSERT INTO `rate_card` (`r_id`, `booking_type`, `shift_type`, `return_journey`, `start_time`, `end_time`, `extra_hour_price`, `notes`) VALUES
(1, 'local', 'Day', 1, '10:10 am', '10:20 pm', 99, 'Pick up drop different then extra 150rs, etc');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `u_id` int(11) NOT NULL,
  `user_fullname` varchar(50) DEFAULT NULL,
  `user_whatsapp_no` varchar(20) NOT NULL,
  `user_state` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_ride`
--

CREATE TABLE `user_ride` (
  `registered_datetime` datetime NOT NULL DEFAULT current_timestamp(),
  `r_id` int(11) NOT NULL,
  `user_whatsapp_no` varchar(20) NOT NULL,
  `local_or_outstation` int(11) DEFAULT NULL,
  `day_or_night` int(11) DEFAULT NULL,
  `oneway_or_return` int(11) DEFAULT NULL,
  `pickup_location` varchar(200) DEFAULT NULL,
  `drop_location` varchar(200) DEFAULT NULL,
  `ride_date` date DEFAULT NULL,
  `ride_time` varchar(10) DEFAULT NULL,
  `booking_confirmed` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `owner_details`
--
ALTER TABLE `owner_details`
  ADD PRIMARY KEY (`o_id`);

--
-- Indexes for table `rate_card`
--
ALTER TABLE `rate_card`
  ADD PRIMARY KEY (`r_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`u_id`);

--
-- Indexes for table `user_ride`
--
ALTER TABLE `user_ride`
  ADD PRIMARY KEY (`r_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `owner_details`
--
ALTER TABLE `owner_details`
  MODIFY `o_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `rate_card`
--
ALTER TABLE `rate_card`
  MODIFY `r_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `u_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `user_ride`
--
ALTER TABLE `user_ride`
  MODIFY `r_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
