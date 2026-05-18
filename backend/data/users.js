import bcrypt from "bcryptjs";

const users = [
  {
    firstName: "Admin",
    lastName: "User",
    email: "admin@gmail.com",
    password: bcrypt.hashSync("123456", 10),
    phone: "9800000000",
    address: "Kathmandu, Nepal",
    citizenshipImg: "admin-citizenship.jpg",
    isAdmin: true,
  },

  {
    firstName: "Ram",
    lastName: "Kumar",
    email: "ram@gmail.com",
    password: bcrypt.hashSync("123456", 10),
    phone: "9811111111",
    address: "Lalitpur, Nepal",
    citizenshipImg: "ram-citizenship.jpg",
    isAdmin: false,
  },

  {
    firstName: "Sita",
    lastName: "Kumari",
    email: "sita@gmail.com",
    password: bcrypt.hashSync("123456", 10),
    phone: "9822222222",
    address: "Bhaktapur, Nepal",
    citizenshipImg: "sita-citizenship.jpg",
    isAdmin: false,
  },

  {
    firstName: "Hari",
    lastName: "Shrestha",
    email: "hari@gmail.com",
    password: bcrypt.hashSync("123456", 10),
    phone: "9833333333",
    address: "Pokhara, Nepal",
    citizenshipImg: "hari-citizenship.jpg",
    isAdmin: false,
  },

  {
    firstName: "Gita",
    lastName: "Thapa",
    email: "gita@gmail.com",
    password: bcrypt.hashSync("123456", 10),
    phone: "9844444444",
    address: "Chitwan, Nepal",
    citizenshipImg: "gita-citizenship.jpg",
    isAdmin: false,
  },
];

export default users;