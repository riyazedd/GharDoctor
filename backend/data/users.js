import bcrypt from "bcryptjs";

const users = [
  {
    firstName: "Admin",
    lastName: "User",
    email: "admin@gmail.com",
    password: bcrypt.hashSync("123456", 10),
    phone: "9800000000",
    address: "Kathmandu, Nepal",
    profileImg: "admin-profile.jpg",
    isAdmin: true,
  },

  {
    firstName: "Ram",
    lastName: "Kumar",
    email: "ram@gmail.com",
    password: bcrypt.hashSync("123456", 10),
    phone: "9811111111",
    address: "Lalitpur, Nepal",
    profileImg: "ram-profile.jpg",
    isAdmin: false,
  },

  {
    firstName: "Sita",
    lastName: "Kumari",
    email: "sita@gmail.com",
    password: bcrypt.hashSync("123456", 10),
    phone: "9822222222",
    address: "Bhaktapur, Nepal",
    profileImg: "sita-profile.jpg",
    isAdmin: false,
  },

  {
    firstName: "Hari",
    lastName: "Shrestha",
    email: "hari@gmail.com",
    password: bcrypt.hashSync("123456", 10),
    phone: "9833333333",
    address: "Pokhara, Nepal",
    profileImg: "hari-profile.jpg",
    isAdmin: false,
  },

  {
    firstName: "Gita",
    lastName: "Thapa",
    email: "gita@gmail.com",
    password: bcrypt.hashSync("123456", 10),
    phone: "9844444444",
    address: "Chitwan, Nepal",
    profileImg: "gita-profile.jpg",
    isAdmin: false,
  },
];

export default users;