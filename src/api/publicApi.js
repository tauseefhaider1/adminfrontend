import axios from "axios";

// basic axios setup for public endpoints
// no auth needed here
const publicApi = axios.create({
  baseURL: "http://localhost:4534/api",
  // might need to change this later when we deploy
});

export default publicApi;