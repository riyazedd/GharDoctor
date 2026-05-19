import bcrypt from "bcryptjs";

const serviceProviders = [
  {
    firstName: "Ramesh",
    lastName: "BK",
    email: "ramesh@gmail.com",
    password: bcrypt.hashSync("123456", 10),
    phone: "9801111111",
    skill: "Plumbing",
    experience: 5,
    availability: true,
    citizenshipImage: "ramesh-citizenship.jpg",
  },

  {
    firstName: "Suresh",
    lastName: "Thapa",
    email: "suresh@gmail.com",
    password: bcrypt.hashSync("123456", 10),
    phone: "9812222222",
    skill: "Electrician",
    experience: 4,
    availability: true,
    citizenshipImage: "suresh-citizenship.jpg",
  },

  {
    firstName: "Mina",
    lastName: "Shrestha",
    email: "mina@gmail.com",
    password: bcrypt.hashSync("123456", 10),
    phone: "9823333333",
    skill: "House Cleaning",
    experience: 3,
    availability: true,
    citizenshipImage: "mina-citizenship.jpg",
  },

  {
    firstName: "Hari",
    lastName: "Gurung",
    email: "hari@gmail.com",
    password: bcrypt.hashSync("123456", 10),
    phone: "9834444444",
    skill: "Painting",
    experience: 6,
    availability: false,
    citizenshipImage: "hari-citizenship.jpg",
  },

  {
    firstName: "Sabina",
    lastName: "Karki",
    email: "sabina@gmail.com",
    password: bcrypt.hashSync("123456", 10),
    phone: "9845555555",
    skill: "Gardening",
    experience: 2,
    availability: true,
    citizenshipImage: "sabina-citizenship.jpg",
  },
];

export default serviceProviders;